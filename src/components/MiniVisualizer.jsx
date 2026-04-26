import React, { useEffect, useRef } from 'react'
import { useAudio } from '../context/AudioContext'

export default function MiniVisualizer() {
  const { getAnalyser, isPlaying } = useAudio()
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let analyser
    try {
      analyser = getAnalyser()
    } catch (e) {
      return
    }
    if (!analyser) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      
      analyser.getByteTimeDomainData(dataArray)
      
      const width = canvas.width
      const height = canvas.height
      
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, width, height)
      
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffb000'
      
      ctx.lineWidth = 2
      ctx.strokeStyle = accentColor
      ctx.beginPath()
      
      const sliceWidth = width / bufferLength
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        x += sliceWidth
      }
      
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Add a scanline effect over the mini visualizer
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      for(let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1)
      }
    }

    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [getAnalyser, isPlaying])

  return (
    <div className="w-32 h-12 border border-primary-container bg-black overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <canvas 
        ref={canvasRef} 
        width={128} 
        height={48} 
        className="w-full h-full block"
      />
    </div>
  )
}
