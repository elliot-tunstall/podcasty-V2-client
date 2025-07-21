import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePodcasts } from "@/context/PodcastContext"

interface PersonProps {
  personId: string;
  displayName?: boolean
}

export function Person({ personId, displayName=true }: PersonProps) {
  const { peopleMap, isLoading } = usePodcasts()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <img
            src={"../assets/placeholder.svg"}
            alt={"loading..."}
            className="object-cover w-full h-full"
          />
        </div>
        {displayName && <span className="text-sm">loading...</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <img
              src={peopleMap[personId].imageUrl || "../assets/placeholder.svg"}
              alt={peopleMap[personId].name}
              className="object-cover w-full h-full"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{peopleMap[personId].name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    {displayName && <span className="text-sm">{peopleMap[personId].name}</span>}
  </div>
  )
}