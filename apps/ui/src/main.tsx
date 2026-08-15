import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import '@suite/ui/theme.css'
import './kabuk.css'

const kok = document.getElementById('kok')
if (kok === null) throw new Error('#kok bulunamadı')
createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>
)
