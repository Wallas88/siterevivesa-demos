/*
 * main.tsx — the entry point: loads the styles and mounts the demo into
 * #root. index.html already shows a plain message for visitors without
 * JavaScript.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import '../styles/index.css'

const root = document.getElementById('root')
if (root != null) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
