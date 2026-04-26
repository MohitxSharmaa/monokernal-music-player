import React, { useState, useEffect } from 'react'

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('monokernal_welcome_seen')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('monokernal_welcome_seen', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-black border-2 border-primary-container shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none dotted-overlay opacity-20" />
        <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />
        
        {/* Header */}
        <div className="bg-primary-container text-black px-6 py-3 flex justify-between items-center">
          <h2 className="font-headline-lg text-xl tracking-tighter uppercase font-bold">SYSTEM_INITIALIZATION_SUCCESSFUL</h2>
          <div className="animate-pulse">● ONLINE</div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto scrollbar-hide font-mono text-primary-container">
          <div className="mb-8 border-b border-primary-container/30 pb-4">
            <h1 className="text-4xl font-bold mb-2 tracking-tighter uppercase">MONOKERNAL_OS v2.0</h1>
            <p className="opacity-70 text-sm">PREMIUM RETRO-CRT AUDIO ENGINE // BUILD_7749</p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-bold bg-primary-container/10 px-2 py-1 w-fit mb-3 uppercase tracking-widest text-primary-container">01_CORE_INTERFACE</h3>
              <p className="text-sm leading-relaxed opacity-80">
                Welcome to MonoKernal. A high-fidelity audio environment designed for terminal-grade efficiency. 
                Navigate through your <span className="text-white font-bold">LIBRARY</span>, explore <span className="text-white font-bold">ALBUMS</span>, or organize your sectors into <span className="text-white font-bold">PLAYLISTS</span>.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold bg-primary-container/10 px-2 py-1 w-fit mb-3 uppercase tracking-widest text-primary-container">02_OPERATIONAL_COMMANDS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[11px] uppercase">
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">PLAY / PAUSE</span>
                  <span className="font-bold text-white">[ SPACE ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">SKIP / PREV</span>
                  <span className="font-bold text-white">[ CTRL + ←/→ ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">VOLUME ADJ</span>
                  <span className="font-bold text-white">[ CTRL + ↑/↓ ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">SHUFFLE MODE</span>
                  <span className="font-bold text-white">[ S ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">LOOP MODES</span>
                  <span className="font-bold text-white">[ L ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">NAVIGATE TABS</span>
                  <span className="font-bold text-white">[ 1 - 5 ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">BACK / EXIT</span>
                  <span className="font-bold text-white">[ ESC ]</span>
                </div>
                <div className="flex justify-between border-b border-primary-container/10 py-1">
                  <span className="opacity-50">ACTIVATE SEARCH</span>
                  <span className="font-bold text-white">[ ENTER ]</span>
                </div>
              </div>
            </section>

            <section className="bg-primary-container/5 border border-primary-container/20 p-4">
              <h3 className="text-xs font-bold mb-2 uppercase tracking-widest">SYSTEM_TIP</h3>
              <p className="text-xs opacity-60 italic">
                Right-click any track to access the Command Context Menu for adding to playlists or queueing. 
                Use the Equalizer in Settings to calibrate the phosphor-audio output.
              </p>
            </section>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleDismiss}
              className="border-2 border-primary-container px-12 py-4 text-sm font-bold uppercase tracking-[0.3em] hover:bg-primary-container hover:text-black transition-none shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] active:scale-95"
            >
              [ AUTHORIZE_ACCESS ]
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2 text-[9px] opacity-30 text-right bg-primary-container/5">
          KERNEL_AUTH_TOKEN: {Math.random().toString(36).substring(2, 15).toUpperCase()}
        </div>
      </div>
    </div>
  )
}
