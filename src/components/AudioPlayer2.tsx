// AudioPlayer.tsx
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"

export function AudioPlayer() {
  const { audioRef, currentEpisode, isPlaying, toggle, seek, setVolume } = useAudioPlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleVolume = () => setIsMuted(audio.volume === 0)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("volumechange", handleVolume)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("volumechange", handleVolume)
    }
  }, [audioRef])

  if (!currentEpisode) return null

  return (
    <div className="bg-background border-t shadow-lg p-4">
      <div className="flex items-center gap-4">
        <img src={currentEpisode.coverImageUrl || "/placeholder.svg"} className="w-12 h-12 object-cover rounded" />

        <div className="flex-1">
          <h4 className="font-medium truncate">{currentEpisode.title}</h4>

          <div className="flex items-center gap-2">
            <span className="text-xs w-10 text-right">{format(currentTime)}</span>
            <Slider value={[currentTime]} max={duration} step={1} onValueChange={([v]) => seek(v)} className="flex-1" />
            <span className="text-xs w-10">{format(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={toggle} size="icon">
            {isPlaying ? <Pause /> : <Play />}
          </Button>

          <Button size="icon" onClick={() => {
            const newVolume = isMuted ? 1 : 0
            setVolume(newVolume)
            setIsMuted(!isMuted)
          }}>
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
      </div>
    </div>
  )
}

const format = (time: number) => {
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${m}:${s < 10 ? "0" : ""}${s}`
} 
