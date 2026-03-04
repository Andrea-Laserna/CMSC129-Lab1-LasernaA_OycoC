// Manage Page Routing
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import AddPet from './pages/AddPet'

function App() {
  return (
    // Enable routing using browser url
    <BrowserRouter>
      <div className="app">
        <header>
        </header>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-pet" element={<AddPet />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
