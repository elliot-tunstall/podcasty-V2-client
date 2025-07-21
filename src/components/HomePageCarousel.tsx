import { Carousel } from "./ui/aceternity/carousel";
import type { Episode } from "../types/podcast";

interface HomePageCarouselProps {
  episodes: Episode[];
}

export function HomePageCarousel({ episodes }: HomePageCarouselProps) {
  // Convert episodes to carousel slides format with button text
  const carouselSlides = episodes.slice(0, 6); // Include all episode data
  

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Recent Episodes
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Hover over any episode to see the full episode card with play controls
        </p>
        <div className="flex justify-center">
          <Carousel slides={carouselSlides} />
        </div>
      </div>
    </div>
  );
} 