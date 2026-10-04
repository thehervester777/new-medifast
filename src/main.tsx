import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSmoothScroll } from './lib/smooth'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('is-loading')
initSmoothScroll()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
