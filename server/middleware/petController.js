// Middleware runs between req coming in and res going out
// Saves pet to MongoDB and return created pet
// Handle errors with try catch

const Pet = require("../models/Pet.js")
const mongoose = require('mongoose')
const { getPrimaryDB, getBackupDB } = require("../config/db")

/*
    Built into Express.js
    Every time someone makes an API call, express passes these 2 obj:
    req = request from client (REACT form)
    res = response to client 
*/ 

// GET ALL PETS
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find({isDeleted: false}).sort({createdAt: -1})
    res.status(201).json({pets});
  } catch (error) {
    console.log("Primary DB failed, switching to backup")
    try {
      const backupDB = getBackupDB()
      const pets = await backupDB.collection("pets").find({isDeleted: false}).toArray()
      res.status(201).json({pets})
    } catch (backupError) {
      res.status(500).json({error: "Both databases failed"})
    }
  }
}

// GET SINGLE PET
const getPet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  try {
    const pet = await Pet.findById(id)
    
    if(!pet || pet.isDeleted) {
      return res.status(404).json({error: 'No such pet'})
    }

    res.status(201).json({pet});
  } catch (error) {
    console.log("Primary DB failed, switching to backup")
    try {
      const backupDB = getBackupDB()
      const pet = await backupDB.collection("pets").findOne({_id: new (require('mongodb')).ObjectId(id), isDeleted: false})
      
      if(!pet) {
        return res.status(404).json({error: 'No such pet'})
      }

      res.status(201).json({pet})
    } catch (backupError) {
      res.status(500).json({error: "Both databases failed"})
    }
  }
}

// CREATE PET
const createPet = async (req, res) => {
  try {
    // Extract form data from React form submission
    const { name, species, breed, age, weight, dateOfBirth, notes } = req.body;

    // Validation: All required fields are filled
    if (!name || !species || !breed || !age || !weight || !dateOfBirth) {
      return res
        .status(400) // Set HTTP status code
        .json({ message: "All required fields must be provided" }); // Send JSON back to React
    }

    // Create new pet document using MongoDB schema
    const newPet = new Pet({
      name,
      species,
      breed,
      age,
      weight,
      dateOfBirth,
      notes: notes || "", // If notes are empty -> use empty str
    });

    // Save to primary database
    const savedPet = await newPet.save();
    
    // Also save to backup database
    try {
      const backupDB = getBackupDB();
      await backupDB.collection("pets").insertOne({
        _id: savedPet._id,
        name: savedPet.name,
        species: savedPet.species,
        breed: savedPet.breed,
        age: savedPet.age,
        weight: savedPet.weight,
        dateOfBirth: savedPet.dateOfBirth,
        notes: savedPet.notes,
        isDeleted: savedPet.isDeleted,
        createdAt: savedPet.createdAt,
        updatedAt: savedPet.updatedAt,
        __v: savedPet.__v
      });
      console.log("Backup database synchronized");
    } catch (backupError) {
      console.error("Warning: Failed to write to backup database:", backupError.message);
    }
    
    // Send response
    res.status(201).json({
      message: "Pet record created successfully",
      pet: savedPet,
    });
  } catch (error) {
    console.error("CreatePet Error:", error.message); // Log error to server console
    res.status(500).json({ message: error.message || "Error creating pet record" });
  }
};

// DELETE PET (Soft Delete)
const deletePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  try {
    const pet = await Pet.findOneAndUpdate({_id: id, isDeleted: false}, {isDeleted: true}, {new: true})
    
    if(!pet) {
      return res.status(404).json({error: 'No such pet'})
    }

    // Also mark as deleted in backup database
    try {
      const backupDB = getBackupDB();
      await backupDB.collection("pets").updateOne(
        {_id: new (require('mongodb')).ObjectId(id)},
        {$set: {isDeleted: true, updatedAt: pet.updatedAt, __v: pet.__v}}
      );
      console.log("Backup database synchronized");
    } catch (backupError) {
      console.error("Warning: Failed to update backup database:", backupError.message);
    }

    res.status(201).json({message: "Pet record deleted successfully", pet});
  } catch (error) {
    console.error("DeletePet Error:", error.message);
    res.status(500).json({error: "Error deleting pet"});
  }
}

// UPDATE PET
const updatePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  try {
    const pet = await Pet.findOneAndUpdate({_id: id}, {
      // Spread properties of pet
      ...req.body 
    }, { new: true })
    
    if(!pet) {
      return res.status(404).json({error: 'No such pet'})
    }

    // Also update backup database
    try {
      const backupDB = getBackupDB();
      const updateData = {};
      if (req.body.name !== undefined) updateData.name = pet.name;
      if (req.body.species !== undefined) updateData.species = pet.species;
      if (req.body.breed !== undefined) updateData.breed = pet.breed;
      if (req.body.age !== undefined) updateData.age = pet.age;
      if (req.body.weight !== undefined) updateData.weight = pet.weight;
      if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = pet.dateOfBirth;
      if (req.body.notes !== undefined) updateData.notes = pet.notes;
      if (req.body.isDeleted !== undefined) updateData.isDeleted = pet.isDeleted;
      updateData.updatedAt = pet.updatedAt;
      updateData.__v = pet.__v;
      
      await backupDB.collection("pets").updateOne(
        {_id: new (require('mongodb')).ObjectId(id)},
        {$set: updateData}
      );
      console.log("Backup database synchronized");
    } catch (backupError) {
      console.error("Warning: Failed to update backup database:", backupError.message);
    }

    res.status(201).json({pet});
  } catch (error) {
    console.error("UpdatePet Error:", error.message);
    res.status(500).json({error: "Error updating pet"});
  }
}

module.exports = {
  getPets,
  getPet,
  createPet,
  deletePet,
  updatePet
};
