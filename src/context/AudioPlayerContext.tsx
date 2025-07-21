// AudioPlayerContext.tsx
import {
  createContext,
  useContext,
  useState
} from "react"

import type { Episode } from "../types/podcast"
import type { ReactNode } from "react"

interface AudioPlayerContextType {
  currentEpisode: Episode | null
  progress: number
  setProgress: (progress:number) => void
  isPlaying: boolean
  play: (episode: Episode) => void
  pause: () => void
  toggle: () => void
  closePlayer: () => void

}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState<number>(0.1)

  const play = (episode: Episode) => {
    setCurrentEpisode(episode)
    setIsPlaying(true)
    }

  const pause = () => {
    setIsPlaying(false)
  }

  const toggle = () => {
    setIsPlaying(!isPlaying)
  }

  const closePlayer = () => {
    setCurrentEpisode(null)
  }

  return (
    <AudioPlayerContext.Provider
      value={{ currentEpisode, isPlaying, progress, setProgress, play, pause, toggle, closePlayer }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider")
  return context
} 
