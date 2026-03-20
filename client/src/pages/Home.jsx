import { useEffect, useState } from 'react' // Fetch, Store
import "./Home.css"

// ===================== Components ===========================

// Pet card
import PetDetails from '../components/PetDetails.jsx'
// Pet info, edit, delete
import PetModal from '../components/PetModal.jsx'
// Add new pet
import AddPetModal from '../components/AddPetModal.jsx'

import leash from '../assets/leash.png'
import cat from '../assets/cat.png'

// Home component
const Home = () => {

    // useState -> Let component remember values between renders
    const [pets, setPets] = useState([])
    const [deletedPets, setDeletedPets] = useState([])
    const [selectedPet, setSelectedPet] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showBin, setShowBin] = useState(false)

    const fetchActivePets = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pets')
            const json = await response.json()
            if (response.ok) {
                setPets(json.pets || [])
            }
        } catch (error) {
            console.error("Error fetching active pets:", error)
        }
    }

    const fetchDeletedPets = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pets?deleted=true')
            const json = await response.json()
            if (response.ok) {
                setDeletedPets(json.pets || [])
            }
        } catch (error) {
            console.error("Error fetching deleted pets:", error)
        }
    }

    const refreshLists = async () => {
        await Promise.all([fetchActivePets(), fetchDeletedPets()])
    }

    // useEffect -> Run code after component renders 
    useEffect(() => {
        refreshLists()
    // Run fetchPets() only once when page loads
    }, [])


    // =================== FUNCTIONS ======================

    // updatedPet comes from PetModal set by update response or delete response
    const handlePetUpdate = (updatedPet) => {
        if (updatedPet === null) {
            setSelectedPet(null)
        } else {
            setSelectedPet(updatedPet)
        }
        refreshLists()
    }

    const handlePetAdded = (newPet) => {
        // Add the new pet to the list
        setPets(prevPets => [...prevPets, newPet])
        refreshLists()
    }

    const handleRestore = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/pets/${id}/restore`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                alert('Failed to restore pet')
                return
            }

            await refreshLists()
        } catch (error) {
            console.error('Error restoring pet:', error)
            alert('Error restoring pet')
        }
    }

    const handleHardDeleteFromBin = async (id) => {
        if (!window.confirm('Permanently delete this pet from bin? This cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`http://localhost:5000/api/pets/${id}/hard`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                alert('Failed to permanently delete pet')
                return
            }

            await refreshLists()
        } catch (error) {
            console.error('Error permanently deleting pet:', error)
            alert('Error permanently deleting pet')
        }
    }

    return (
        <div className="home">
            <img src={leash} className="leash" alt="Leash" />
            <h1>My Pet Inventory</h1>

            <div className="pets">
                {/* Only if we have values, we loop */}
                {pets && pets.length > 0 ? (
                    // For each item in the map, we call it pet
                    pets.map((pet) => (
                        <div 
                            key={pet._id} 
                            onClick={() => setSelectedPet(pet)}
                        >
                            <PetDetails pet={pet} />
                        </div>
                    ))
                ) : (
                    <p>No pets added yet.</p>
                )}
            </div> 
            
            <button className="cta-button" onClick={() => setShowAddModal(true)}>Add Pet</button>
            <button className="cta-button" onClick={() => setShowBin(prev => !prev)}>
                {showBin ? 'Hide Restore Bin' : `Restore Bin (${deletedPets.length})`}
            </button>

            {showBin && (
                <div className="restore-bin">
                    <h2>Restore Bin</h2>

                    {deletedPets.length === 0 ? (
                        <p>No soft-deleted pets.</p>
                    ) : (
                        <div className="bin-list">
                            {deletedPets.map((pet) => (
                                <div className="bin-item" key={pet._id}>
                                    <div>
                                        <strong>{pet.name}</strong>
                                        <p>{pet.species} • {pet.breed}</p>
                                    </div>
                                    <div className="bin-actions">
                                        <button className="bin-restore" onClick={() => handleRestore(pet._id)}>Restore</button>
                                        <button className="bin-hard-delete" onClick={() => handleHardDeleteFromBin(pet._id)}>Hard Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <img src={cat} className="cat" alt="Cat" />

            {selectedPet && (
                <PetModal
                    // If pet selected -> pet = selectedpet onClose = set pet to null
                    pet={selectedPet}
                    onClose={() => setSelectedPet(null)}
                    // If pet was updated or deleted
                    onUpdate={handlePetUpdate} 
                />
            )}

            {showAddModal && (
                <AddPetModal 
                    onClose={() => setShowAddModal(false)}
                    onPetAdded={handlePetAdded}
                />
            )}
        </div>
    )
}

export default Home