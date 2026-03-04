import { useState } from "react"
import "./PetModal.css"

// Parameters from Home
const PetModal = ({ pet, onClose, onUpdate }) => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [editData, setEditData] = useState({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        dateOfBirth: pet.dateOfBirth?.split('T')[0] || '',
        notes: pet.notes || ''
    })
    const [isLoading, setIsLoading] = useState(false)

    if (!pet) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'weight' ? parseFloat(value) || '' : value
        }))
    }

    const handleSave = async () => {
        if (!editData.name || !editData.species || !editData.breed || !editData.age || !editData.weight || !editData.dateOfBirth) {
            alert('Please fill in all required fields')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:5000/api/${pet._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            })

            if (response.ok) {
                const updatedPet = await response.json()
                console.log('Pet updated successfully:', updatedPet)
                setIsEditMode(false)
                if (onUpdate) {
                    onUpdate(updatedPet.pet || updatedPet)
                }
            } else {
                alert('Failed to update pet')
            }
        } catch (error) {
            console.error('Error updating pet:', error)
            alert('Error updating pet')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setEditData({
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            dateOfBirth: pet.dateOfBirth?.split('T')[0] || '',
            notes: pet.notes || ''
        })
        setIsEditMode(false)
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:5000/api/${pet._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                console.log('Pet deleted successfully')
                onClose()
                if (onUpdate) {
                    onUpdate(null)
                }
            } else {
                alert('Failed to delete pet')
            }
        } catch (error) {
            console.error('Error deleting pet:', error)
            alert('Error deleting pet')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Prevent click from bubbling */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                {isEditMode ? (
                    <>
                        <h2>Edit Pet</h2>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleInputChange}
                                    placeholder="Pet name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Species *</label>
                                <select name="species" value={editData.species} onChange={handleInputChange}>
                                    <option value="">Select species</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="bird">Bird</option>
                                    <option value="rabbit">Rabbit</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Breed *</label>
                                <input
                                    type="text"
                                    name="breed"
                                    value={editData.breed}
                                    onChange={handleInputChange}
                                    placeholder="Breed"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Age (years) *</label>
                                <input
                                    type="number"
                                    name="age"
                                    step="0.1"
                                    value={editData.age}
                                    onChange={handleInputChange}
                                    placeholder="Age"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Weight (kg) *</label>
                                <input
                                    type="number"
                                    name="weight"
                                    step="0.1"
                                    value={editData.weight}
                                    onChange={handleInputChange}
                                    placeholder="Weight"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Date of Birth *</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={editData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={editData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional notes"
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button 
                                className="btn-cancel" 
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-save" 
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>{pet.name}</h2>
                        
                        <div className="modal-body">
                            <div className="info-row">
                                <span className="info-label">Species:</span>
                                <span className="info-value">{pet.species}</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">Breed:</span>
                                <span className="info-value">{pet.breed}</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">Age:</span>
                                <span className="info-value">{pet.age} years</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">Weight:</span>
                                <span className="info-value">{pet.weight} kg</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">Date of Birth:</span>
                                <span className="info-value">{formatDate(pet.dateOfBirth)}</span>
                            </div>
                            
                            {pet.notes && (
                                <div className="info-row">
                                    <span className="info-label">Notes:</span>
                                    <span className="info-value">{pet.notes}</span>
                                </div>
                            )}
                        </div>

                        <button className="btn-edit" onClick={() => setIsEditMode(true)}>Edit Pet</button>
                        <button className="btn-delete" onClick={handleDelete}>Delete Pet</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PetModal;
