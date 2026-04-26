import React from 'react'
import { useAudio } from '../context/AudioContext'

export default function QueuePanel() {
  const { queue, queueIndex, isQueueVisible, setIsQueueVisible, playTrack, reorderQueue, removeFromQueue } = useAudio()
  const [draggedIndex, setDraggedIndex] = React.useState(null)

  const onDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const onDragOver = (e, index) => {
    e.preventDefault()
  }

  const onDrop = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null) return
    reorderQueue(draggedIndex, index)
    setDraggedIndex(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[240] backdrop-blur-[4px] transition-all duration-500 ease-out ${isQueueVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsQueueVisible(false)}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 w-96 bg-black border-l-2 border-primary-container z-[250] flex flex-col font-mono shadow-[-30px_0_80px_rgba(0,0,0,0.9)] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isQueueVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-primary-container/30 bg-primary-container/5">
          <h2 className="text-primary-container font-bold uppercase tracking-[0.25em] text-base no-glow flex items-center">
            <span className="material-symbols-outlined mr-2 !text-lg">queue_music</span>
            PLAY_QUEUE
          </h2>
          <button 
            onClick={() => setIsQueueVisible(false)}
            className="text-primary-container hover:text-white p-2 hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined !text-2xl" data-icon="close">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar no-glow">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
              <span className="material-symbols-outlined !text-6xl">leak_remove</span>
              <div className="text-sm uppercase tracking-widest font-bold">QUEUE_EMPTY_STATUS</div>
            </div>
          ) : (
            <ul className="flex flex-col p-3 space-y-2">
              {queue.map((track, i) => (
                <li 
                  key={i}
                  draggable
                  onDragStart={(e) => onDragStart(e, i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={(e) => onDrop(e, i)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`p-4 cursor-move group transition-all duration-300 relative rounded-sm
                    ${i === queueIndex ? 'bg-primary-container text-black font-black scale-[1.02] shadow-[0_0_20px_rgba(var(--accent-color),0.3)]' : 'hover:bg-primary-container/10 border border-transparent hover:border-primary-container/40'}
                    ${draggedIndex === i ? 'opacity-20 translate-x-4' : 'opacity-100'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`material-symbols-outlined text-base ${i === queueIndex ? 'text-black/40' : 'opacity-20 group-hover:opacity-100 text-primary-container'}`} data-icon="drag_indicator">drag_indicator</span>
                    
                    <div className="flex-1 min-w-0" onDoubleClick={() => playTrack(track, queue)}>
                      <div className="text-sm font-bold truncate uppercase tracking-tight">
                        {track.title}
                      </div>
                      <div className={`text-[11px] truncate uppercase mt-1.5 ${i === queueIndex ? 'text-black/70' : 'opacity-50 text-primary-container'}`}>
                        {track.artist}
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                      className={`opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full ${i === queueIndex ? 'text-black/60 hover:text-black hover:bg-black/10' : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'}`}
                    >
                      <span className="material-symbols-outlined text-base" data-icon="close">close</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-primary-container/20 text-[10px] opacity-40 uppercase tracking-tighter flex justify-between">
          <span>{queue.length} NODES_IN_BUFFER</span>
          <span>STORAGE: VOLATILE</span>
        </div>
      </div>
    </>
  )
}
