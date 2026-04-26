import React, { createContext, useState, useContext, useEffect, useRef } from 'react'

const AudioContext = createContext()

export function useAudio() {
  return useContext(AudioContext)
}

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(() => {
    const saved = localStorage.getItem('monokernal_last_track')
    return saved ? JSON.parse(saved) : null
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('monokernal_volume')
    return saved ? parseFloat(saved) : 0.5
  })
  const [queue, setQueue] = useState(() => {
    const saved = localStorage.getItem('monokernal_queue')
    return saved ? JSON.parse(saved) : []
  })
  const [queueIndex, setQueueIndex] = useState(() => {
    const saved = localStorage.getItem('monokernal_queue_index')
    return saved ? parseInt(saved) : -1
  })
  const [isQueueVisible, setIsQueueVisible] = useState(false)

  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem('monokernal_shuffle') === 'true'
  })

  // Loop: 'off' → 'all' → 'one' → 'off'
  const [loopMode, setLoopMode] = useState(() => {
    return localStorage.getItem('monokernal_loop') || 'off'
  })

  const audioRef = useRef(new Audio())
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)
  const eqNodesRef = useRef([])

  const [eqGains, setEqGains] = useState(() => {
    try {
      const saved = localStorage.getItem('monokernal_eq')
      return saved ? JSON.parse(saved) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    } catch (e) {
      console.error("Failed to parse EQ gains", e)
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  })

  const EQ_FREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

  // Set up Web Audio API analyser and EQ
  const getAnalyser = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
      analyserRef.current = audioCtxRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current)
      
      // Create EQ filter chain
      let lastNode = sourceRef.current
      const nodes = []
      
      EQ_FREQS.forEach((freq, i) => {
        const filter = audioCtxRef.current.createBiquadFilter()
        filter.type = 'peaking'
        filter.frequency.value = freq
        filter.Q.value = 1
        filter.gain.value = eqGains[i]
        lastNode.connect(filter)
        lastNode = filter
        nodes.push(filter)
      })
      
      eqNodesRef.current = nodes
      lastNode.connect(analyserRef.current)
      analyserRef.current.connect(audioCtxRef.current.destination)
    }
    return analyserRef.current
  }

  useEffect(() => {
    localStorage.setItem('monokernal_eq', JSON.stringify(eqGains))
    if (audioCtxRef.current && eqNodesRef.current.length > 0) {
      eqGains.forEach((gain, i) => {
        if (eqNodesRef.current[i]) {
          eqNodesRef.current[i].gain.setTargetAtTime(gain, audioCtxRef.current.currentTime, 0.01)
        }
      })
    }
  }, [eqGains])

  const changeEqGain = (index, value) => {
    const newGains = [...eqGains]
    newGains[index] = value
    setEqGains(newGains)
  }

  // Refs to avoid stale closures in event listeners
  const queueRef = useRef(queue)
  const queueIndexRef = useRef(queueIndex)
  const loopModeRef = useRef(loopMode)

  useEffect(() => {
    queueRef.current = queue
    queueIndexRef.current = queueIndex
  }, [queue, queueIndex])

  const isShuffleRef = useRef(isShuffle)
  useEffect(() => {
    isShuffleRef.current = isShuffle
    localStorage.setItem('monokernal_shuffle', isShuffle.toString())
  }, [isShuffle])

  useEffect(() => {
    loopModeRef.current = loopMode
    localStorage.setItem('monokernal_loop', loopMode)
  }, [loopMode])

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = volume

    const updateProgress = () => setProgress(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    const handleEnded = () => {
      const q = queueRef.current
      const idx = queueIndexRef.current
      const loop = loopModeRef.current
      const shuffle = isShuffleRef.current

      if (loop === 'one') {
        // Repeat the same track
        audio.currentTime = 0
        audio.play().catch(e => console.error("Playback failed:", e))
        return
      }

      if (shuffle && q.length > 1) {
        let nextIdx = Math.floor(Math.random() * q.length)
        // Try to avoid playing the same song again immediately if possible
        if (nextIdx === idx && q.length > 1) {
          nextIdx = (nextIdx + 1) % q.length
        }
        setQueueIndex(nextIdx)
        setCurrentTrack(q[nextIdx])
        setIsPlaying(true)
        return
      }

      if (q.length > 0 && idx < q.length - 1) {
        const nextIdx = idx + 1
        setQueueIndex(nextIdx)
        setCurrentTrack(q[nextIdx])
        setIsPlaying(true)
      } else if (loop === 'all' && q.length > 0) {
        // Wrap around to beginning
        setQueueIndex(0)
        setCurrentTrack(q[0])
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
        setProgress(0)
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (currentTrack) {
      // Use the custom media:// protocol and encode the local path
      audio.src = `media://local/${encodeURIComponent(currentTrack.path)}`
      localStorage.setItem('monokernal_last_track', JSON.stringify(currentTrack))
      if (isPlaying) {
        audio.play().catch(e => console.error("Playback failed:", e))
      }
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (isPlaying && currentTrack) {
      audio.play().catch(e => console.error("Playback failed:", e))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    audioRef.current.volume = volume
    localStorage.setItem('monokernal_volume', volume.toString())
  }, [volume])

  useEffect(() => {
    localStorage.setItem('monokernal_queue', JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    localStorage.setItem('monokernal_queue_index', queueIndex.toString())
  }, [queueIndex])

  const playTrack = (track, newQueue = null) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    if (newQueue) {
      setQueue(newQueue)
      const idx = newQueue.findIndex(t => t.path === track.path)
      setQueueIndex(idx !== -1 ? idx : 0)
    }
  }

  const togglePlayPause = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying)
    }
  }

  const cycleLoopMode = () => {
    setLoopMode(prev => {
      if (prev === 'off') return 'all'
      if (prev === 'all') return 'one'
      return 'off'
    })
  }

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev)
  }

  const shuffleQueue = () => {
    // Legacy support for the button that physically shuffles the queue
    if (queue.length <= 1) return
    setQueue(prev => {
      const others = prev.filter((_, i) => i !== queueIndex)
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]]
      }
      const currentItem = prev[queueIndex]
      const shuffled = currentItem ? [currentItem, ...others] : others
      setQueueIndex(0)
      return shuffled
    })
    setIsShuffle(true)
  }

  const shuffleAndPlay = (trackList) => {
    if (!trackList || trackList.length === 0) return
    const shuffled = [...trackList]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setQueue(shuffled)
    setQueueIndex(0)
    setCurrentTrack(shuffled[0])
    setIsPlaying(true)
    setIsShuffle(true)
  }

  const nextTrack = () => {
    if (isShuffle && queue.length > 1) {
      let nextIdx = Math.floor(Math.random() * queue.length)
      if (nextIdx === queueIndex) nextIdx = (nextIdx + 1) % queue.length
      setQueueIndex(nextIdx)
      setCurrentTrack(queue[nextIdx])
      setIsPlaying(true)
      return
    }

    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1
      setQueueIndex(nextIdx)
      setCurrentTrack(queue[nextIdx])
      setIsPlaying(true)
    } else if (loopMode === 'all' && queue.length > 0) {
      setQueueIndex(0)
      setCurrentTrack(queue[0])
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
      setProgress(0)
    }
  }

  const prevTrack = () => {
    if (progress > 3) {
      seek(0) // Restart current track if we are past 3 seconds
      return
    }
    if (queue.length > 0 && queueIndex > 0) {
      const prevIdx = queueIndex - 1
      setQueueIndex(prevIdx)
      setCurrentTrack(queue[prevIdx])
      setIsPlaying(true)
    } else if (loopMode === 'all' && queue.length > 0) {
      const lastIdx = queue.length - 1
      setQueueIndex(lastIdx)
      setCurrentTrack(queue[lastIdx])
      setIsPlaying(true)
    }
  }

  const seek = (time) => {
    audioRef.current.currentTime = time
    setProgress(time)
  }

  const changeVolume = (newVolume) => {
    const v = Math.max(0, Math.min(1, newVolume))
    setVolume(v)
  }

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track])
  }

  const playNext = (track) => {
    setQueue(prev => {
      const newQueue = [...prev]
      newQueue.splice(queueIndex + 1, 0, track)
      return newQueue
    })
  }

  const reorderQueue = (startIndex, endIndex) => {
    setQueue(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      
      // Update queueIndex if the playing track moved
      if (queueIndex === startIndex) {
        setQueueIndex(endIndex)
      } else if (queueIndex > startIndex && queueIndex <= endIndex) {
        setQueueIndex(queueIndex - 1)
      } else if (queueIndex < startIndex && queueIndex >= endIndex) {
        setQueueIndex(queueIndex + 1)
      }
      
      return result
    })
  }

  const removeFromQueue = (index) => {
    setQueue(prev => {
      const newQueue = prev.filter((_, i) => i !== index)
      if (index < queueIndex) {
        setQueueIndex(queueIndex - 1)
      } else if (index === queueIndex) {
        // If current track is removed, maybe stop or play next
      }
      return newQueue
    })
  }

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      volume,
      queue,
      queueIndex,
      isQueueVisible,
      setIsQueueVisible,
      loopMode,
      cycleLoopMode,
      isShuffle,
      toggleShuffle,
      shuffleQueue,
      shuffleAndPlay,
      playTrack,
      togglePlayPause,
      nextTrack,
      prevTrack,
      seek,
      changeVolume,
      addToQueue,
      playNext,
      reorderQueue,
      removeFromQueue,
      getAnalyser,
      audioRef,
      eqGains,
      changeEqGain,
      setEqGains,
      EQ_FREQS
    }}>
      {children}
    </AudioContext.Provider>
  )
}
