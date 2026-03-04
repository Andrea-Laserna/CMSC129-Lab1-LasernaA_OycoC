// MongoDB Schema

/*
    Blueprint for pet object
    Data validation before saving to database
    Getters and Setters
    Middleware and Methods: instance methods, static model methods
*/ 
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      required: true,
      enum: ["dog", "cat", "bird", "rabbit", "other"],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Module exposes to other files to use
module.exports = mongoose.model("Pet", petSchema);
