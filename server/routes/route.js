// Traffic controller API Endpoint
// Connect frontend form submission to createpet controller

const express = require("express");
const { 
    createPet,
    getPets,
    getPet,
    deletePet,
    updatePet
} = require("../middleware/petController.js");

// router object
const router = express.Router();

// Pet Routes

// GET all pets
router.get('/pets', getPets)

// GET single pet
router.get('/:id', getPet)

// POST request to /pets? Call createpet function
router.post("/pets", createPet)

// DELETE pet
router.delete('/:id', deletePet)

// UPDATE pet
router.patch('/:id', updatePet)

module.exports = router;