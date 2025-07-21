"use client"

import { useState, useEffect } from "react"
import { API } from "@/services/api";
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EpisodeDetailHeader } from "../components/EpisodeDetailHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Episode } from "../types/podcast"
import { toast } from "sonner";
import { formatTranscript } from "@/services/backBlaze";
import { formatDuration, formatDate } from "@/utils/format";
import { Person } from "@/components/Person";
import { Tag } from "@/components/Tag";

interface EpisodePageProps {
  onPlayEpisode: (episode: Episode) => void
}

function EpisodePage({ onPlayEpisode }: EpisodePageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await API.get(`populate/episode/${id}`)
        setEpisode(response.data)
      } catch (err) {
        // Episode not found, redirect to home
        toast.error("Failed to fetch episode data", {
          description: 'Redirecting to home'
        })
        navigate("/")
      }
    }
    fetchEpisode()
  }, [id, navigate])

  const handlePlay = () => {
    if (episode) {
      onPlayEpisode(episode)
      setIsPlaying(true)
    }
  }

  if (!episode) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl">Loading episode...</div>
      </div>
    )
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 -ml-3 flex items-center gap-1" onClick={() => navigate("/")}>
          <ChevronLeft className="h-4 w-4" />
          Back to all episodes
        </Button>

        <EpisodeDetailHeader episode={episode} onPlay={handlePlay} isPlaying={isPlaying} />

        <Separator className="my-8" />

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4">About this episode</h3>
                <p className="text-muted-foreground">{episode.description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Episode Info</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="font-medium">Episode</dt>
                    <dd className="text-muted-foreground">#{episode.number}</dd>

                    <dt className="font-medium">Released</dt>
                    <dd className="text-muted-foreground">{formatDate(episode.publishedAt)}</dd>

                    <dt className="font-medium">Duration</dt>
                    <dd className="text-muted-foreground">{formatDuration(episode.duration)}</dd>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {episode.tags.map((tagId, index) => (
                      <div key={index}>
                        <Tag tagId={tagId}/>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">People</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Host</h4>
                      <Person personId={episode.host}/>
                    </div>

                    {episode.guests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Guests</h4>
                        <div className="space-y-2">
                          {episode.guests.map((guest, index) => (
                            <div key={index}>
                              <Person personId={guest as string}/>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transcript">
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Episode Transcript</h3>
              <div className="space-y-4 whitespace-pre-line text-muted-foreground">{formatTranscript(episode.transcription)}</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default EpisodePage
