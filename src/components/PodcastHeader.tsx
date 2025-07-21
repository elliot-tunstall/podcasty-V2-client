import { TypewriterEffectSmooth } from "./ui/aceternity/typewriter-effect"
import { useState, useEffect } from "react"

interface PodcastHeaderProps {
  titleWords: {
    text: string;
    className?: string;
  }[];
  image: string
  description: string
}

export function PodcastHeader({ titleWords, image, description }: PodcastHeaderProps) {
  const [showContent, setShowContent] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Typewriter animation takes 2 seconds + 1 second delay
    const timer = setTimeout(() => {
      setShowContent(true);
      setHasAnimated(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="w-full md:w-1/3 max-w-[400px]">
        <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg">
          <img src={image || "/placeholder.svg"} alt={"This Sweet Sweet Life"} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="w-full md:w-2/3">
        {/* <h1 className="text-3xl md:text-4xl font-bold mb-4"> */}
          <TypewriterEffectSmooth 
            words={titleWords} 
            className={"text-3xl md:text-4xl font-medium"} 
            cursorClassName={"cursor-none"}
            hasAnimated={hasAnimated}
          />
        {/* </h1> */}
        <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          {showContent && (
            <>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">{description}</p>

              {/* <div className="flex gap-4 mt-6">
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
                <button className="border border-input bg-background hover:accent hover:text-accent-foreground px-6 py-2 rounded-full font-medium transition-colors">
                  Share
                </button>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
