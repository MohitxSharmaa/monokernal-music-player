import coverAcoustic from '../assets/covers/cover_acoustic.png'
import coverCyberpunk from '../assets/covers/cover_cyberpunk.png'
import coverElectronic from '../assets/covers/cover_electronic.png'
import coverHiphop from '../assets/covers/cover_hiphop.png'
import coverJazz from '../assets/covers/cover_jazz.png'
import coverLofi from '../assets/covers/cover_lofi.png'
import coverNature from '../assets/covers/cover_nature.png'
import coverRock from '../assets/covers/cover_rock.png'
import coverSpace from '../assets/covers/cover_space.png'
import coverSynthwave from '../assets/covers/cover_synthwave.png'

// New Pixel Art Covers
import pixelSunset from '../assets/covers/pixel_sunset.png'
import pixelNeon from '../assets/covers/pixel_neon.png'
import pixelCassette from '../assets/covers/pixel_cassette.png'
import pixelCity from '../assets/covers/pixel_city.png'
import pixelAstro from '../assets/covers/pixel_astro.png'
import pixelRose from '../assets/covers/pixel_rose.png'
import pixelCar from '../assets/covers/pixel_car.png'
import pixelMoon from '../assets/covers/pixel_moon.png'
import pixelMountain from '../assets/covers/pixel_mountain.png'
import pixelFlower from '../assets/covers/pixel_flower.png'

export const PLAYLIST_COVERS = [
  { id: 'lofi', name: 'Lofi / Chill', src: coverLofi },
  { id: 'synthwave', name: 'Synthwave', src: coverSynthwave },
  { id: 'acoustic', name: 'Acoustic / Folk', src: coverAcoustic },
  { id: 'nature', name: 'Nature / Ambient', src: coverNature },
  { id: 'electronic', name: 'Electronic', src: coverElectronic },
  { id: 'hiphop', name: 'Hip Hop / Rap', src: coverHiphop },
  { id: 'rock', name: 'Rock / Metal', src: coverRock },
  { id: 'jazz', name: 'Classical / Jazz', src: coverJazz },
  { id: 'cyberpunk', name: 'Cyberpunk', src: coverCyberpunk },
  { id: 'space', name: 'Space / Cosmic', src: coverSpace },
  
  // Pixel Art Series
  { id: 'pixel_sunset', name: 'Pixel: Sunset', src: pixelSunset },
  { id: 'pixel_neon', name: 'Pixel: Neon Grid', src: pixelNeon },
  { id: 'pixel_cassette', name: 'Pixel: Cassette', src: pixelCassette },
  { id: 'pixel_city', name: 'Pixel: Cybercity', src: pixelCity },
  { id: 'pixel_astro', name: 'Pixel: Astronaut', src: pixelAstro },
  { id: 'pixel_rose', name: 'Pixel: Rose', src: pixelRose },
  { id: 'pixel_car', name: 'Pixel: Outrun Car', src: pixelCar },
  { id: 'pixel_moon', name: 'Pixel: Dream Moon', src: pixelMoon },
  { id: 'pixel_mountain', name: 'Pixel: Zenith', src: pixelMountain },
  { id: 'pixel_flower', name: 'Pixel: Flower Field', src: pixelFlower }
]

export const getCoverSrc = (coverId, customCover) => {
  if (customCover) return customCover
  if (coverId && coverId.startsWith('data:')) return coverId
  const cover = PLAYLIST_COVERS.find(c => c.id === coverId)
  return cover ? cover.src : null
}
