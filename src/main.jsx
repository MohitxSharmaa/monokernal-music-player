import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { LibraryProvider } from './context/LibraryContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LibraryProvider>
      <AudioProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AudioProvider>
    </LibraryProvider>
  </React.StrictMode>,
)
