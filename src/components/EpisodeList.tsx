import { EpisodeCard } from "./EpisodeCard"
import { EpisodeCard2 } from "./EpisodeCard2"
import { ScaledEpisodeCard } from "./ScaledEpisodeCard"
import type { Episode } from "../types/podcast"

interface EpisodeListProps {
  episodes: Episode[]
  // onPlayEpisode: (episode: Episode) => void
}

export function EpisodeList({ episodes }: EpisodeListProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {episodes.map((episode) => (
        // <EpisodeCard key={episode._id} episode={episode} onPlay={() => onPlayEpisode(episode)} />
          // <EpisodeCard2 key={episode._id} episode={episode} />
          <ScaledEpisodeCard key={episode._id} episode={episode} />
      ))}
    </div>
  )
}
