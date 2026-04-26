import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'
import ContextMenu from '../components/ContextMenu'
import PlaylistModal from '../components/PlaylistModal'
import { getCoverSrc } from '../utils/covers'

export default function SearchView() {
  const { tracks, albums, playlists } = useLibrary()
  const navigate = useNavigate()
  const { playTrack, currentTrack, addToQueue, playNext } = useAudio()
  const [query, setQuery] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null)
  const inputRef = useRef(null)

  // Only focus search bar on Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const q = query.toLowerCase()
  const filteredTracks = q ? tracks.filter(t => 
    t.title.toLowerCase().includes(q) || 
    t.artist.toLowerCase().includes(q) || 
    t.album.toLowerCase().includes(q)
  ) : []

  const filteredAlbums = q ? albums.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.artist.toLowerCase().includes(q)
  ) : []

  const filteredPlaylists = q ? playlists.filter(p => 
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  ) : []

  const totalResults = filteredTracks.length + filteredAlbums.length + filteredPlaylists.length

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide bg-black text-primary-container">
      <div className="mb-8 border-b border-primary-container/30 pb-4">
        <h1 className="font-headline-lg text-headline-lg uppercase mb-4 text-primary-container">GLOBAL_SEARCH</h1>
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="[ PRESS ENTER TO SEARCH: TITLE, ARTIST, ALBUM ]"
          className="w-full bg-black border-2 border-primary-container text-primary-container p-4 font-mono focus:outline-none focus:bg-primary-container/10"
        />
      </div>

      <div className="w-full space-y-12">
        <h2 className="font-label-caps text-label-caps mb-4 opacity-70">
          RESULTS: {query.length === 0 ? "0" : totalResults}
        </h2>
        
        {/* Playlists Results */}
        {filteredPlaylists.length > 0 && (
          <section className="animate-entry">
            <h3 className="text-xs font-black tracking-[0.2em] mb-4 text-primary-container/40 border-b border-primary-container/20 pb-1">
              &gt;&gt; PLAYLISTS_FOUND
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPlaylists.map(pl => (
                <div 
                  key={pl.id} 
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                  className="group cursor-pointer border border-primary-container/30 p-2 hover:border-primary-container transition-all hover:bg-primary-container/5"
                >
                  <div className="aspect-square bg-zinc-900 mb-2 relative overflow-hidden dotted-overlay">
                    <img src={getCoverSrc(pl.coverId, pl.customCover)} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs font-bold uppercase truncate">{pl.name}</div>
                  <div className="text-[10px] opacity-40">{pl.trackPaths.length} TRACKS</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums Results */}
        {filteredAlbums.length > 0 && (
          <section className="animate-entry">
            <h3 className="text-xs font-black tracking-[0.2em] mb-4 text-primary-container/40 border-b border-primary-container/20 pb-1">
              &gt;&gt; ALBUMS_FOUND
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAlbums.map((album, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/album/${encodeURIComponent(album.title)}`)}
                  className="group cursor-pointer border border-primary-container/30 p-2 hover:border-primary-container transition-all hover:bg-primary-container/5"
                >
                  <div className="aspect-square bg-zinc-900 mb-2 relative overflow-hidden dotted-overlay">
                    {album.picture ? <img src={album.picture} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /> : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">💽</div>}
                  </div>
                  <div className="text-xs font-bold uppercase truncate">{album.title}</div>
                  <div className="text-[10px] opacity-40">{album.artist}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tracks Results */}
        {filteredTracks.length > 0 && (
          <section className="animate-entry">
            <h3 className="text-xs font-black tracking-[0.2em] mb-4 text-primary-container/40 border-b border-primary-container/20 pb-1">
              &gt;&gt; TRACKS_FOUND
            </h3>
            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
              <thead>
                <tr className="border-b border-primary-container text-primary-container opacity-70 font-label-caps text-label-caps tracking-widest uppercase">
                  <th className="py-2 px-4 font-normal">#</th>
                  <th className="py-2 px-4 font-normal">TITLE</th>
                  <th className="py-2 px-4 font-normal">ARTIST</th>
                  <th className="py-2 px-4 font-normal">ALBUM</th>
                  <th className="py-2 px-4 font-normal text-right">TIME</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((track, index) => {
                  const isActive = currentTrack && currentTrack.path === track.path
                  return (
                    <tr 
                      key={index} 
                      onDoubleClick={() => playTrack(track, filteredTracks)}
                      onContextMenu={(e) => handleContextMenu(e, track)}
                      className={`border-b border-primary-container/30 hover:bg-primary-container hover:text-black cursor-pointer group transition-none ${isActive ? 'selected-track-glow' : ''}`}
                    >
                      <td className="py-2 px-4">{(index + 1).toString().padStart(3, '0')}</td>
                      <td className="py-2 px-4 truncate max-w-[200px]">{track.title}</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">{track.artist}</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">{track.album}</td>
                      <td className="py-2 px-4 text-right">{formatTime(track.duration)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {query.length > 0 && totalResults === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-primary-container/20">
            <div className="text-4xl opacity-10 mb-4">∅</div>
            <div className="font-headline-md opacity-40">NO_MATCHING_ENTITIES_FOUND_IN_DATABASE</div>
          </div>
        )}
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
