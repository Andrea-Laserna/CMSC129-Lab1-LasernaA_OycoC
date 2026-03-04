// React entry point

import { StrictMode } from 'react'            // Checks for problems in dev
import { createRoot } from 'react-dom/client' // Create react root : finds root id in index.html
import './index.css'
import App from './App.jsx'

// Find root in index.html and create react root container inside div
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Render app into the div */}
    <App />
  </StrictMode>,
)
