import type React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Episode } from "../types/podcast"
import { Person } from "./Person"
import { Tag } from "./Tag"
import { formatDuration, formatDate } from "@/utils/format"

interface EpisodeCardProps {
  episode: Episode
  onPlay: () => void
}

export function EpisodeCard({ episode, onPlay }: EpisodeCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/episode/${episode._id}`)
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    onPlay()
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-[200px] h-[200px] sm:h-auto relative shrink-0">
            <img src={episode.coverImageUrl || "/placeholder.svg"} alt={episode.title} className="w-full h-full object-cover" />
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-4 right-4 rounded-full w-12 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handlePlayClick}
            >
              <Play className="h-6 w-6" />
              <span className="sr-only">Play episode</span>
            </Button>
          </div>

          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Episode {episode.number}</span>
                <h3 className="text-xl font-bold">{episode.title}</h3>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(episode.duration)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {episode.tags.map((tagId, index) => (
                <div key={index}>
                  <Tag tagId={tagId} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{formatDate(episode.publishedAt)}</div>

              <div className="flex -space-x-2">
                <Person personId={episode.host} displayName={false}/>

                {episode.guests.map((guest) => (
                  <Person personId={guest as string} displayName={false}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
