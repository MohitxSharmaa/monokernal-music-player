import React, { useState } from 'react'
import { useLibrary, THEMES } from '../context/LibraryContext'
import { useAudio } from '../context/AudioContext'

export default function SettingsView() {
   const { scannedFolders, scanFolder, clearLibrary, isScanning, currentTheme, setCurrentTheme, refreshLibrary } = useLibrary()
  const { eqGains, changeEqGain, setEqGains, EQ_FREQS } = useAudio()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const EQ_PRESETS = [
    { name: 'FLAT', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'BASS BOOST', values: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
    { name: 'TREBLE BOOST', values: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6] },
    { name: 'VOCAL', values: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2] },
    { name: 'ELECTRONIC', values: [5, 4, 2, 0, -2, 2, 4, 5, 6, 5] },
    { name: 'ROCK', values: [4, 3, 2, -1, -2, -1, 1, 2, 3, 4] }
  ]

  return (
    <main className="w-full h-full overflow-y-auto pb-24 pt-6 px-8 scrollbar-hide bg-black text-primary-container">
      <div className="mb-8 border-b border-primary-container/30 pb-2">
        <h1 className="font-headline-lg text-headline-lg uppercase text-primary-container">SYSTEM_SETTINGS</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md mb-4 border-b border-primary-container/30 pb-2">LIBRARY MANAGEMENT</h2>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">MOUNTED DIRECTORIES</h3>
            {scannedFolders.length === 0 ? (
              <div className="opacity-50 italic">NO DIRECTORIES MOUNTED.</div>
            ) : (
              <ul className="space-y-2 mb-4">
                {scannedFolders.map((folder, i) => (
                  <li key={i} className="bg-primary-container/10 p-2 font-mono text-sm border border-primary-container/30 break-all">
                    {folder}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex space-x-4 mt-4">
              <button 
                onClick={scanFolder} 
                disabled={isScanning}
                className="border border-primary-container px-4 py-2 hover:bg-primary-container hover:text-black transition-none uppercase"
              >
                {isScanning ? "[ SCANNING... ]" : "[ ADD DIRECTORY ]"}
              </button>

              <button 
                onClick={refreshLibrary}
                disabled={isScanning}
                className="border border-primary-container px-4 py-2 hover:bg-primary-container hover:text-black transition-none uppercase flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]" data-icon="refresh">refresh</span>
                {isScanning ? "[ SCANNING... ]" : "[ REFRESH LIBRARY ]"}
              </button>

              <button 
                onClick={clearLibrary}
                className="border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black transition-none uppercase"
              >
                [ PURGE LIBRARY ]
              </button>
            </div>

          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md mb-4 border-b border-primary-container/30 pb-2">THEME CUSTOMIZATION</h2>
          
          <div className="max-w-md">
            <label className="text-[10px] uppercase tracking-widest opacity-60 mb-3 block">SELECT_ACTIVE_COLOR_PROTOCOL</label>
            
            <div className="relative group z-30">
              <div 
                className="w-full bg-black border-2 border-primary-container text-primary-container p-4 font-headline-md text-lg uppercase flex justify-between items-center cursor-pointer hover:bg-primary-container/10 transition-all active:scale-[0.99]"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{THEMES.find(t => t.id === currentTheme)?.name}</span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-black border-2 border-primary-container shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden animate-entry">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {THEMES.map(theme => (
                      <div 
                        key={theme.id}
                        onClick={() => {
                          setCurrentTheme(theme.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`px-4 py-3 font-headline-md text-lg uppercase cursor-pointer transition-all flex items-center justify-between
                          ${currentTheme === theme.id ? 'bg-primary-container text-black' : 'hover:bg-primary-container/20 text-primary-container'}
                        `}
                      >
                        <span>{theme.name}</span>
                        <div 
                          className="w-3 h-3 rounded-full border border-current"
                          style={{ backgroundColor: theme.color }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex items-center space-x-6 p-5 border border-primary-container/30 bg-primary-container/5 animate-entry relative overflow-hidden">
               <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary-container text-black text-[9px] font-black uppercase">LIVE_PREVIEW</div>
               <div 
                  className="w-16 h-16 border-2 border-primary-container filled-glow" 
                  style={{ backgroundColor: THEMES.find(t => t.id === currentTheme)?.color }}
                />
                <div className="flex-1">
                   <div className="text-[10px] opacity-50 uppercase tracking-widest mb-1">ACTIVE_PROFILE</div>
                   <div className="font-headline-lg text-2xl uppercase tracking-tighter leading-tight">{THEMES.find(t => t.id === currentTheme)?.name}</div>
                   <div className="font-mono text-[10px] opacity-40 uppercase">CSS_VAR: --ACCENT-COLOR</div>
                </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] opacity-50 uppercase tracking-widest">
            * ACCENT COLOR WILL RE-MAP ALL SYSTEM INTERFACES
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md mb-4 border-b border-primary-container/30 pb-2">10-BAND EQUALIZER</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {EQ_PRESETS.map(preset => {
              const isActive = preset.values.every((v, i) => v === eqGains[i])
              return (
                <button
                  key={preset.name}
                  onClick={() => setEqGains(preset.values)}
                  className={`px-3 py-1 border transition-none uppercase text-[10px] ${
                    isActive 
                      ? 'bg-primary-container text-black border-primary-container font-bold shadow-[0_0_10px_var(--accent-color)]' 
                      : 'border-primary-container/30 text-primary-container/70 hover:bg-primary-container hover:text-black'
                  }`}
                >
                  {preset.name}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between h-64 bg-zinc-950/50 p-6 border-2 border-primary-container rounded-sm relative overflow-hidden dotted-overlay">
            {eqGains.map((gain, i) => (
              <div key={i} className="flex flex-col items-center h-full group relative z-10">
                {/* Vertical Slider Container */}
                <div className="relative w-8 h-40 flex flex-col items-center">
                  {/* Full Track (Dotted background for retro feel) */}
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] opacity-30"
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom, var(--accent-color) 50%, transparent 50%)`,
                      backgroundSize: '1px 4px'
                    }} 
                  />

                  {/* 0dB Reference Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-primary-container/40 shadow-[0_0_5px_var(--accent-color)]" />
                  
                  {/* Ticks */}
                  {[12, 6, -6, -12].map(tick => (
                    <div 
                      key={tick} 
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-[1px] bg-primary-container/20"
                      style={{ bottom: `${((tick + 12) / 24) * 100}%` }}
                    />
                  ))}

                  <input 
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gain}
                    onChange={(e) => changeEqGain(i, parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
                    style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' }}
                  />

                  {/* Visual Fader Handle */}
                  <div 
                    className="absolute left-0 right-0 h-2 bg-primary-container shadow-[0_0_15px_var(--accent-color)] pointer-events-none transition-all duration-75 z-10"
                    style={{ bottom: `calc(${((gain + 12) / 24) * 100}% - 4px)` }}
                  />
                  
                  {/* Active Fill Bar */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-[4px] bg-primary-container shadow-[0_0_10px_var(--accent-color)] pointer-events-none"
                    style={{ 
                      bottom: gain >= 0 ? '50%' : `${((gain + 12) / 24) * 100}%`,
                      height: `${Math.abs(gain / 24) * 100}%`
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-col items-center space-y-1">
                  <span className="text-xs font-mono font-bold text-primary-container uppercase no-glow">
                    {gain > 0 ? `+${gain}` : gain}DB
                  </span>
                  <div className="w-8 h-[1px] bg-primary-container/30" />
                  <span className="text-[11px] font-mono font-bold opacity-60 text-primary-container no-glow">
                    {EQ_FREQS[i] < 1000 ? EQ_FREQS[i] : (EQ_FREQS[i]/1000) + 'K'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md mb-4 border-b border-primary-container/30 pb-2">AUDIO PROTOCOL</h2>
          <div className="font-mono text-sm opacity-70 space-y-2">
            <p>&gt; DECODER: HTML5_AUDIO_API</p>
            <p>&gt; PROTOCOL: media://</p>
            <p>&gt; STATUS: ONLINE</p>
          </div>
        </section>

        <section className="mb-24 pt-8 border-t border-primary-container/30">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h2 className="font-headline-lg text-2xl uppercase tracking-tighter mb-4">&gt; ABOUT_CORE</h2>
              <div className="space-y-4">
                <div className="bg-primary-container text-black px-3 py-1 font-black text-xl w-fit skew-x-[-12deg]">
                  MONOKERNAL v1.0.0
                </div>
                <p className="font-mono text-sm leading-relaxed opacity-70 max-w-md">
                  RETRO TERMINAL-BASED OFFLINE MUSIC PLAYER BUILT FOR SPEED, SIMPLICITY, AND HIGH-FIDELITY AESTHETIC.
                </p>
                <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-4">
                  © 2026 MONOKERNAL // ALL_SYSTEMS_OPERATIONAL
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[280px]">
              <div className="border border-primary-container p-6 bg-primary-container/5 relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-primary-container/10 rotate-45 translate-x-6 -translate-y-6" />
                
                <h3 className="font-headline-md text-sm mb-6 border-b border-primary-container/30 pb-2 uppercase tracking-widest opacity-60">IDENT_PROFILE: DEV</h3>
                <div className="space-y-4 font-mono">
                  <div>
                    <div className="text-[10px] opacity-40 uppercase mb-1">NAME</div>
                    <div className="text-lg font-bold uppercase tracking-tight">MOHIT SHARMA</div>
                  </div>
                  <div>
                    <div className="text-[10px] opacity-40 uppercase mb-1">CONTACT</div>
                    <div className="text-sm border-b border-primary-container/30 w-fit hover:border-primary-container cursor-pointer">
                      mohitxwork99@gmail.com
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between items-end">
                  <div className="text-[8px] opacity-30 font-black">USER_AUTH_GRANTED</div>
                  <div className="text-primary-container opacity-20">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <rect width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                      <path d="M10 10 L30 30 M10 30 L30 10" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
