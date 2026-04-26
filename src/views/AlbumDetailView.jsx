import { useParams, useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'
import { useState, useEffect } from 'react'
import ContextMenu from '../components/ContextMenu'
import PlaylistModal from '../components/PlaylistModal'

export default function AlbumDetailView() {
  const { albumTitle } = useParams()
  const navigate = useNavigate()
  const { albums, tracks } = useLibrary()
  const { playTrack, currentTrack, addToQueue, playNext, shuffleAndPlay, isShuffle } = useAudio()
  
  const [contextMenu, setContextMenu] = useState(null)
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null)

  const decodedTitle = albumTitle ? decodeURIComponent(albumTitle) : ""
  const album = albums.find(a => a.title === decodedTitle)
  const albumTracks = tracks.filter(t => t.album === decodedTitle)

  const [focusedIndex, setFocusedIndex] = useState(2) // Start focused on first track
  
  // ESC to back + Keyboard Nav
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate('/albums')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, albumTracks.length + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'ArrowRight') {
        if (focusedIndex === 0) setFocusedIndex(1)
      } else if (e.key === 'ArrowLeft') {
        if (focusedIndex === 1) setFocusedIndex(0)
      } else if (e.key === 'Enter') {
        if (focusedIndex === 0) {
          if (albumTracks.length > 0) playTrack(albumTracks[0], albumTracks)
        } else if (focusedIndex === 1) {
          if (albumTracks.length > 0) shuffleAndPlay(albumTracks)
        } else if (focusedIndex >= 2) {
          const trackIdx = focusedIndex - 2
          if (albumTracks[trackIdx]) playTrack(albumTracks[trackIdx], albumTracks)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, focusedIndex, albumTracks, playTrack, shuffleAndPlay])

  if (!album) {
    return (
      <main className="w-full h-full p-8 flex flex-col items-center justify-center">
        <h1 className="font-headline-lg text-primary-container">ALBUM_NOT_FOUND</h1>
        <button onClick={() => navigate('/albums')} className="mt-4 border p-2 text-primary-container border-primary-container">[ RETURN ]</button>
      </main>
    )
  }

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

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide bg-black text-primary-container">
      <div className="mb-6 flex space-x-4">
        <button onClick={() => navigate('/albums')} className="text-primary-container/70 hover:text-primary-container transition-none">
          &lt;&lt; BACK
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-64 h-64 bg-zinc-900 border border-primary-container/30 dotted-overlay crt-overlay overflow-hidden relative">
          {album.picture ? (
            <img src={album.picture} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-primary-container/50 text-xs">NO_IMG</div>
          )}
        </div>
        
        <div className="flex flex-col flex-1">
          <h1 className="font-headline-lg text-headline-lg uppercase text-primary-container tracking-tighter break-all">
            {album.title}
          </h1>
          <h2 className="font-headline-md text-headline-md text-primary-container/70 mb-2">{album.artist}</h2>
          <div className="font-mono text-base text-primary-container/50 mb-4">YEAR: {album.year} // TRACKS: {albumTracks.length}</div>
          
          <div className="flex space-x-3 mb-8">
            <button
              onClick={() => playTrack(albumTracks[0], albumTracks)}
              className={`border border-primary-container px-6 py-2 text-sm uppercase tracking-widest transition-none font-bold ${focusedIndex === 0 ? 'bg-primary-container text-black' : 'hover:bg-primary-container hover:text-black'}`}
            >
              ▶ PLAY_ALL
            </button>
            <button
              onClick={() => shuffleAndPlay(albumTracks)}
              className={`border border-primary-container px-4 py-2 text-sm uppercase tracking-widest transition-none flex items-center gap-2 ${focusedIndex === 1 ? 'bg-primary-container text-black border-primary-container' : isShuffle ? 'bg-primary-container/20 border-primary-container' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}
            >
              <span className="material-symbols-outlined text-[16px]" data-icon="shuffle">shuffle</span> SHUFFLE
            </button>
          </div>
          
          <table className="w-full text-left font-body-sm text-body-sm border-collapse">
            <thead>
              <tr className="border-b border-primary-container text-primary-container opacity-70 font-label-caps text-label-caps tracking-widest uppercase">
                <th className="py-2 px-4 font-normal">#</th>
                <th className="py-2 px-4 font-normal">TITLE</th>
                <th className="py-2 px-4 font-normal text-right">TIME</th>
              </tr>
            </thead>
            <tbody>
              {albumTracks.map((track, index) => {
                const isActive = currentTrack && currentTrack.path === track.path
                const isFocused = focusedIndex === index + 2
                return (
                  <tr 
                    key={index} 
                    onDoubleClick={() => playTrack(track, albumTracks)}
                    onContextMenu={(e) => handleContextMenu(e, track)}
                    onClick={() => setFocusedIndex(index + 2)}
                    className={`border-b border-primary-container/30 cursor-pointer group transition-none ${isActive ? 'selected-track-glow' : ''} ${isFocused ? 'bg-primary-container text-black' : 'hover:bg-primary-container/20 text-primary-container'}`}
                  >
                    <td className="py-2 px-4">{(index + 1).toString().padStart(3, '0')}</td>
                    <td className="py-2 px-4 truncate max-w-[300px]">{track.title}</td>
                    <td className="py-2 px-4 text-right">{formatTime(track.duration)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
