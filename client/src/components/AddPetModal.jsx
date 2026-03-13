import { useState } from "react"
import axios from "axios"
import "./PetModal.css"

const AddPetModal = ({ onClose, onPetAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        species: "dog",
        breed: "",
        age: "",
        weight: "",
        notes: "",
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const response = await axios.post(
                "http://localhost:5000/api/pets",
                formData
            )
            setMessage("Pet record created successfully!")
            console.log("Pet created:", response.data)
            
            // Call the callback to add pet to the list
            if (onPetAdded) {
                onPetAdded(response.data.pet || response.data)
            }

            // Reset form
            setFormData({
                name: "",
                species: "dog",
                breed: "",
                age: "",
                weight: "",
                notes: "",
            })

            // Close modal after 1.5 seconds
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown error"
            setMessage("Error creating pet record: " + errorMsg)
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2>Add New Pet</h2>

                {message && (
                    <p className={message.includes("Error") ? "error-message" : "success-message"}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Pet Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter pet name"
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
                            placeholder="Enter breed"
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

                    <div className="form-buttons">
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Add Pet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddPetModal
