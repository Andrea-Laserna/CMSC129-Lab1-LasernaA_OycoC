// REACT Component - form users interact with to create pet records

import { useState } from "react"   // Manage form data and loading/message states
import axios from "axios"          // Sends data HTTP request to backend instead of fetch

const AddPet = () => {
// Store pet input fields
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);  // Disable button while submitting : Creating...
  const [message, setMessage] = useState("");     // Success message

// Update form data when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,    // form title: userinput value
    }));
  };

// Sends data to backend via axios POST req
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/pets",
        formData
      );
      setMessage("Pet record created successfully!");
      console.log("Pet created:", response.data);
      // Reset form
      setFormData({
        name: "",
        species: "dog",
        breed: "",
        age: "",
        weight: "",
        notes: "",
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      setMessage("Error creating pet record: " + errorMsg);
      console.error("Error:", error);
    } finally {
      // Reenable button
      setLoading(false);
    }
  };

  return (
    <div className="add-pet-container">
      <h2>Add New Pet</h2>
      {/* If message exists = red error, green success */}
      {message && <p className={message.includes("Error") ? "error" : "success"}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Pet Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="species">Species *</label>
          <select
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="rabbit">Rabbit</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="breed">Breed *</label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age (years) *</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg) *</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional notes about the pet..."
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Pet"}
        </button>
      </form>
    </div>
  );
};

export default AddPet;
