import React, { useEffect, useRef } from 'react'

export default function ContextMenu({ x, y, track, onClose, onPlayNext, onAddToQueue, onAddToPlaylist }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!track) return null

  // Ensure menu stays within viewport
  const safeX = Math.min(x, window.innerWidth - 200)
  const safeY = Math.min(y, window.innerHeight - 150)

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-48 bg-black border border-primary-container font-mono text-sm shadow-2xl shadow-black/50"
      style={{ left: safeX, top: safeY }}
    >
      <div className="bg-primary-container text-black font-bold px-3 py-1 text-xs truncate uppercase">
        {track.title}
      </div>
      <ul className="py-1 flex flex-col text-primary-container">
        <li 
          className="px-4 py-2 hover:bg-primary-container hover:text-black cursor-pointer transition-none flex items-center"
          onClick={() => { onPlayNext(track); onClose() }}
        >
          <span className="material-symbols-outlined text-[16px] mr-2" data-icon="playlist_play">playlist_play</span>
          Play Next
        </li>
        <li 
          className="px-4 py-2 hover:bg-primary-container hover:text-black cursor-pointer transition-none flex items-center"
          onClick={() => { onAddToQueue(track); onClose() }}
        >
          <span className="material-symbols-outlined text-[16px] mr-2" data-icon="queue_music">queue_music</span>
          Add to Queue
        </li>
        <li 
          className="px-4 py-2 hover:bg-primary-container hover:text-black cursor-pointer transition-none flex items-center"
          onClick={() => { onAddToPlaylist(track); onClose() }}
        >
          <span className="material-symbols-outlined text-[16px] mr-2" data-icon="playlist_add">playlist_add</span>
          Add to Playlist
        </li>
      </ul>
    </div>
  )
}
