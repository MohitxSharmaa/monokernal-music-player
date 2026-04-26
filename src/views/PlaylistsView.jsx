import React, { useState, useEffect, useRef } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { PLAYLIST_COVERS, getCoverSrc } from '../utils/covers'

export default function PlaylistsView() {
  const { playlists, createPlaylist, updatePlaylist, deletePlaylist, playlistBrowseIndex, setPlaylistBrowseIndex } = useLibrary()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedRef = useRef(null)
  
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newName, setNewName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCover, setSelectedCover] = useState('lofi')
  const [customCover, setCustomCover] = useState(null)

  // Grid Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showCreate || playlists.length === 0) return
      
      const cols = 5 
      
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setPlaylistBrowseIndex(prev => (prev < playlists.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPlaylistBrowseIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setPlaylistBrowseIndex(prev => (prev + cols < playlists.length ? prev + cols : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setPlaylistBrowseIndex(prev => (prev - cols >= 0 ? prev - cols : prev))
      } else if (e.key === 'Enter') {
        handleOpenPlaylist(playlists[playlistBrowseIndex].id)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playlists, playlistBrowseIndex, showCreate])

  // Auto-scroll to selection
  useEffect(() => {
    if (selectedRef.current && !showCreate) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [playlistBrowseIndex, showCreate])

  // Handle direct edit from navigation state
  useEffect(() => {
    if (location.state?.editId) {
      const pl = playlists.find(p => p.id === location.state.editId)
      if (pl) {
        handleEdit(pl)
        // Clear state in router history to prevent re-opening
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [location.state, playlists, navigate, location.pathname])

  const handleCreate = () => {
    if (newName.trim()) {
      if (editingId) {
        updatePlaylist(editingId, { name: newName.trim(), description: description.trim(), coverId: selectedCover, customCover })
      } else {
        createPlaylist(newName.trim(), description.trim(), selectedCover, customCover)
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setNewName('')
    setDescription('')
    setSelectedCover('lofi')
    setCustomCover(null)
    setShowCreate(false)
    setEditingId(null)
  }

  const handleEdit = (pl) => {
    setEditingId(pl.id)
    setNewName(pl.name)
    setDescription(pl.description || '')
    setSelectedCover(pl.coverId)
    setCustomCover(pl.customCover)
    setShowCreate(true)
  }

  const handlePickCustomCover = async () => {
    if (window.electronAPI) {
      const dataUrl = await window.electronAPI.invoke('dialog:selectImage')
      if (dataUrl) {
        setCustomCover(dataUrl)
        setSelectedCover('custom')
      }
    }
  }

  const handleOpenPlaylist = (id) => {
    navigate(`/playlist/${id}`)
  }

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide bg-black text-primary-container font-mono">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline-lg text-headline-lg uppercase tracking-tighter">PLAYLISTS</h1>
        {playlists.length > 0 && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="border border-primary-container px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary-container hover:text-black transition-none"
          >
            + NEW
          </button>
        )}
      </div>

      {/* Create/Edit Playlist Panel */}
      {showCreate && (
        <div className="mb-8 border border-primary-container p-6 bg-primary-container/5 stagger-children">
          <h2 className="text-sm uppercase tracking-widest font-bold mb-4 text-primary-container">
            {editingId ? 'EDIT_PLAYLIST' : 'CREATE_NEW_PLAYLIST'}
          </h2>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block opacity-70">NAME</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="MY_PLAYLIST"
                autoFocus
                className="w-full bg-black border border-primary-container text-primary-container px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary-container placeholder:text-primary-container/30"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block opacity-70">DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="DESCRIBE_THIS_COLLECTION..."
                rows="1"
                className="w-full bg-black border border-primary-container text-primary-container px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary-container placeholder:text-primary-container/30 resize-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs uppercase tracking-widest mb-3 block opacity-70">SELECT_COVER</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-w-4xl">
              {PLAYLIST_COVERS.map((cover) => (
                <div
                  key={cover.id}
                  onClick={() => { setSelectedCover(cover.id); setCustomCover(null) }}
                  className={`aspect-square cursor-pointer border-2 overflow-hidden transition-none relative group ${selectedCover === cover.id && !customCover ? 'border-primary-container ring-2 ring-primary-container ring-offset-2 ring-offset-black' : 'border-primary-container/30 hover:border-primary-container'}`}
                >
                  <img src={cover.src} alt={cover.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 transition-none text-center">
                    <span className="text-[10px] text-primary-container uppercase font-bold leading-tight">{cover.name.replace('Pixel:', '').trim()}</span>
                  </div>
                </div>
              ))}
              {/* Custom Upload Tile */}
              <div
                onClick={handlePickCustomCover}
                className={`aspect-square cursor-pointer border-2 overflow-hidden transition-none relative group flex items-center justify-center ${customCover ? 'border-primary-container ring-2 ring-primary-container ring-offset-2 ring-offset-black' : 'border-primary-container/30 border-dashed hover:border-primary-container'}`}
              >
                {customCover ? (
                  <img src={customCover} alt="Custom" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary-container/50">
                    <span className="text-2xl">+</span>
                    <span className="text-[8px] uppercase">CUSTOM</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] text-primary-container mt-3 font-bold uppercase tracking-widest bg-primary-container/10 w-fit px-2 py-1">
              SELECTED: {customCover ? 'CUSTOM IMAGE' : (PLAYLIST_COVERS.find(c => c.id === selectedCover)?.name || '')}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetForm}
              className="border border-primary-container px-6 py-2 text-xs uppercase tracking-widest hover:bg-primary-container/20 transition-none"
            >
              CANCEL
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="border border-primary-container bg-primary-container text-black px-8 py-2 text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {editingId ? 'SAVE_CHANGES' : 'CREATE'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {playlists.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
          <div className="text-6xl opacity-20">♫</div>
          <div className="text-center">
            <h2 className="font-headline-md text-headline-md mb-2 opacity-70">NO_PLAYLISTS_FOUND</h2>
            <p className="text-sm opacity-50 mb-6">CREATE YOUR FIRST PLAYLIST TO ORGANIZE YOUR MUSIC</p>
            <button
              onClick={() => setShowCreate(true)}
              className="border-2 border-primary-container px-8 py-3 text-sm uppercase tracking-widest hover:bg-primary-container hover:text-black transition-none font-bold"
            >
              [ MAKE YOUR FIRST PLAYLIST ]
            </button>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playlists.map((pl, index) => {
            const isSelected = playlistBrowseIndex === index
            const coverSrc = getCoverSrc(pl.coverId, pl.customCover)
            return (
              <div
                key={pl.id}
                ref={isSelected ? selectedRef : null}
                onDoubleClick={() => handleOpenPlaylist(pl.id)}
                onClick={() => setPlaylistBrowseIndex(index)}
                className={`flex flex-col group cursor-pointer transition-all duration-200 relative ${isSelected ? 'scale-105 z-10' : ''}`}
              >
                <div className={`w-full aspect-square bg-zinc-900 border dotted-overlay crt-overlay overflow-hidden relative p-3 flex items-center justify-center ${isSelected ? 'border-primary-container shadow-[0_0_20px_var(--accent-color)] border-2' : 'border-primary-container/30'}`}>
                  {coverSrc ? (
                    <img src={coverSrc} alt={pl.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-container/50 text-2xl font-mono">♫</div>
                  )}
                  
                  {/* Edit Button on Hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(pl) }}
                      className="bg-black/80 border border-primary-container text-primary-container p-1 hover:bg-primary-container hover:text-black transition-none flex items-center justify-center"
                      title="EDIT PLAYLIST"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </div>
                <div className={`mt-3 px-1 font-mono font-bold uppercase truncate w-full transition-none ${isSelected ? 'bg-primary-container text-black' : 'text-primary-container group-hover:bg-primary-container group-hover:text-black'}`}>
                  {pl.name}
                </div>
                <div className="mt-1 px-1 font-mono text-xs text-primary-container/70 truncate w-full">
                  {pl.trackPaths.length} TRACKS Indexed
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
