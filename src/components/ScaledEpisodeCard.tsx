import { EpisodeCard2 } from "./EpisodeCard2"
import type { Episode } from "../types/podcast"

interface ScaledEpisodeCardProps {
  episode: Episode
  scale?: number
  margin?: number
}

export function ScaledEpisodeCard({ episode, scale = 0.8, margin = 24 }: ScaledEpisodeCardProps) {
  const scaledMargin = margin * scale
  const originalWidth = 360 // width of EpisodeCard2
  const originalHeight = 480 // height of EpisodeCard2
  const scaledWidth = originalWidth * scale
  const scaledHeight = originalHeight * scale

  return (
    <div style={{ 
      transform: `scale(${scale})`, 
      transformOrigin: 'top left',
      margin: `${scaledMargin}px`,
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`
    }}>
      <EpisodeCard2 episode={episode} />
    </div>
  )
} 