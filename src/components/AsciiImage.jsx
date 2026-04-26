import React, { useEffect, useRef, useState } from 'react'

const DEFAULT_ASCII = `+-----------------+
| ::**##::....    |
| **..::##**..    |
| ##::**..::##    |
| ..::**##::..    |
+-----------------+`

const ASCII_CHARS = ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' ']

export default function AsciiImage({ src, width = 19, height = 6 }) {
  const [asciiArt, setAsciiArt] = useState(DEFAULT_ASCII)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!src) {
      setAsciiArt(DEFAULT_ASCII)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      
      canvas.width = width
      canvas.height = height

      // Draw image scaled down to the desired character width and height
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      let asciiStr = '+-----------------+\n'
      for (let y = 0; y < height; y++) {
        asciiStr += '| '
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4
          const r = data[offset]
          const g = data[offset + 1]
          const b = data[offset + 2]
          
          // Calculate brightness
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          
          // Map brightness to character index (0 to length - 1)
          const charIndex = Math.floor(brightness * (ASCII_CHARS.length - 1))
          asciiStr += ASCII_CHARS[charIndex]
        }
        asciiStr += ' |\n'
      }
      asciiStr += '+-----------------+'
      
      setAsciiArt(asciiStr)
    }
    img.src = src
  }, [src, width, height])

  return (
    <div className="flex flex-col group cursor-pointer w-fit">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <pre className="font-body-lg text-primary-container leading-[1.1] m-0 group-hover:bg-primary-container group-hover:text-black transition-none whitespace-pre font-mono">
        {asciiArt}
      </pre>
    </div>
  )
}
