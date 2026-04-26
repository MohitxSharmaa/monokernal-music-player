import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'
import { getCoverSrc } from '../utils/covers'
import ContextMenu from '../components/ContextMenu'
import PlaylistModal from '../components/PlaylistModal'

export default function PlaylistDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, tracks, removeTrackFromPlaylist, deletePlaylist, addTrackToPlaylist } = useLibrary()
  const { playTrack, currentTrack, addToQueue, playNext, shuffleAndPlay, isShuffle } = useAudio()

  const [contextMenu, setContextMenu] = useState(null)
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(2) // Start focused on first track

  const playlist = playlists.find(p => p.id === id)
  const playlistTracks = playlist ? playlist.trackPaths
    .map(path => tracks.find(t => t.path === path))
    .filter(Boolean) : []

  // ESC to back + Keyboard Nav
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate('/playlists')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, playlistTracks.length + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'ArrowRight') {
        if (focusedIndex === 0) setFocusedIndex(1)
      } else if (e.key === 'ArrowLeft') {
        if (focusedIndex === 1) setFocusedIndex(0)
      } else if (e.key === 'Enter') {
        if (focusedIndex === 0) {
          if (playlistTracks.length > 0) playTrack(playlistTracks[0], playlistTracks)
        } else if (focusedIndex === 1) {
          if (playlistTracks.length > 0) shuffleAndPlay(playlistTracks)
        } else if (focusedIndex >= 2) {
          const trackIdx = focusedIndex - 2
          if (playlistTracks[trackIdx]) playTrack(playlistTracks[trackIdx], playlistTracks)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, focusedIndex, playlistTracks, playTrack, shuffleAndPlay])

  if (!playlist) {
    return (
      <main className="w-full h-full p-8 flex flex-col items-center justify-center font-mono">
        <h1 className="font-headline-lg text-primary-container">PLAYLIST_NOT_FOUND</h1>
        <button onClick={() => navigate('/playlists')} className="mt-4 border p-2 text-primary-container border-primary-container">[ RETURN ]</button>
      </main>
    )
  }

  const coverSrc = getCoverSrc(playlist.coverId, playlist.customCover)

  const formatTime = (seconds) => {
    if (!seconds) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleContextMenu = (e, track) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, track })
  }

  const handleDelete = () => {
    if (confirm('DELETE THIS PLAYLIST?')) {
      deletePlaylist(playlist.id)
      navigate('/playlists')
    }
  }

  const handleRemoveTrack = (trackPath) => {
    removeTrackFromPlaylist(playlist.id, trackPath)
  }

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide bg-black text-primary-container font-mono">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/playlists')} className="text-primary-container/70 hover:text-primary-container transition-none">
          &lt;&lt; BACK
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/playlists', { state: { editId: playlist.id } })}
            className="border border-primary-container text-primary-container px-3 py-1 text-xs uppercase tracking-widest hover:bg-primary-container hover:text-black transition-none"
          >
            EDIT
          </button>
          <button
            onClick={handleDelete}
            className="border border-red-500/50 text-red-500 px-3 py-1 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-black transition-none"
          >
            DELETE
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="border border-primary-container">
          <div className="text-[11px] uppercase tracking-widest opacity-40 mb-1 px-2 pt-2">COLLECTION_REF: {playlist.id}</div>
          <div className="p-4">
            <div className="flex-shrink-0 w-64 h-64 bg-zinc-900 border border-primary-container/30 dotted-overlay crt-overlay overflow-hidden relative flex items-center justify-center">
              {coverSrc ? (
                <img src={coverSrc} alt={playlist.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-container/50 text-4xl">♫</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="text-xs uppercase tracking-widest opacity-50 mb-1">PLAYLIST</div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-primary-container tracking-tighter break-all">
            {playlist.name}
          </h1>
          <div className="text-base text-primary-container/50 mb-2">{playlistTracks.length} TRACKS</div>
          
          {playlist.description ? (
            <p className="text-sm text-primary-container/70 font-body mb-6 max-w-xl italic border-l-2 border-primary-container/30 pl-4 py-1">
              {playlist.description}
            </p>
          ) : (
            <div className="mb-6 h-px" />
          )}

          {playlistTracks.length > 0 && (
            <div className="flex space-x-3 mb-6">
              <button
                onClick={() => playTrack(playlistTracks[0], playlistTracks)}
                className={`border border-primary-container px-6 py-2 text-sm uppercase tracking-widest transition-none font-bold ${focusedIndex === 0 ? 'bg-primary-container text-black' : 'hover:bg-primary-container hover:text-black'}`}
              >
                ▶ PLAY_ALL
              </button>
              <button
                onClick={() => shuffleAndPlay(playlistTracks)}
                className={`border border-primary-container px-4 py-2 text-sm uppercase tracking-widest transition-none flex items-center gap-2 ${focusedIndex === 1 ? 'bg-primary-container text-black border-primary-container' : isShuffle ? 'bg-primary-container/20 border-primary-container' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}
              >
                <span className="material-symbols-outlined text-[16px]" data-icon="shuffle">shuffle</span> SHUFFLE
              </button>
            </div>
          )}

          {playlistTracks.length === 0 ? (
            <div className="text-sm opacity-50 mt-4">
              EMPTY_PLAYLIST — RIGHT-CLICK TRACKS IN YOUR LIBRARY TO ADD THEM HERE.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-primary-container text-primary-container opacity-70 text-[10px] tracking-widest uppercase">
                  <th className="py-2 px-4 font-normal">#</th>
                  <th className="py-2 px-4 font-normal">TITLE</th>
                  <th className="py-2 px-4 font-normal">ARTIST</th>
                  <th className="py-2 px-4 font-normal text-right">TIME</th>
                  <th className="py-2 px-2 font-normal text-right w-10"></th>
                </tr>
              </thead>
              <tbody>
                {playlistTracks.map((track, index) => {
                  const isActive = currentTrack && currentTrack.path === track.path
                  const isFocused = focusedIndex === index + 2
                  return (
                    <tr
                      key={index}
                      onDoubleClick={() => playTrack(track, playlistTracks)}
                      onContextMenu={(e) => handleContextMenu(e, track)}
                      onClick={() => setFocusedIndex(index + 2)}
                      className={`border-b border-primary-container/30 cursor-pointer group transition-none ${isActive ? 'selected-track-glow' : ''} ${isFocused ? 'bg-primary-container text-black' : 'hover:bg-primary-container/20 text-primary-container'}`}
                    >
                      <td className="py-2 px-4">{(index + 1).toString().padStart(3, '0')}</td>
                      <td className="py-2 px-4 truncate max-w-[200px]">{track.title}</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">{track.artist}</td>
                      <td className="py-2 px-4 text-right">{formatTime(track.duration)}</td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.path) }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-none"
                          title="Remove from playlist"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onPlayNext={playNext}
          onAddToQueue={addToQueue}
          onAddToPlaylist={(track) => setPlaylistModalTrack(track)}
        />
      )}

      {playlistModalTrack && (
        <PlaylistModal
          track={playlistModalTrack}
          onClose={() => setPlaylistModalTrack(null)}
        />
      )}
    </main>
  )
}
