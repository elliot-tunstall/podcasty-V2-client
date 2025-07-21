import { Card } from "@/components/ui/card"
import type { Episode } from "../types/podcast"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { PlayAudioButton, PauseAudioButton } from "./AudioButton"
import { formatDuration } from "@/utils/format"
import { Person } from "./Person"
import { Tag } from "./Tag"
import { useNavigate } from "react-router-dom"

interface EpisodeCardProps {
  episode: Episode
}

export function EpisodeCard2({ episode }: EpisodeCardProps) {
  const { isPlaying, play, pause, progress, currentEpisode } = useAudioPlayer()

  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/episode/${episode._id}`)
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    play(episode)
  }

  const handlePauseClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click from triggering
    pause()
  }

  return (
    <Card className="relative w-[360px] h-[480px] rounded-[24px] overflow-hidden text-white shadow-md border border-white/50" onClick={handleCardClick}>
        {/* Background image */}
        <img
          src={episode.coverImageUrl}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* First: white base with multiply */}
        <div className="absolute inset-0 bg-white/30 mix-blend-multiply z-0" />

        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_3px,transparent_3px),linear-gradient(90deg,rgba(255,255,255,0.2)_3px,transparent_3px)] bg-[size:16px_16px] z-0" />

        {/* Then: black overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[32px] z-0" />

        <div className="relative z-10 p-6 flex flex-col gap-3 justify-between h-full">
          {/* Image container */}
          <div className="flex justify-center">
            <div className="w-[160px] h-[160px] flex items-center justify-center rounded-[16px] bg-black border border-white/25 shadow-[0px_6px_8px_rgba(0,0,0,0.5)] overflow-hidden text-white/70 my-3
              transform transition duration-300 hover:scale-105" >
              <img
                src={episode.coverImageUrl}
                alt={episode.title}
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
          </div>

          {/*tags container*/}
          <div className="flex space-x-2 overflow-x-scroll min-h-[22px]">
            {episode.tags.map((tag) => (
              <Tag key={tag} tagId={tag as string} badgeProps={{hidebackground: "true", className: "bg-white text-black" }}/>
            ))}
          </div>

          {/* Content container */}
          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-2 max-h-[164px]">
              {/* Title */}
              <p className="font-sf-compact text-[16px] font-semibold ">
                {episode.title || "Untitled Episode"}
              </p>

              {/* Description */}
              <p className="text-sm text-white/80 leading-5 line-clamp-6 font-sf-compact">
                {episode.description || "No description available for this episode."}
              </p>
            </div>

            {/* Controls and avatars */}
            <div className="flex justify-between items-center mt-auto py-2">
              {isPlaying && currentEpisode?._id === episode?._id ? (
                <PauseAudioButton
                  onClick={handlePauseClick}
                  duration={formatDuration(episode.duration)}
                  progress={progress}
                  className="flex items-center gap-1 px-2 py-1 h-8 bg-white text-[#232323] 
                  font-bold font-sf-compact text-sm rounded-full shadow-sm hover:bg-white/90 transition"
                />
              ) : (
                <PlayAudioButton
                  onClick={handlePlayClick}
                  duration={formatDuration(episode.duration)}
                  progress={progress}
                  className="flex items-center gap-1 px-2 py-1 h-8 bg-white text-[#232323] font-bold 
                  font-sf-compact text-sm rounded-full shadow-sm hover:bg-white/90 transition"
                />
              )}

              <div className="flex -space-x-2">
                <Person personId={episode.host} displayName={false} />
                {episode.guests.map((guest) => (
                  <Person key={guest} personId={guest as string} displayName={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
    </Card>
  )
}
