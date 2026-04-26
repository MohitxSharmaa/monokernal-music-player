import React, { createContext, useState, useContext, useEffect, useLayoutEffect } from 'react'

export const THEMES = [
  { id: 'amber', name: 'Amber Classic', color: '#ffb000' },
  { id: 'green', name: 'Phosphor Green', color: '#39FF14' },
  { id: 'cyan', name: 'Cyber Cyan', color: '#00FFFF' },
  { id: 'purple', name: 'Dracula Purple', color: '#BD93F9' },
  { id: 'red', name: 'System Error Red', color: '#FF003C' },
  { id: 'blue', name: 'Ice Blue', color: '#8BE9FD' },
  { id: 'pink', name: 'Synthwave Pink', color: '#FF2A6D' },
  { id: 'white', name: 'Monochrome White', color: '#F8F8F2' },
  { id: 'mint', name: 'Radioactive Mint', color: '#50FA7B' },
  { id: 'yellow', name: 'Hazard Yellow', color: '#F1FA8C' },
  { id: 'gold', name: 'Muted Gold', color: '#D4AF37' },
]

const LibraryContext = createContext()

export function useLibrary() {
  return useContext(LibraryContext)
}

export function LibraryProvider({ children }) {
  const [tracks, setTracks] = useState([])
  const [albums, setAlbums] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('monokernal_playlists')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error("Failed to parse playlists", e)
      return []
    }
  })
  const [scannedFolders, setScannedFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('scannedFolders')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error("Failed to parse scanned folders", e)
      return []
    }
  })
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('monokernal_theme') || 'amber'
  })
  const [albumBrowseIndex, setAlbumBrowseIndex] = useState(0)
  const [playlistBrowseIndex, setPlaylistBrowseIndex] = useState(0)

  // Apply theme to CSS variables
  useLayoutEffect(() => {
    const theme = THEMES.find(t => t.id === currentTheme) || THEMES[0]
    console.log(`[THEME] Applying ${theme.name} (${theme.color})`)
    document.documentElement.style.setProperty('--accent-color', theme.color)
    localStorage.setItem('monokernal_theme', currentTheme)
  }, [currentTheme])

  useEffect(() => {
    // Initial scan of saved folders on bootup
    if (scannedFolders.length > 0) {
      rescanAll(scannedFolders)
    }
  }, []) // Empty dependency array for on-mount only

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (scannedFolders.length === 0) return
    const interval = setInterval(() => {
      console.log("[AUTO_REFRESH] Scanning for new tracks...")
      rescanAll(scannedFolders)
    }, 30 * 60 * 1000) // 30 minutes
    return () => clearInterval(interval)
  }, [scannedFolders])

  const refreshLibrary = async () => {
    if (scannedFolders.length > 0) {
      await rescanAll(scannedFolders)
    }
  }

  const rescanAll = async (folders) => {
    if (!window.electronAPI) return
    setIsScanning(true)
    try {
      let allTracks = []
      for (const folder of folders) {
        const scannedTracks = await window.electronAPI.invoke('music:scanFolder', folder)
        allTracks = [...allTracks, ...scannedTracks]
      }
      setTracks(allTracks)
    } catch (error) {
      console.error("Scanning failed", error)
    } finally {
      setIsScanning(false)
    }
  }

  // Derive albums from tracks
  useEffect(() => {
    const albumMap = new Map()
    tracks.forEach(track => {
      const albumKey = track.album || 'Unknown Album'
      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          title: albumKey,
          artist: track.artist,
          year: track.year,
          picture: track.picture,
          tracks: []
        })
      }
      albumMap.get(albumKey).tracks.push(track)
    })
    setAlbums(Array.from(albumMap.values()))
  }, [tracks])

  useEffect(() => {
    localStorage.setItem('monokernal_playlists', JSON.stringify(playlists))
  }, [playlists])

  const scanFolder = async () => {
    if (window.electronAPI) {
      try {
        const folderPath = await window.electronAPI.invoke('dialog:selectFolder')
        if (folderPath && !scannedFolders.includes(folderPath)) {
          const newFolders = [...scannedFolders, folderPath]
          setScannedFolders(newFolders)
          localStorage.setItem('scannedFolders', JSON.stringify(newFolders))
          await rescanAll(newFolders)
        }
      } catch (e) {
        console.error("scanFolder error:", e);
      }
    }
  }

  const clearLibrary = () => {
    setScannedFolders([])
    setTracks([])
    setAlbums([])
    localStorage.removeItem('scannedFolders')
  }

  const createPlaylist = (name, description = "", coverId, customCover = null) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      coverId,
      customCover,
      trackPaths: []
    }
    setPlaylists(prev => [...prev, newPlaylist])
  }

  const updatePlaylist = (id, updates) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates }
      }
      return p
    }))
  }

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id))
  }

  const addTrackToPlaylist = (playlistId, trackPath) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (!p.trackPaths.includes(trackPath)) {
          return { ...p, trackPaths: [...p.trackPaths, trackPath] }
        }
      }
      return p
    }))
  }

  const removeTrackFromPlaylist = (playlistId, trackPath) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, trackPaths: p.trackPaths.filter(t => t !== trackPath) }
      }
      return p
    }))
  }

  return (
    <LibraryContext.Provider value={{ 
      tracks, 
      albums, 
      playlists, 
      isScanning, 
      scannedFolders, 
      scanFolder, 
      clearLibrary,
      refreshLibrary,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      currentTheme,
      setCurrentTheme,
      albumBrowseIndex,
      setAlbumBrowseIndex,
      playlistBrowseIndex,
      setPlaylistBrowseIndex
    }}>
      {children}
    </LibraryContext.Provider>
  )
}
