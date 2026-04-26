import { useState, useEffect, useRef } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'
import MiniVisualizer from '../components/MiniVisualizer'
import ContextMenu from '../components/ContextMenu'
import PlaylistModal from '../components/PlaylistModal'

export default function MainLibraryDashboard() {
  const { tracks, scannedFolders, scanFolder, isScanning } = useLibrary()
  const { playTrack, currentTrack, addToQueue, playNext } = useAudio()
  
  const [contextMenu, setContextMenu] = useState(null)
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedRef = useRef(null)

  // Auto-scroll to selection
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input (e.g. search)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (tracks.length === 0) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < tracks.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        playTrack(tracks[selectedIndex], tracks)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tracks, selectedIndex, playTrack])

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

  if (tracks.length === 0 && scannedFolders.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-black p-margin relative z-0 flex flex-col items-center justify-center">
        <div className="font-headline-lg text-primary-container mb-8">NO SIGNAL // SYSTEM OFFLINE</div>
        <button 
          onClick={scanFolder} 
          disabled={isScanning}
          className="border-2 border-primary-container px-8 py-4 font-headline-md text-primary-container hover:bg-primary-container hover:text-black transition-none uppercase"
        >
          {isScanning ? "[ INITIALIZING PROTOCOL... ]" : "[ ADD FOLDER TO MOUNT ]"}
        </button>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-black p-margin relative z-0">
      <div className="flex justify-between items-end mb-6">
        <div className="font-headline-md text-headline-md text-primary-container uppercase">
          <span className="mr-2">&gt;</span> LIBRARY
        </div>
        <MiniVisualizer />
      </div>
      {/* Terminal Border Container */}
      <div className="border-2 border-primary-container p-1 font-body-sm text-body-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b-2 border-primary-container text-primary-container">
              <th className="py-2 px-4 font-bold">TRACK_ID</th>
              <th className="py-2 px-4 font-bold">TITLE</th>
              <th className="py-2 px-4 font-bold">ARTIST</th>
              <th className="py-2 px-4 font-bold">ALBUM</th>
              <th className="py-2 px-4 font-bold text-right">TIME</th>
            </tr>
          </thead>
          <tbody className="stagger-children">
            {tracks.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center opacity-50">
                  NO TRACKS FOUND. SCAN DIRECTORY.
                </td>
              </tr>
            ) : (
              tracks.map((track, index) => {
                const isActive = currentTrack && currentTrack.path === track.path
                const isSelected = selectedIndex === index
                return (
                  <tr 
                    key={index} 
                    ref={isSelected ? selectedRef : null}
                    onDoubleClick={() => playTrack(track, tracks)}
                    onContextMenu={(e) => handleContextMenu(e, track)}
                    onClick={() => setSelectedIndex(index)}
                    className={`border-b border-primary-container/30 hover:bg-primary-container hover:text-black cursor-pointer group transition-none ${isActive ? 'selected-track-glow' : ''} ${isSelected && !isActive ? 'bg-primary-container/10 border-l-4 border-l-primary-container' : ''}`}
                  >
                    <td className="py-2 px-4">{(index + 1).toString().padStart(3, '0')}</td>
                    <td className="py-2 px-4 truncate max-w-[200px]">{track.title}</td>
                    <td className="py-2 px-4 truncate max-w-[150px]">{track.artist}</td>
                    <td className="py-2 px-4 truncate max-w-[150px]">{track.album}</td>
                    <td className="py-2 px-4 text-right">{formatTime(track.duration)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
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

      <div className="mt-4 text-right font-label-caps text-label-caps text-primary-container opacity-80">
        TOTAL: {tracks.length} FILES
      </div>
    </main>
  )
}
