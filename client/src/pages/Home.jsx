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
    const [selectedPet, setSelectedPet] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)

    // useEffect -> Run code after component renders 
    useEffect(() => {
        // Fetch pets from backend: SEND request
        const fetchPets = async () => {
            try {
                console.log("Fetching from backend...")
                // Send GET request to api/pets -> Found in router
                const response = await fetch('http://localhost:5000/api/pets')
                console.log("Response status:", response.status)
                
                const json = await response.json()
                console.log("Full response object:", json)

                if (response.ok) {
                   console.log("Pets array:", json.pets)
                /*
                    React updates the state
                    Component re-renders
                    UI updates automatically
                */    
                   setPets(json.pets) // Extract pets array from response and UPDATE state list
                } else {
                   console.error("Response not OK:", response.status)
                }
            } catch (error) {
                console.error("Error fetching pets:", error)
            }
        }

        fetchPets()
    // Run fetchPets() only once when page loads
    }, [])


    // =================== FUNCTIONS ======================

    // updatedPet comes from PetModal set by update response or delete response
    const handlePetUpdate = (updatedPet) => {
        if (updatedPet === null) {
            // Pet was deleted
            setPets(prevPets => 
                prevPets.filter(p => p._id !== selectedPet._id)
            )
            setSelectedPet(null)
        } else {
            // Pet was updated
            setPets(prevPets => 
                prevPets.map(p => p._id === updatedPet._id ? updatedPet : p)
            )
            setSelectedPet(updatedPet)
        }
    }

    const handlePetAdded = (newPet) => {
        // Add the new pet to the list
        setPets(prevPets => [...prevPets, newPet])
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