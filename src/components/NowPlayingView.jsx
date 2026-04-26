import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAudio } from '../context/AudioContext'

const VISUALIZERS = [
  { id: 'spectrum', name: 'SPECTRUM' },
  { id: 'waveform', name: 'WAVEFORM' },
  { id: 'particles', name: 'PARTICLES' },
  { id: 'geometric', name: 'GEOMETRIC' },
  { id: 'retro', name: 'RETRO' },
  { id: 'cyberpunk', name: 'CYBERPUNK' },
  { id: 'circular', name: 'CIRCULAR' },
]

// ---- Drawing functions ----
function drawSpectrum(ctx, w, h, dataArray, bufLen, accentColor) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  const bars = 64, bw = (w / bars) - 2, step = Math.floor(bufLen / bars)
  for (let i = 0; i < bars; i++) {
    const v = dataArray[i * step], bh = (v / 255) * (h - 30), x = i * (bw + 2), y = h - 20 - bh
    ctx.fillStyle = v / 255 > 0.7 ? accentColor : v / 255 > 0.4 ? accentColor + 'cc' : accentColor + '88'
    ctx.fillRect(x, y, bw, bh)
  }
  ctx.fillStyle = accentColor + '60'; ctx.font = '9px monospace'
  ;['20Hz','100Hz','1KHz','5KHz','10KHz','20KHz'].forEach((l, i, a) => ctx.fillText(l, (i / (a.length - 1)) * (w - 50) + 5, h - 4))
}

function drawWaveform(ctx, w, h, timeArray, bufLen, accentColor) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = accentColor; ctx.lineWidth = 2; ctx.beginPath()
  const slice = w / bufLen
  for (let i = 0; i < bufLen; i++) {
    const v = timeArray[i] / 128.0, y = (v * h) / 2
    i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y)
  }
  ctx.stroke()
  // Mirror
  ctx.strokeStyle = accentColor + '40'; ctx.lineWidth = 1; ctx.beginPath()
  for (let i = 0; i < bufLen; i++) {
    const v = timeArray[i] / 128.0, y = h - (v * h) / 2
    i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y)
  }
  ctx.stroke()
}

function drawParticles(ctx, w, h, dataArray, bufLen, particles, accentColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, w, h)
  let bass = 0; for (let i = 0; i < 10; i++) bass += dataArray[i]; bass /= 10
  const energy = bass / 255
  particles.forEach(p => {
    p.x += p.vx * (1 + energy * 3); p.y += p.vy * (1 + energy * 3)
    p.life -= 0.005; p.size = p.baseSize * (1 + energy * 2)
    if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.life <= 0) {
      p.x = w / 2 + (Math.random() - 0.5) * 100; p.y = h / 2 + (Math.random() - 0.5) * 100
      p.vx = (Math.random() - 0.5) * 3; p.vy = (Math.random() - 0.5) * 3; p.life = 1
    }
    const a = Math.max(0, p.life)
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = accentColor + Math.floor(a * 200).toString(16).padStart(2,'0')
    ctx.fill()
  })
}

function drawGeometric(ctx, w, h, dataArray, bufLen, frame, accentColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2
  let bass = 0; for (let i = 0; i < 8; i++) bass += dataArray[i]; bass /= 8 * 255
  for (let r = 3; r >= 1; r--) {
    const sides = r + 4, radius = 50 * r * (1 + bass * 0.5), rot = frame * 0.005 * (r % 2 === 0 ? 1 : -1)
    ctx.strokeStyle = accentColor + (r === 3 ? '88' : r === 2 ? 'cc' : 'ff')
    ctx.lineWidth = 1 + bass * 3; ctx.beginPath()
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 + rot, x = cx + Math.cos(a) * radius, y = cy + Math.sin(a) * radius
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath(); ctx.stroke()
  }
}

function drawRetro(ctx, w, h, dataArray, bufLen, accentColor) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  const cols = 32, rows = 16, cw = w / cols, ch = h / rows, step = Math.floor(bufLen / cols)
  for (let c = 0; c < cols; c++) {
    const v = dataArray[c * step] / 255, filled = Math.floor(v * rows)
    for (let r = 0; r < rows; r++) {
      const y = h - (r + 1) * ch
      if (r < filled) {
        const bright = r / rows
        ctx.fillStyle = bright > 0.8 ? accentColor : bright > 0.5 ? accentColor + 'cc' : accentColor + '88'
        ctx.font = `${Math.floor(ch * 0.9)}px monospace`
        ctx.fillText('█', c * cw + 2, y + ch - 2)
      } else {
        ctx.fillStyle = '#1a1a0a'; ctx.font = `${Math.floor(ch * 0.9)}px monospace`
        ctx.fillText('░', c * cw + 2, y + ch - 2)
      }
    }
  }
}

function drawCyberpunk(ctx, w, h, dataArray, bufLen, frame, accentColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, w, h)
  let bass = 0; for (let i = 0; i < 10; i++) bass += dataArray[i]; bass /= 10 * 255
  // Grid
  ctx.strokeStyle = accentColor + '33'; ctx.lineWidth = 0.5
  const gSize = 30, offy = (frame * 0.5) % gSize
  for (let y = 0; y < h; y += gSize) { ctx.beginPath(); ctx.moveTo(0, y + offy); ctx.lineTo(w, y + offy); ctx.stroke() }
  for (let x = 0; x < w; x += gSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  // Horizon bars
  const bars = 48, bw = w / bars
  for (let i = 0; i < bars; i++) {
    const v = dataArray[Math.floor(i * bufLen / bars)] / 255, bh = v * h * 0.6
    ctx.fillStyle = accentColor + Math.floor(0.3 + v * 0.7 * 255).toString(16).padStart(2,'0')
    ctx.fillRect(i * bw, h - bh, bw - 1, bh)
  }
}

function drawCircular(ctx, w, h, dataArray, bufLen, frame, accentColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2, baseR = Math.min(w, h) * 0.2, bars = 128
  for (let i = 0; i < bars; i++) {
    const a = (i / bars) * Math.PI * 2 - Math.PI / 2, v = dataArray[Math.floor(i * bufLen / bars)] / 255
    const r1 = baseR, r2 = baseR + v * Math.min(w, h) * 0.25
    const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1
    const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2
    ctx.strokeStyle = v > 0.6 ? accentColor : v > 0.3 ? accentColor + 'cc' : accentColor + '88'
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
}

export default function NowPlayingView({ onClose }) {
  const { 
    currentTrack, isPlaying, progress, duration, volume,
    togglePlayPause, nextTrack, prevTrack, seek, changeVolume,
    queue, queueIndex, getAnalyser, isQueueVisible, setIsQueueVisible
  } = useAudio()
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)
  const particlesRef = useRef(Array.from({ length: 200 }, () => ({
    x: Math.random() * 800, y: Math.random() * 600, vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2, life: Math.random(), size: Math.random() * 2 + 1, baseSize: Math.random() * 2 + 1
  })))
  const [vizMode, setVizMode] = useState('spectrum')
  const [isSeeking, setIsSeeking] = useState(false)
  const [isVolDrag, setIsVolDrag] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 500) // Match animation duration
  }, [onClose])

  const formatTime = (s) => { if (!s || isNaN(s)) return "00:00"; return `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}` }

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    let analyser
    try { analyser = getAnalyser() } catch { return }
    if (!analyser) return
    const ctx = canvas.getContext('2d')
    const bufLen = analyser.frequencyBinCount
    const freqData = new Uint8Array(bufLen), timeData = new Uint8Array(bufLen)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      frameRef.current++
      const W = canvas.width, H = canvas.height
      analyser.getByteFrequencyData(freqData); analyser.getByteTimeDomainData(timeData)
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim()
      if (vizMode === 'spectrum') drawSpectrum(ctx, W, H, freqData, bufLen, accent)
      else if (vizMode === 'waveform') drawWaveform(ctx, W, H, timeData, bufLen, accent)
      else if (vizMode === 'particles') drawParticles(ctx, W, H, freqData, bufLen, particlesRef.current, accent)
      else if (vizMode === 'geometric') drawGeometric(ctx, W, H, freqData, bufLen, frameRef.current, accent)
      else if (vizMode === 'retro') drawRetro(ctx, W, H, freqData, bufLen, accent)
      else if (vizMode === 'cyberpunk') drawCyberpunk(ctx, W, H, freqData, bufLen, frameRef.current, accent)
      else if (vizMode === 'circular') drawCircular(ctx, W, H, freqData, bufLen, frameRef.current, accent)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [getAnalyser, isPlaying, vizMode])

  // Keydown listener for ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true) // use capture to beat layout listener
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleClose])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const resize = () => { const p = canvas.parentElement; if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight } }
    resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize)
  }, [])

  // Drag seek/vol
  const handleSeekDown = (e) => { setIsSeeking(true); doSeek(e) }
  const handleVolDown = (e) => { setIsVolDrag(true); doVol(e) }
  const doSeek = (e) => { const r = e.currentTarget.getBoundingClientRect(); seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration) }
  const doVol = (e) => { const r = e.currentTarget.getBoundingClientRect(); changeVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))) }

  useEffect(() => {
    const move = (e) => {
      if (isSeeking) { const el = document.getElementById('np-seek'); if (el && duration) { const r = el.getBoundingClientRect(); seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration) } }
      if (isVolDrag) { const el = document.getElementById('np-vol'); if (el) { const r = el.getBoundingClientRect(); changeVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))) } }
    }
    const up = () => { setIsSeeking(false); setIsVolDrag(false) }
    if (isSeeking || isVolDrag) { document.body.classList.add('select-none'); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up) }
    else { document.body.classList.remove('select-none') }
    return () => { document.body.classList.remove('select-none'); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [isSeeking, isVolDrag, duration])

  const nextInQueue = queue[queueIndex + 1] || null
  if (!currentTrack) return null

  return (
    <div className={`fixed inset-0 z-[150] bg-black flex flex-col font-mono text-primary-container overflow-hidden no-drag-region ${isExiting ? 'animate-now-playing-exit' : 'animate-now-playing'}`}>
      {/* Main two-column layout */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden min-h-0">

        {/* LEFT: Album + Controls + Track Info */}
        <div className="flex flex-col w-full md:w-[340px] flex-shrink-0 gap-3 overflow-y-auto scrollbar-hide">
          {/* Album Art */}
          <div className="border border-primary-container">
            <div className="text-[11px] uppercase tracking-widest opacity-40 mb-1 px-2 pt-2">FILE_IMG_REF: {currentTrack.album?.toUpperCase().replace(/\s/g, '_') || 'UNKNOWN'}</div>
            <div className="p-4">
              <div className="w-full aspect-square bg-zinc-900 dotted-overlay crt-overlay overflow-hidden border border-primary-container/30 flex items-center justify-center">
                {currentTrack.picture ? (
                  <img src={currentTrack.picture} alt="" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-container/20 text-5xl">♫</div>
                )}
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={prevTrack} className="border border-primary-container px-4 py-2 text-sm hover:bg-primary-container hover:text-black transition-none font-bold uppercase flex items-center gap-2">
              <span className="material-symbols-outlined !text-sm" data-icon="skip_previous">skip_previous</span> PREV
            </button>
            <button onClick={togglePlayPause} className="filled-glow px-6 py-2 text-sm font-bold uppercase transition-none hover:bg-primary-container/80 flex items-center gap-2">
              <span className="material-symbols-outlined !text-sm" data-icon={isPlaying ? "pause" : "play_arrow"}>{isPlaying ? "pause" : "play_arrow"}</span> {isPlaying ? "PAUSE" : "PLAY"}
            </button>
            <button onClick={nextTrack} className="border border-primary-container px-4 py-2 text-sm hover:bg-primary-container hover:text-black transition-none font-bold uppercase flex items-center gap-2">
              <span className="material-symbols-outlined !text-sm" data-icon="skip_next">skip_next</span> NEXT
            </button>
          </div>
          {/* Track Info */}
          <div className="border border-primary-container p-3">
            <div className="text-[11px] uppercase tracking-widest opacity-40 mb-0.5">IDENTIFIER: TRACK_NODE_{(queueIndex + 1).toString().padStart(3, '0')}</div>
            <div className="text-base font-bold uppercase truncate">{currentTrack.title}</div>
            <div className="text-[11px] uppercase tracking-widest opacity-40 mt-2 mb-0.5">SOURCE: ARTIST_ENTITY</div>
            <div className="text-sm font-bold uppercase truncate">{currentTrack.artist}</div>
            <div className="flex justify-between text-xs mt-3 opacity-60"><span>{formatTime(progress)}</span><span>PROGRESS</span><span>{formatTime(duration)}</span></div>
            <div id="np-seek" className="mt-1 cursor-pointer select-none h-4 flex items-center" onMouseDown={handleSeekDown}>
              <div className="w-full h-2 border border-primary-container relative">
                <div className="h-full bg-primary-container" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-primary-container" style={{ left: `${duration ? (progress / duration) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
          {/* Volume */}
          <div className="border border-primary-container/30 border-dashed p-3 flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest opacity-50 flex-shrink-0">VOL:</span>
            <div id="np-vol" className="flex-1 cursor-pointer select-none h-4 flex items-center" onMouseDown={handleVolDown}>
              <div className="w-full h-2 border border-primary-container relative">
                <div className="h-full bg-primary-container" style={{ width: `${volume * 100}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-primary-container" style={{ left: `${volume * 100}%` }} />
              </div>
            </div>
            <span className="text-xs opacity-50">{Math.round(volume * 100)}%</span>
          </div>
          {/* Tech info */}
          <div className="border border-primary-container/30 border-dashed p-2 text-[11px] uppercase tracking-wider opacity-40">
            <div>BITRATE: 320 KBPS / 44.1 KHZ</div>
            <div>ENCODER: CHROMIUM_MEDIA_V3</div>
            <div>BUFFER: 100% [STABLE]</div>
          </div>
        </div>

        {/* RIGHT: Visualizer + Selector + Logs */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          {/* Visualizer */}
          <div className="border border-primary-container flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center px-3 py-1.5 border-b border-primary-container/30 flex-shrink-0 relative">
              <h2 className="text-sm font-bold uppercase tracking-widest">REAL-TIME_FREQ_ANALYSIS</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); handleClose(); }} 
                className="w-8 h-8 flex items-center justify-center border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black transition-none cursor-pointer no-drag-region group"
                title="EXIT VIEW"
              >
                <span className="material-symbols-outlined !text-xl group-hover:scale-110 transition-transform">close</span>
              </button>
            </div>
            <div className="flex-1 relative min-h-0"><canvas ref={canvasRef} className="w-full h-full block" /></div>
          </div>
          {/* Visualizer Selector */}
          <div className="flex flex-wrap gap-1.5 flex-shrink-0">
            {VISUALIZERS.map(v => (
              <button key={v.id} onClick={() => setVizMode(v.id)} className={`px-2 py-1 text-xs uppercase tracking-widest border transition-none ${vizMode === v.id ? 'bg-primary-container text-black border-primary-container font-bold' : 'border-primary-container/40 text-primary-container/60 hover:border-primary-container hover:text-primary-container'}`}>{v.name}</button>
            ))}
          </div>
          {/* System Log */}
          <div className="border border-primary-container/30 p-3 flex-shrink-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-1.5 opacity-60">SYSTEM_LOG_OUTPUT:</div>
            <div className="text-xs space-y-0.5 opacity-50">
              <div>&gt; [INFO] LOADING ASSETS FROM SECTOR_7... OK</div>
              <div>&gt; [INFO] FREQUENCY SYNC ESTABLISHED.</div>
              <div>&gt; [WARN] LATENCY JITTER DETECTED (0.02ms).</div>
              <div>&gt; [INFO] NOW PLAYING: {currentTrack.title?.toUpperCase()} // {currentTrack.artist?.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-container px-4 py-2 flex items-center justify-between flex-shrink-0 text-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="uppercase tracking-widest opacity-60 flex-shrink-0">UP_NEXT:</span>
          {nextInQueue ? <><span className="font-bold truncate">[ {nextInQueue.title?.toUpperCase()} ] - BY: {nextInQueue.artist?.toUpperCase()}</span><span className="opacity-40 flex-shrink-0">{formatTime(nextInQueue.duration)}</span></> : <span className="opacity-40">NO_MORE_TRACKS</span>}
        </div>
        <button 
          onClick={() => setIsQueueVisible(!isQueueVisible)}
          className={`ml-4 px-2 border hover:bg-primary-container hover:text-black transition-none uppercase tracking-widest ${isQueueVisible ? 'bg-primary-container text-black border-primary-container' : 'border-primary-container text-primary-container'}`}
        >
          [QUEUE]
        </button>
      </div>
    </div>
  )
}
