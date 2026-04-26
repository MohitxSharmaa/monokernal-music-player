import React, { useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { PLAYLIST_COVERS, getCoverSrc } from '../utils/covers'

export default function PlaylistModal({ track, onClose }) {
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibrary()
  const [mode, setMode] = useState('select') // 'select' | 'create'
  const [newName, setNewName] = useState('')
  const [selectedCover, setSelectedCover] = useState('lofi')
  const [customCover, setCustomCover] = useState(null)

  if (!track) return null

  const handleAddToPlaylist = (playlistId) => {
    addTrackToPlaylist(playlistId, track.path)
    onClose()
  }

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim(), selectedCover, customCover)
      setNewName('')
      setCustomCover(null)
      setMode('select')
    }
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

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center font-mono" onClick={onClose}>
      <div 
        className="bg-black border-2 border-primary-container w-[420px] max-h-[80vh] flex flex-col shadow-2xl shadow-primary-container/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-primary-container bg-primary-container/10">
          <h2 className="text-primary-container font-bold uppercase tracking-widest text-sm">
            {mode === 'select' ? 'ADD_TO_PLAYLIST' : 'CREATE_PLAYLIST'}
          </h2>
          <button onClick={onClose} className="text-primary-container hover:text-white text-lg">&times;</button>
        </div>

        {/* Track info */}
        <div className="px-4 py-2 border-b border-primary-container/30 text-xs text-primary-container/70 truncate">
          TRACK: {track.title} — {track.artist}
        </div>

        {mode === 'select' ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {playlists.length === 0 ? (
              <div className="p-6 text-center text-primary-container/50 text-sm">
                NO PLAYLISTS YET
              </div>
            ) : (
              <ul className="flex flex-col">
                {playlists.map((pl) => {
                  const coverSrc = getCoverSrc(pl.coverId, pl.customCover)
                  const alreadyAdded = pl.trackPaths.includes(track.path)
                  return (
                    <li
                      key={pl.id}
                      onClick={() => !alreadyAdded && handleAddToPlaylist(pl.id)}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-primary-container/20 transition-none ${alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-container hover:text-black cursor-pointer'} text-primary-container`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-zinc-900 border border-primary-container/30 overflow-hidden">
                        {coverSrc && <img src={coverSrc} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate uppercase">{pl.name}</div>
                        <div className="text-[10px] opacity-70">{pl.trackPaths.length} TRACKS</div>
                      </div>
                      {alreadyAdded && <span className="text-[10px] opacity-70">ADDED</span>}
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Create New button */}
            <button
              onClick={() => setMode('create')}
              className="w-full px-4 py-3 text-sm text-primary-container border-t border-primary-container/30 hover:bg-primary-container hover:text-black transition-none uppercase tracking-widest"
            >
              + NEW_PLAYLIST
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col gap-4">
            {/* Name Input */}
            <div>
              <label className="text-primary-container text-xs uppercase tracking-widest mb-1 block opacity-70">NAME</label>
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

            {/* Cover Selector */}
            <div>
              <label className="text-primary-container text-xs uppercase tracking-widest mb-2 block opacity-70">SELECT_COVER</label>
              <div className="grid grid-cols-5 gap-2">
                {PLAYLIST_COVERS.map((cover) => (
                  <div
                    key={cover.id}
                    onClick={() => { setSelectedCover(cover.id); setCustomCover(null) }}
                    className={`aspect-square cursor-pointer border-2 overflow-hidden transition-none ${selectedCover === cover.id && !customCover ? 'border-primary-container ring-1 ring-primary-container' : 'border-primary-container/30 hover:border-primary-container'}`}
                  >
                    <img src={cover.src} alt={cover.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {/* Custom Upload Tile */}
                <div
                  onClick={handlePickCustomCover}
                  className={`aspect-square cursor-pointer border-2 overflow-hidden transition-none flex items-center justify-center ${customCover ? 'border-primary-container ring-1 ring-primary-container' : 'border-primary-container/30 border-dashed hover:border-primary-container'}`}
                >
                  {customCover ? (
                    <img src={customCover} alt="Custom" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-primary-container/50">
                      <span className="text-sm">+</span>
                      <span className="text-[6px] uppercase">CUSTOM</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-primary-container/50 mt-1">
                {customCover ? 'CUSTOM IMAGE' : (PLAYLIST_COVERS.find(c => c.id === selectedCover)?.name || '')}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setMode('select')}
                className="flex-1 border border-primary-container text-primary-container px-3 py-2 text-xs uppercase tracking-widest hover:bg-primary-container/20 transition-none"
              >
                BACK
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 border border-primary-container bg-primary-container text-black px-3 py-2 text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-none disabled:opacity-30 disabled:cursor-not-allowed"
              >
                CREATE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
