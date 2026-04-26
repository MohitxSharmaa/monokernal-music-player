import { useState, useEffect } from 'react'

const BOOT_LINES = [
  { text: "MONOKERNAL BIOS v4.2.1", delay: 0 },
  { text: "Copyright (C) 2026, MonoKernal Systems Inc.", delay: 150 },
  { text: "", delay: 300 },
  { text: "Detecting hardware...", delay: 400 },
  { text: "  CPU: AudioCore X7 @ 3.2GHz .......... OK", delay: 600 },
  { text: "  RAM: 640K ............................ OK", delay: 800 },
  { text: "  DSP: WaveEngine 10-Band EQ ........... OK", delay: 1000 },
  { text: "  DAC: HiFi Protocol v3.1 .............. OK", delay: 1200 },
  { text: "  CODEC: MP3/FLAC/WAV/M4A/OGG ......... OK", delay: 1400 },
  { text: "", delay: 1500 },
  { text: "Initializing audio subsystem...", delay: 1600 },
  { text: "  media:// protocol registered", delay: 1800 },
  { text: "  Mounting filesystem drivers...", delay: 2000 },
  { text: "  IPC bridge established", delay: 2200 },
  { text: "", delay: 2300 },
  { text: "All systems nominal.", delay: 2400 },
  { text: "", delay: 2500 },
  { text: "> BOOT COMPLETE. LOADING INTERFACE...", delay: 2600 },
]

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [phase, setPhase] = useState('boot') // 'boot' | 'fadeout'

  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line.text])
      }, line.delay)
    )

    // Start fadeout after all lines
    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay
    const fadeTimer = setTimeout(() => {
      setPhase('fadeout')
    }, lastDelay + 600)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, lastDelay + 1200)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex flex-col justify-center items-start px-12 font-mono text-sm overflow-hidden transition-opacity duration-500 ${phase === 'fadeout' ? 'opacity-0' : 'opacity-100'}`}
      style={{
        textShadow: '0 0 8px var(--accent-color), 0 0 2px var(--accent-color)',
      }}
    >
      {/* CRT Scanlines Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)',
        }}
      />

      {/* Screen flicker */}
      <div
        className="pointer-events-none fixed inset-0 z-10 animate-flicker"
        style={{ background: 'transparent' }}
      />

      {/* Boot text */}
      <div className="relative z-20 max-w-2xl">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className="text-primary-container leading-relaxed animate-entry"
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            {line || '\u00A0'}
          </div>
        ))}
        {visibleLines.length < BOOT_LINES.length && (
          <span className="text-primary-container animate-pulse">█</span>
        )}
      </div>

      {/* CRT vignette corners */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)',
        }}
      />
    </div>
  )
}
