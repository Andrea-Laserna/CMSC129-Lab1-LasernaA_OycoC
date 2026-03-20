// Middleware runs between req coming in and res going out
// Saves pet to MongoDB and return created pet
// Handle errors with try catch

const Pet = require("../models/Pet.js")
const mongoose = require('mongoose')
const { isPrimaryAlive, getBackupDB, tryImmediateFailback } = require("../config/db")

/*
    Built into Express.js
    Every time someone makes an API call, express passes these 2 obj:
    req = request from client (REACT form)
    res = response to client 
*/

// Lazy-initialize the mongoose Pet model on the backup connection
let _BackupPet = null;
const getBackupPet = () => {
  if (_BackupPet) return _BackupPet;   // Reuse cached model if already registered
  const backupDB = getBackupDB();      // Get the backup connection from db.js
  if (!backupDB) return null;          // Backup not connected; return null
  try {
    _BackupPet = backupDB.model("Pet");              // Reuse model if already registered on this connection
  } catch {
    _BackupPet = backupDB.model("Pet", Pet.schema);  // Register the Pet schema on the backup connection
  }
  return _BackupPet;
};

// Returns the active model: primary when healthy, backup during failover
const getActivePet = () => {
  if (isPrimaryAlive()) return Pet;    // Primary is up — use the default mongoose Pet model
  const backup = getBackupPet();       // Primary is down — fetch the backup-bound Pet model
  if (!backup) throw new Error("No database available"); // Neither DB is reachable
  return backup;
};

// Mirror a saved document to backup using exact replace (preserves all fields/timestamps)
const syncToBackup = async (doc) => {
  try {
    const backupDB = getBackupDB();
    if (!backupDB) return;              // Skip sync if backup is not connected
    await backupDB.collection("pets").replaceOne(
      { _id: doc._id },                // Match by document ID
      doc.toObject ? doc.toObject() : doc, // Convert Mongoose document to plain object if needed
      { upsert: true }                 // Insert if not present, replace if it exists
    );
    console.log("Backup database synchronized");
  } catch (error) {
    console.error("Warning: Failed to sync to backup:", error.message);
  }
};

// Remove a document from backup when a hard delete happens on primary
const removeFromBackup = async (id) => {
  try {
    const backupDB = getBackupDB();
    if (!backupDB) return;
    await backupDB.collection("pets").deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    console.log("Backup hard delete synchronized");
  } catch (error) {
    console.error("Warning: Failed to sync hard delete to backup:", error.message);
  }
};

// GET ALL PETS
const getPets = async (req, res) => {
  try {
    const { deleted, includeDeleted } = req.query;
    let filter = { isDeleted: false };

    if (deleted === "true") {
      filter = { isDeleted: true }; // Restore bin view
    } else if (includeDeleted === "true") {
      filter = {}; // Optional full list mode
    }

    const pets = await getActivePet().find(filter).sort({ createdAt: -1 });
    res.status(200).json({ pets });
  } catch (error) {
    console.error("GetPets Error:", error.message);
    res.status(500).json({ error: "Database unavailable" });
  }
}

// GET SINGLE PET
const getPet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such pet" });
  }

  try {
    const pet = await getActivePet().findById(id);

    if (!pet || pet.isDeleted) {
      return res.status(404).json({ error: "No such pet" });
    }

    res.status(200).json({ pet });
  } catch (error) {
    console.error("GetPet Error:", error.message);
    res.status(500).json({ error: "Database unavailable" });
  }
}

// CREATE PET
const createPet = async (req, res) => {
  try {
    // Extract form data from React form submission
    const { name, species, breed, age, weight, notes } = req.body;

    // Validation: All required fields are filled
    if (!name || !species || !breed || !age || !weight) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const savedPet = await getActivePet().create({
      name,
      species,
      breed,
      age,
      weight,
      notes: notes || "",
    });

    // Sync to backup only when primary is active (backup mirrors primary)
    if (isPrimaryAlive()) {    // Skip sync during failover — backup is already the active DB
      await syncToBackup(savedPet);
    } else {
      // While backup is active, attempt immediate failback in case primary just came back
      void tryImmediateFailback();
    }

    res.status(201).json({
      message: "Pet record created successfully",
      pet: savedPet,
    });
  } catch (error) {
    console.error("CreatePet Error:", error.message);
    res.status(500).json({ message: error.message || "Error creating pet record" });
  }
};

// DELETE PET (Soft Delete)
const deletePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such pet" });
  }

  try {
    const pet = await getActivePet().findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ error: "No such pet" });
    }

    // Sync to backup only when primary is active
    if (isPrimaryAlive()) {    // Skip sync during failover — backup is already the active DB
      await syncToBackup(pet);
    } else {
      // While backup is active, attempt immediate failback in case primary just came back
      void tryImmediateFailback();
    }

    res.status(200).json({ message: "Pet record deleted successfully", pet });
  } catch (error) {
    console.error("DeletePet Error:", error.message);
    res.status(500).json({ error: "Error deleting pet" });
  }
}

// UPDATE PET
const updatePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such pet" });
  }

  try {
    const pet = await getActivePet().findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ error: "No such pet" });
    }

    // Sync to backup only when primary is active
    if (isPrimaryAlive()) {    // Skip sync during failover — backup is already the active DB
      await syncToBackup(pet);
    } else {
      // While backup is active, attempt immediate failback in case primary just came back
      void tryImmediateFailback();
    }

    res.status(200).json({ pet });
  } catch (error) {
    console.error("UpdatePet Error:", error.message);
    res.status(500).json({ error: "Error updating pet" });
  }
}

// RESTORE PET (Undo Soft Delete)
const restorePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such pet" });
  }

  try {
    const pet = await getActivePet().findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ error: "No soft-deleted pet found" });
    }

    if (isPrimaryAlive()) {
      await syncToBackup(pet);
    } else {
      // While backup is active, attempt immediate failback in case primary just came back
      void tryImmediateFailback();
    }

    res.status(200).json({ message: "Pet restored successfully", pet });
  } catch (error) {
    console.error("RestorePet Error:", error.message);
    res.status(500).json({ error: "Error restoring pet" });
  }
}

// HARD DELETE PET (Permanent Delete)
const hardDeletePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such pet" });
  }

  try {
    const pet = await getActivePet().findByIdAndDelete(id);

    if (!pet) {
      return res.status(404).json({ error: "No such pet" });
    }

    if (isPrimaryAlive()) {
      await removeFromBackup(id);
    } else {
      // While backup is active, attempt immediate failback in case primary just came back
      void tryImmediateFailback();
    }

    res.status(200).json({ message: "Pet permanently deleted", pet });
  } catch (error) {
    console.error("HardDeletePet Error:", error.message);
    res.status(500).json({ error: "Error permanently deleting pet" });
  }
}

module.exports = {
  getPets,
  getPet,
  createPet,
  deletePet,
  updatePet,
  restorePet,
  hardDeletePet
};
