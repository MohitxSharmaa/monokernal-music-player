import { useState, useEffect, useRef } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useNavigate } from 'react-router-dom'

export default function AlbumBrowseView() {
  const { albums, tracks, albumBrowseIndex, setAlbumBrowseIndex } = useLibrary()
  const navigate = useNavigate()
  const selectedRef = useRef(null)

  // Auto-scroll to selection
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [albumBrowseIndex])

  // Grid Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (albums.length === 0) return
      
      const cols = 5 // Approximation for grid columns
      
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setAlbumBrowseIndex(prev => (prev < albums.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setAlbumBrowseIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setAlbumBrowseIndex(prev => (prev + cols < albums.length ? prev + cols : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setAlbumBrowseIndex(prev => (prev - cols >= 0 ? prev - cols : prev))
      } else if (e.key === 'Enter') {
        handleOpenAlbum(albums[albumBrowseIndex].title)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [albums, albumBrowseIndex])

  const handleOpenAlbum = (albumTitle) => {
    navigate(`/album/${encodeURIComponent(albumTitle)}`)
  }

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide">
      <div className="mb-8 border-b border-primary-container/30 pb-2">
        <h1 className="font-headline-lg text-primary-container uppercase">&gt;&gt; /ROOT/ALBUMS</h1>
        <p className="font-body-sm text-primary-container/70">Found {albums.length} entities. Sorted by: DATE_DESC.</p>
      </div>
      {/* Album Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {albums.length === 0 ? (
          <div className="col-span-full font-body-lg opacity-50 text-primary-container">NO ALBUMS FOUND. SCAN DIRECTORY.</div>
        ) : (
          albums.map((album, index) => {
            const isSelected = albumBrowseIndex === index
            return (
              <div 
                key={index} 
                ref={isSelected ? selectedRef : null}
                onDoubleClick={() => handleOpenAlbum(album.title)} 
                onClick={() => setAlbumBrowseIndex(index)}
                className={`flex flex-col group cursor-pointer transition-all duration-200 relative ${isSelected ? 'scale-105 z-10' : ''}`}
              >
                <div className={`w-full aspect-square bg-zinc-900 border dotted-overlay crt-overlay overflow-hidden relative p-3 flex items-center justify-center ${isSelected ? 'border-primary-container shadow-[0_0_20px_var(--accent-color)] border-2' : 'border-primary-container/30'}`}>
                  {album.picture ? (
                    <img src={album.picture} alt={album.title} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-primary-container/50 text-xs">NO_IMG</div>
                  )}
                </div>
                <div className={`mt-3 px-1 font-mono font-bold uppercase truncate w-full transition-none ${isSelected ? 'bg-primary-container text-black' : 'text-primary-container group-hover:bg-primary-container group-hover:text-black'}`}>
                  {album.title}
                </div>
                <div className="mt-1 px-1 font-mono text-xs text-primary-container/70 truncate w-full">{album.artist} [{album.year}]</div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
