import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MainLibraryDashboard from './views/MainLibraryDashboard'
import AlbumBrowseView from './views/AlbumBrowseView'
import AlbumDetailView from './views/AlbumDetailView'
import SettingsView from './views/SettingsView'
import SearchView from './views/SearchView'
import PlaylistsView from './views/PlaylistsView'
import PlaylistDetailView from './views/PlaylistDetailView'
import BootScreen from './components/BootScreen'

function App() {
  const [isBooted, setIsBooted] = useState(() => {
    // Skip boot on hot-reload in dev
    return sessionStorage.getItem('monokernal_booted') === 'true'
  })

  const handleBootComplete = useCallback(() => {
    setIsBooted(true)
    sessionStorage.setItem('monokernal_booted', 'true')
  }, [])

  return (
    <>
      {!isBooted && <BootScreen onComplete={handleBootComplete} />}
      {isBooted && (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainLibraryDashboard />} />
            <Route path="albums" element={<AlbumBrowseView />} />
            <Route path="album/:albumTitle" element={<AlbumDetailView />} />
            <Route path="playlists" element={<PlaylistsView />} />
            <Route path="playlist/:id" element={<PlaylistDetailView />} />
            <Route path="search" element={<SearchView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
      )}
    </>
  )
}

export default App
