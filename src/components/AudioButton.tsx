import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface AudioButtonProps extends ButtonProps {
  progress?: number; // 0 to 1 representing progress through the episode
  duration: string; // duration in minutes
}

export function PlayAudioButton(props: AudioButtonProps) {
  return (
    <Button {...props}>
      <div className="flex items-center gap-2">
        <Play />
        <span className="text-sm">{props.duration}</span>
      </div>
    </Button>
  )
}

export function PauseAudioButton(props: AudioButtonProps) {
  const progress = props.progress || 0;
  
  return (
    <Button {...props}>
      <div className="flex items-center gap-2">
        <Pause />
        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-sm">{props.duration}</span>
      </div>
    </Button>
  )
}
