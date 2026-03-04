// Middleware runs between req coming in and res going out
// Saves pet to MongoDB and return created pet
// Handle errors with try catch

const Pet = require("../models/Pet.js")
const mongoose = require('mongoose')

/*
    Built into Express.js
    Every time someone makes an API call, express passes these 2 obj:
    req = request from client (REACT form)
    res = response to client 
*/ 

// GET ALL PETS
const getPets = async (req, res) => {
  const pets = await Pet.find({}).sort({createdAt: -1})
  res.status(201).json({pets});
}

// GET SINGLE PET
const getPet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  const pet = await Pet.findById(id)
  
  if(!pet) {
    return res.status(404).json({error: 'No such pet'})
  }

  res.status(201).json({pet});
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

    // Save to database MongoDB
    const savedPet = await newPet.save();
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

// DELETE PET
const deletePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  const pet = await Pet.findOneAndDelete({_id: id})
  
  if(!pet) {
    return res.status(404).json({error: 'No such pet'})
  }

  res.status(201).json({pet});
}

// UPDATE PET
const updatePet = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such pet'})
  }

  const pet = await Pet.findOneAndUpdate({_id: id}, {
    // Spread properties of pet
    ...req.body 
  })
  
  if(!pet) {
    return res.status(404).json({error: 'No such pet'})
  }

  res.status(201).json({pet});
}

module.exports = {
  getPets,
  getPet,
  createPet,
  deletePet,
  updatePet
};
