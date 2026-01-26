import { useRef, useEffect } from 'react'
import pawsyNeutral from '../../assets/mascot/pawsy-animated.mp4'
import pawsyHappy from '../../assets/mascot/pawsy-happy.mp4'
import pawsyWorried from '../../assets/mascot/pawsy-worried.mp4'

const MOOD_VIDEOS = {
  happy: pawsyHappy,
  celebrating: pawsyHappy,
  excited: pawsyHappy,
  proud: pawsyHappy,
  concerned: pawsyWorried,
  alert: pawsyWorried,
  confused: pawsyWorried,
  thinking: pawsyNeutral,
  listening: pawsyNeutral,
  sleepy: pawsyNeutral,
  neutral: pawsyNeutral,
}

const VIDEO_STYLE = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const MOOD_GLOW_COLORS = {
  happy: 'rgba(255, 200, 100, 0.4)',
  thinking: 'rgba(100, 180, 255, 0.4)',
  concerned: 'rgba(255, 180, 150, 0.3)',
  alert: 'rgba(255, 100, 100, 0.5)',
  celebrating: 'rgba(255, 215, 0, 0.6)',
  listening: 'rgba(150, 200, 255, 0.4)',
  confused: 'rgba(200, 180, 255, 0.4)',
  proud: 'rgba(255, 200, 50, 0.5)',
  sleepy: 'rgba(150, 150, 200, 0.3)',
  excited: 'rgba(255, 150, 50, 0.5)',
  neutral: 'rgba(200, 180, 150, 0.3)',
}

/**
 * PawsyMascotVideo - Animated video corgi mascot
 *
 * @param {string} mood - Mood affects the glow color around the video
 * @param {number} size - Size in pixels (default 40)
 * @param {boolean} animate - Enable video playback (default true)
 */
export default function PawsyMascotVideo({
  mood = 'happy',
  size = 40,
  animate = true,
  className = '',
  style = {},
}) {
  const videoRef = useRef(null)
  const glowColor = MOOD_GLOW_COLORS[mood] || MOOD_GLOW_COLORS.neutral
  const videoSrc = MOOD_VIDEOS[mood] || pawsyNeutral

  useEffect(() => {
    if (videoRef.current) {
      if (animate) {
        videoRef.current.play().catch(() => {
          // Autoplay may be blocked, that's okay
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [animate])

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: `0 0 ${Math.max(size * 0.15, 6)}px ${glowColor}`,
    transition: 'box-shadow 0.3s ease',
    flexShrink: 0,
    ...style,
  }

  return (
    <div className={className} style={containerStyle}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay={animate}
        loop
        muted
        playsInline
        style={VIDEO_STYLE}
      />
    </div>
  )
}
