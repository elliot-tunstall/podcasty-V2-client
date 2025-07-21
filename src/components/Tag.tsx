import { Badge, type BadgeProps } from "@/components/ui/badge"
import { usePodcasts } from "@/context/PodcastContext"

type CustomBadgeProps = BadgeProps & {
  hidebackground?: string
}

type TagProps = {
  tagId: string
  badgeProps?: CustomBadgeProps
}

export function Tag({ tagId, badgeProps }: TagProps) {
  const { tagMap } = usePodcasts()
  const tag = tagMap[tagId]

  return(
  <Badge 
    key={tag._id} 
    variant="secondary" 
    className={`rounded-full ${badgeProps?.className}`}
    style={(badgeProps?.hidebackground === "true") ?  undefined : {backgroundColor: tag.color}} 
    {...badgeProps}
  >
    {tag.name}
  </Badge>
  )
}
