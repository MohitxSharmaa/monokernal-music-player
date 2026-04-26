import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'
import QueuePanel from './QueuePanel'
import NowPlayingView from './NowPlayingView'
import WelcomeModal from './WelcomeModal'
import logoImg from '../../assets/MonoKernal_branding.png'

export default function Layout() {
  const { scanFolder, isScanning, albums, tracks, scannedFolders } = useLibrary()
  const { currentTrack, isPlaying, progress, duration, volume, togglePlayPause, nextTrack, prevTrack, seek, changeVolume, isQueueVisible, setIsQueueVisible, loopMode, cycleLoopMode, isShuffle, toggleShuffle } = useAudio()
  const navigate = useNavigate()

  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isVolScrubbing, setIsVolScrubbing] = useState(false)
  const [showNowPlaying, setShowNowPlaying] = useState(false)

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00"
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e) => {
    const scrubber = document.getElementById('seek-scrubber')
    if (!scrubber) return
    const rect = scrubber.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const pct = x / rect.width
    seek(pct * duration)
  }

  const handleVolume = (e) => {
    const scrubber = document.getElementById('vol-scrubber')
    if (!scrubber) return
    const rect = scrubber.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const pct = x / rect.width
    changeVolume(pct)
  }

  const minimizeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeApp()
    }
  }

  const toggleMaximizeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleMaximizeApp()
    }
  }

  const closeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeApp()
    } else {
      window.close()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isScrubbing) handleSeek(e)
      if (isVolScrubbing) handleVolume(e)
    }
    const handleMouseUp = () => {
      setIsScrubbing(false)
      setIsVolScrubbing(false)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isScrubbing, isVolScrubbing, duration])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur()
        return
      }

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'h': // Prev (Vim style)
          prevTrack()
          break
        case 'k': // Volume Up
          changeVolume(Math.min(1, volume + 0.1))
          break
        case 'j': // Volume Down
          changeVolume(Math.max(0, volume - 0.1))
          break
        case 'arrowright':
          if (e.ctrlKey) {
            e.preventDefault()
            nextTrack()
          }
          break
        case 'arrowleft':
          if (e.ctrlKey) {
            e.preventDefault()
            prevTrack()
          }
          break
        case 'arrowup':
          if (e.ctrlKey) {
            e.preventDefault()
            changeVolume(Math.min(1, volume + 0.1))
          }
          break
        case 'arrowdown':
          if (e.ctrlKey) {
            e.preventDefault()
            changeVolume(Math.max(0, volume - 0.1))
          }
          break
        case 's':
          e.preventDefault()
          toggleShuffle()
          break
        case 'l':
          e.preventDefault()
          cycleLoopMode()
          break
        case 'n': // Toggle Now Playing
          setShowNowPlaying(!showNowPlaying)
          break
        case 'q': // Toggle Queue
          setIsQueueVisible(!isQueueVisible)
          break
        case 'escape':
          if (isQueueVisible) setIsQueueVisible(false)
          else if (showNowPlaying) setShowNowPlaying(false)
          break
        case '1': navigate('/'); break
        case '2': navigate('/albums'); break
        case '3': navigate('/playlists'); break
        case '4': navigate('/search'); break
        case '5': navigate('/settings'); break
        default: break
      }
      
      // Zoom handling (Ctrl + = / Ctrl + -)
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        if (window.electronAPI && window.electronAPI.zoomIn) {
          window.electronAPI.zoomIn()
        }
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        if (window.electronAPI && window.electronAPI.zoomOut) {
          window.electronAPI.zoomOut()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlayPause, nextTrack, prevTrack, volume, changeVolume, isQueueVisible, setIsQueueVisible, showNowPlaying, navigate])

  const handleVolumeFallback = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    changeVolume(percent)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isScrubbing) {
        const scrubber = document.getElementById('seek-scrubber')
        if (scrubber && duration) {
          const rect = scrubber.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percent = Math.max(0, Math.min(1, clickX / rect.width))
          seek(percent * duration)
        }
      }
      if (isVolScrubbing) {
        const volScrubber = document.getElementById('vol-scrubber')
        if (volScrubber) {
          const rect = volScrubber.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percent = Math.max(0, Math.min(1, clickX / rect.width))
          changeVolume(percent)
        }
      }
    }

    const handleMouseUp = () => {
      setIsScrubbing(false)
      setIsVolScrubbing(false)
    }

    if (isScrubbing || isVolScrubbing) {
      document.body.classList.add('select-none')
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      document.body.classList.remove('select-none')
    }

    return () => {
      document.body.classList.remove('select-none')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isScrubbing, isVolScrubbing, duration, seek, changeVolume])


  return (
    <div className="flex flex-col h-full w-full animate-pulse-glow">
      <WelcomeModal />
      {/* TopAppBar */}
      <header className="drag-region flex justify-between items-center w-full px-2 h-12 docked full-width top-0 border-b border-primary-container border-b-2 bg-black z-50 relative">
        <div className="font-headline-lg text-headline-lg text-primary-container uppercase tracking-tight animate-flicker select-none no-drag-region scale-110 origin-left flex items-center">
          <span>MonoKernal</span>
          <span className="ml-0.5">_</span>
        </div>
        
        {/* Scrubber in the top bar - Centered Absolute */}
        <div className="absolute left-1/2 -translate-x-1/2 no-drag-region hidden md:flex items-center w-full max-w-xl font-body-sm text-body-sm text-primary-container select-none z-10">
          <span className="mr-4 tabular-nums flex-shrink-0 font-bold opacity-80">{formatTime(progress)}</span>
          <div 
            id="seek-scrubber"
            className="flex-1 cursor-pointer h-6 flex items-center relative group"
            onMouseDown={(e) => { setIsScrubbing(true); handleSeek(e); }}
          >
            <div className="w-full h-1 border border-primary-container relative">
              <div className="h-full bg-primary-container" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${duration ? (progress / duration) * 100 : 0}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-2.5 bg-primary-container" style={{ left: `${duration ? (progress / duration) * 100 : 0}%`, opacity: isScrubbing ? 1 : 0.5 }} />
            </div>
          </div>
          <span className="ml-4 tabular-nums flex-shrink-0 font-bold opacity-80">{formatTime(duration)}</span>
        </div>

        <div className="no-drag-region flex items-center h-full flex-shrink-0">
          <button 
            onClick={minimizeApp}
            className="h-full px-3 flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-black transition-none"
            title="MINIMIZE"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="minimize">minimize</span>
          </button>
          <button 
            onClick={toggleMaximizeApp}
            className="h-full px-3 flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-black transition-none"
            title="MAXIMIZE"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="fullscreen">fullscreen</span>
          </button>
          <button 
            onClick={closeApp}
            className="h-full px-4 flex items-center justify-center text-primary-container hover:bg-red-500 hover:text-white transition-none"
            title="TERMINATE"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="close">close</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col w-64 bg-black border-r border-primary-container border-r-2 h-full flex-shrink-0 relative z-40">
          <div className="px-4 py-4 border-b border-primary-container border-dashed mb-4">
            <h2 className="text-primary-container font-bold font-body-lg text-body-lg truncate" title={scannedFolders[0] || 'AUDIO_NODE'}>
              AUDIO_NODE
            </h2>
            <p className="text-primary-container opacity-70 font-label-caps text-label-caps mt-1">
              {albums.length} ALBUMS // {tracks.length} TRACKS Indexed
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <NavLink to="/" className={({isActive}) => `font-bold w-full flex items-center px-4 py-2 font-body-sm text-body-sm cursor-pointer transition-none ${isActive ? 'filled-glow sidebar-glow' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}>
                  <span className="material-symbols-outlined mr-3" data-icon="library_music">library_music</span>
                  LIBRARY
                </NavLink>
              </li>
              <li>
                <NavLink to="/albums" className={({isActive}) => `flex items-center px-4 py-2 transition-none cursor-pointer font-body-sm text-body-sm ${isActive ? 'filled-glow sidebar-glow' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}>
                  <span className="material-symbols-outlined mr-3" data-icon="album">album</span>
                  ALBUMS
                </NavLink>
              </li>
              <li>
                <NavLink to="/playlists" className={({isActive}) => `flex items-center px-4 py-2 transition-none cursor-pointer font-body-sm text-body-sm ${isActive ? 'filled-glow sidebar-glow' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}>
                  <span className="material-symbols-outlined mr-3" data-icon="queue_music">queue_music</span>
                  PLAYLISTS
                </NavLink>
              </li>
              <li>
                <NavLink to="/search" className={({isActive}) => `flex items-center px-4 py-2 transition-none cursor-pointer font-body-sm text-body-sm ${isActive ? 'filled-glow sidebar-glow' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}>
                  <span className="material-symbols-outlined mr-3" data-icon="search">search</span>
                  SEARCH
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" className={({isActive}) => `flex items-center px-4 py-2 transition-none cursor-pointer font-body-sm text-body-sm ${isActive ? 'filled-glow sidebar-glow' : 'text-primary-container hover:bg-primary-container hover:text-black'}`}>
                  <span className="material-symbols-outlined mr-3" data-icon="settings">settings</span>
                  SETTINGS
                </NavLink>
              </li>
            </ul>
          </nav>
          
          {/* Currently Playing Album Art */}
          <div className="w-full px-4 mb-2 select-none cursor-pointer" onClick={() => currentTrack && setShowNowPlaying(true)}>
            {currentTrack && currentTrack.picture ? (
              <div className="w-full aspect-square bg-zinc-900 border border-primary-container/30 dotted-overlay crt-overlay overflow-hidden relative group">
                <img src={currentTrack.picture} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-none">
                  <span className="text-primary-container text-xs uppercase tracking-widest">NOW_PLAYING</span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square border border-primary-container/30 flex items-center justify-center bg-zinc-950 overflow-hidden p-3">
                {/* Retro Cassette Tape */}
                <svg viewBox="0 0 200 140" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 6px var(--accent-color))' }}>
                  {/* Cassette body */}
                  <rect x="5" y="5" width="190" height="130" rx="8" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" opacity="0.6" />
                  <rect x="12" y="12" width="176" height="116" rx="5" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                  
                  {/* Label area */}
                  <rect x="30" y="18" width="140" height="45" rx="2" fill="none" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                  <line x1="40" y1="30" x2="160" y2="30" stroke="var(--accent-color)" strokeWidth="0.3" opacity="0.3" />
                  <line x1="40" y1="38" x2="160" y2="38" stroke="var(--accent-color)" strokeWidth="0.3" opacity="0.3" />
                  <line x1="40" y1="46" x2="120" y2="46" stroke="var(--accent-color)" strokeWidth="0.3" opacity="0.3" />
                  <text x="100" y="35" textAnchor="middle" fill="var(--accent-color)" fontSize="6" fontFamily="monospace" opacity="0.5">MONOKERNAL</text>
                  <text x="100" y="50" textAnchor="middle" fill="var(--accent-color)" fontSize="4" fontFamily="monospace" opacity="0.35">AUDIO CASSETTE</text>
                  
                  {/* Tape window */}
                  <rect x="35" y="70" width="130" height="40" rx="3" fill="rgba(255,255,255,0.03)" stroke="var(--accent-color)" strokeWidth="1" opacity="0.5" />
                  
                  {/* Left reel */}
                  <g className={isPlaying ? 'animate-spin-slow' : ''} style={{ transformOrigin: '70px 90px' }}>
                    <circle cx="70" cy="90" r="16" fill="none" stroke="var(--accent-color)" strokeWidth="1" opacity="0.6" />
                    <circle cx="70" cy="90" r="12" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                    <circle cx="70" cy="90" r="4" fill="none" stroke="var(--accent-color)" strokeWidth="1" opacity="0.7" />
                    {/* Spokes */}
                    <line x1="70" y1="78" x2="70" y2="74" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="80" y1="84" x2="83" y2="81" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="80" y1="96" x2="83" y2="99" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="70" y1="102" x2="70" y2="106" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="60" y1="96" x2="57" y2="99" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="60" y1="84" x2="57" y2="81" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                  </g>
                  
                  {/* Right reel */}
                  <g className={isPlaying ? 'animate-spin-slow' : ''} style={{ transformOrigin: '130px 90px' }}>
                    <circle cx="130" cy="90" r="16" fill="none" stroke="var(--accent-color)" strokeWidth="1" opacity="0.6" />
                    <circle cx="130" cy="90" r="12" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                    <circle cx="130" cy="90" r="4" fill="none" stroke="var(--accent-color)" strokeWidth="1" opacity="0.7" />
                    {/* Spokes */}
                    <line x1="130" y1="78" x2="130" y2="74" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="140" y1="84" x2="143" y2="81" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="140" y1="96" x2="143" y2="99" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="130" y1="102" x2="130" y2="106" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="120" y1="96" x2="117" y2="99" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                    <line x1="120" y1="84" x2="117" y2="81" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.4" />
                  </g>

                  {/* Tape path between reels */}
                  <path d="M 86 90 Q 100 75, 114 90" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                  <path d="M 86 90 Q 100 105, 114 90" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                  
                  {/* Bottom screws */}
                  <circle cx="25" cy="120" r="3" fill="none" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.3" />
                  <circle cx="175" cy="120" r="3" fill="none" stroke="var(--accent-color)" strokeWidth="0.8" opacity="0.3" />
                  <line x1="23" y1="118" x2="27" y2="122" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                  <line x1="173" y1="118" x2="177" y2="122" stroke="var(--accent-color)" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-primary-container border-dashed mt-auto">
            <div className="text-primary-container opacity-70 font-label-caps text-label-caps leading-relaxed">
              &gt; STATUS: ONLINE<br/>
              {currentTrack && (
                <>
                  &gt; DECODE: {currentTrack.path?.split('.').pop()?.toUpperCase() || 'PCM'} [320K]<br/>
                </>
              )}
              &gt; MEM: 640K OK<br/>
              &gt; _<span className="animate-pulse">█</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Outlet />
          <QueuePanel />
        </div>
      </div>

      {/* BottomNavBar */}
      <footer className="w-full z-50 h-16 flex justify-between items-center px-8 bg-black border-t-2 border-primary-container border-t-4 border-double font-mono text-xs font-bold text-primary-container shrink-0">
        <div className="hidden md:flex items-center space-x-4 w-1/3 overflow-hidden">
          <div className="font-body-sm text-body-sm truncate text-primary-container">
            {currentTrack ? `> ${currentTrack.title} - ${currentTrack.artist}` : "> NO TRACK SELECTED"}
          </div>
        </div>
        
        <div className="flex justify-center items-center space-x-2 w-full md:w-1/3">
          <button onClick={toggleShuffle} className={`px-2 py-1 border active:translate-y-0.5 transition-none flex items-center ${isShuffle ? 'filled-glow border-primary-container' : 'text-primary-container border-primary-container hover:bg-primary-container hover:text-black'}`} title="TOGGLE SHUFFLE">
            <span className="material-symbols-outlined text-[18px]" data-icon="shuffle">shuffle</span>
          </button>
          <button onClick={prevTrack} className="text-primary-container px-3 py-1 border border-primary-container hover:bg-primary-container hover:text-black active:translate-y-0.5 transition-none flex items-center font-label-caps text-label-caps">
            <span className="material-symbols-outlined mr-1" data-icon="skip_previous">skip_previous</span> PREV
          </button>
          <button onClick={togglePlayPause} className="filled-glow px-6 py-2 border border-primary-container hover:opacity-80 active:translate-y-0.5 transition-none flex items-center font-label-caps text-label-caps">
            <span className="material-symbols-outlined mr-1" data-icon={isPlaying ? "pause" : "play_arrow"}>{isPlaying ? "pause" : "play_arrow"}</span> {isPlaying ? "PAUSE" : "PLAY"}
          </button>
          <button onClick={nextTrack} className="text-primary-container px-3 py-1 border border-primary-container hover:bg-primary-container hover:text-black active:translate-y-0.5 transition-none flex items-center font-label-caps text-label-caps">
            <span className="material-symbols-outlined mr-1" data-icon="skip_next">skip_next</span> NEXT
          </button>
          <button onClick={cycleLoopMode} className={`px-2 py-1 border active:translate-y-0.5 transition-none flex items-center ${loopMode !== 'off' ? 'filled-glow border-primary-container' : 'text-primary-container border-primary-container hover:bg-primary-container hover:text-black'}`} title={`LOOP: ${loopMode.toUpperCase()}`}>
            <span className="material-symbols-outlined text-[18px]" data-icon={loopMode === 'one' ? 'repeat_one' : 'repeat'}>{loopMode === 'one' ? 'repeat_one' : 'repeat'}</span>
          </button>
        </div>

        <div className="hidden md:flex justify-end items-center space-x-6 w-1/3 font-body-sm text-body-sm select-none">
          <div className="flex items-center w-48">
            <span className="mr-3 opacity-70">VOL:</span>
            <div 
              id="vol-scrubber"
              className="flex-1 cursor-pointer h-6 flex items-center relative group"
              onMouseDown={(e) => { setIsVolScrubbing(true); handleVolume(e); }}
            >
              <div className="w-full h-1.5 border border-primary-container relative">
                <div className="h-full bg-primary-container" style={{ width: `${volume * 100}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${volume * 100}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-primary-container" style={{ left: `${volume * 100}%`, opacity: isVolScrubbing ? 1 : 0.5 }} />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsQueueVisible(!isQueueVisible)}
            className={`ml-4 px-2 border hover:bg-primary-container hover:text-black transition-none uppercase tracking-widest ${isQueueVisible ? 'bg-primary-container text-black border-primary-container' : 'border-primary-container text-primary-container'}`}
          >
            [QUEUE]
          </button>
        </div>
      </footer>

      {showNowPlaying && (
        <NowPlayingView onClose={() => setShowNowPlaying(false)} />
      )}
    </div>
  )
}
