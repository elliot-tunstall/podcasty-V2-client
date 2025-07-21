import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { PodcastHeader } from "../components/PodcastHeader"
import { EpisodeList } from "../components/EpisodeList"
import type { Episode } from "../types/podcast"
import { ArrowRight } from "lucide-react"
import { usePodcasts } from "@/context/PodcastContext"
import { useMemo } from "react"
import { WhereToListen } from "../components/WhereToListen"
import { HomePageCarousel } from "@/components/HomePageCarousel"
import { Button } from "@/components/ui/button"
interface HomePageProps {
  onPlayEpisode: (episode: Episode) => void
}

function HomePage({ onPlayEpisode }: HomePageProps) {
  const navigate = useNavigate();
  const { podcasts, episodes, isLoading } = usePodcasts()
  const mainPodcast = podcasts[0]
  const recentEpisodes = [...episodes].sort((a, b) => {
      return b.number - a.number
  }).slice(0, 6)  // Only show the 3 most recent episodes on the home page
  if (isLoading) return <div>Loading...</div>;

  const getWordsArray = () => {
    const titleWords = mainPodcast.title.split(" ")
    return [
      {text: "Welcome", className: "font-medium"}, 
      {text: "to", className: "font-medium"}, 
      ...titleWords.map(word => ({text: word, className: "font-bold text-red-400"}))
    ]
  }

  return (
    <main>
      <div className="pb-6 bg-[linear-gradient(350deg,#e1caeb_0%,#cee7eb_26%,#ffffff_65%)]">
        <div className="container mx-auto px-4 py-8">
          <PodcastHeader 
            titleWords={getWordsArray()} 
            image={mainPodcast.coverImageUrl} 
            description={mainPodcast.description} 
          />
        </div>
      </div>
      <WhereToListen />
      <div className="container mx-auto px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
        <div className="mt-12">
          <div className="relative mb-6">
            <h2 className="text-4xl text-gray-800 font-bold text-center pb-6">Recent Episodes</h2>
            <Link to="/episodes" className="absolute right-0 top-1/2 -translate-y-1/2 text-primary flex items-center hover:underline">
              See all episodes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
        </div>
        <HomePageCarousel episodes={recentEpisodes} />
          <Button variant="outline" onClick={() => {navigate("/episodes")}} >
              See all episodes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          {/* <EpisodeList episodes={recentEpisodes} /> */}
      </div>
    </main>
  )
}

export default HomePage
