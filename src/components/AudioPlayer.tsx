import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react"
import type { Episode } from "../types/podcast"
import { API } from "@/services/api"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function AudioPlayerBar() {
  const { currentEpisode } = useAudioPlayer()
  if (!currentEpisode) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <AudioPlayer />
    </div>
  )
}

function AudioPlayer() {
  const { isPlaying, play, pause, toggle, closePlayer, setProgress, currentEpisode } = useAudioPlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!currentEpisode?.audioUrl) {
      fetchAudio(currentEpisode as Episode)
    }
    console.log("currentEpisode", currentEpisode)
    // Auto play when a new episode is loaded
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay was prevented
        pause()
      })
    }
  }, [currentEpisode])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // useEffect mediasessions for when media is playing but device is locked.

  async function fetchAudio(episode: Episode) {
    try {
      const response = await API.get(`/populate/audio/${episode._id}`)
      episode.audioUrl = response.data
    } catch (error) {
      if ((error as any).response?.data?.error === "SubscriptionError") {
      toast.message((error as any).response.data.message,
        {
          description: `${(error as any).response.data.subscriptionTier} is required to listen to this episode.`,
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => {
              navigate("/pricing")
            }
          }
        }
      )}
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      toggle()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setProgress(audioRef.current.currentTime/(currentEpisode?.duration ? currentEpisode?.duration : 1))
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="bg-background border-t shadow-lg p-4">
      <audio
        ref={audioRef}
        src={currentEpisode?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => play}
        onPause={() => pause}
        onEnded={() => pause}
      />

      <div className="container mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
              <img
                src={currentEpisode?.coverImageUrl || "/placeholder.svg"}
                alt={currentEpisode?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h4 className="font-medium truncate">{currentEpisode?.title}</h4>
              <p className="text-sm text-muted-foreground truncate">Episode {currentEpisode?.number}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                </Button>

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>

              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} />
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" />
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePlayer}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close player</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
