import "./PetDetails.css"


const PetDetails = ( { pet }) => {
    return (
        <div className="pet-card">
            <h2>{pet.name}</h2>
            <p><strong>Species:</strong> {pet.species}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age} years</p>
        </div>
    )
}

export default PetDetails