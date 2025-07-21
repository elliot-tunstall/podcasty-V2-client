import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Tag } from "@/components/Tag"
import { ChevronLeft, Search, X } from "lucide-react"
import { EpisodeList } from "../components/EpisodeList"
import type { Episode } from "../types/podcast"
import { Button } from "@/components/ui/button"
import { usePodcasts } from "@/context/PodcastContext"

interface AllEpisodesPageProps {
  onPlayEpisode: (episode: Episode) => void
}

function AllEpisodesPage({ onPlayEpisode }: AllEpisodesPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { episodes } = usePodcasts()
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>(episodes)

  // Extract all unique tags from episodes
  const allTags = Array.from(new Set(episodes.flatMap((episode) => episode.tags))).sort()

  // Filter episodes based on search term and selected tags
  useEffect(() => {
    const filtered = episodes.filter((episode) => {
      const matchesSearch =
        searchTerm === "" ||
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => episode.tags.includes(tag))

      return matchesSearch && matchesTags
    })

    setFilteredEpisodes(filtered)
  }, [searchTerm, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTags([])
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-8">All Episodes</h1>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium">Filter by tags</h2>
              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tagId, index) => (
                <div key={index}>
                  <Tag 
                    tagId={tagId} 
                    badgeProps={{
                      hideBackground: selectedTags.includes(tagId) ? false : true,
                      variant: selectedTags.includes(tagId) ? "secondary" : "outline",
                      className: "cursor-pointer",
                      onClick: () => toggleTag(tagId)
                    }}
                  />
                </div>
                // <Badge
                //   key={tag}
                //   variant={selectedTags.includes(tag) ? "default" : "outline"}
                //   className="cursor-pointer"
                //   onClick={() => toggleTag(tag)}
                // >
                //   {tag}
                //   {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                // </Badge>
              ))}
            </div>
          </div>
        </div>

        {filteredEpisodes.length > 0 ? (
          <EpisodeList episodes={filteredEpisodes} onPlayEpisode={onPlayEpisode} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No episodes found matching your search criteria.</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

export default AllEpisodesPage
