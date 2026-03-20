// Traffic controller API Endpoint
// Connect frontend form submission to createpet controller

const express = require("express");
const { 
    createPet,
    getPets,
    getPet,
    deletePet,
    updatePet,
    restorePet,
    hardDeletePet
} = require("../middleware/petController.js");

// router object
const router = express.Router();

// Pet Routes

// GET all pets
router.get('/pets', getPets)

// GET single pet
router.get('/pets/:id', getPet)
router.get('/:id', getPet)

// POST request to /pets? Call createpet function
router.post("/pets", createPet)

// DELETE pet (soft delete)
router.delete('/pets/:id', deletePet)
router.delete('/:id', deletePet)

// RESTORE pet (undo soft delete)
router.patch('/pets/:id/restore', restorePet)
router.patch('/:id/restore', restorePet)

// DELETE pet permanently (hard delete)
router.delete('/pets/:id/hard', hardDeletePet)
router.delete('/:id/hard', hardDeletePet)

// UPDATE pet
router.patch('/pets/:id', updatePet)
router.patch('/:id', updatePet)

module.exports = router;