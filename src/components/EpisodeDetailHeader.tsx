"use client"

import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDuration, formatDate } from "@/utils/format"
import type { Episode } from "../types/podcast"

interface EpisodeDetailHeaderProps {
  episode: Episode
  onPlay: () => void
  isPlaying: boolean
}

export function EpisodeDetailHeader({ episode, onPlay, isPlaying }: EpisodeDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="w-full md:w-1/3 max-w-[400px]">
        <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg">
          <img src={episode.coverImageUrl || "/placeholder.svg"} alt={episode.title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground">Episode {episode.number}</div>
          <h1 className="text-3xl md:text-4xl font-bold">{episode.title}</h1>
          <div className="text-muted-foreground">
            {formatDate(episode.publishedAt)} • {formatDuration(episode.duration)}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button className="rounded-full px-8 flex items-center gap-2" onClick={onPlay}>
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 ml-0.5" />
                Play
              </>
            )}
          </Button>

          <Button variant="outline" className="rounded-full px-6">
            Share
          </Button>

          <Button variant="outline" className="rounded-full px-6">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  )
}
