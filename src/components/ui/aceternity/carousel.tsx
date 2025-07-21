"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
import type { Episode } from "../../../types/podcast";
import { EpisodeCard2 } from "../../EpisodeCard2";

interface SlideProps {
  slide: Episode;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { coverImageUrl, title, number } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d] relative">
      <li
        ref={slideRef}
        className={`flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 w-[360px] h-[480px] mx-[4vmin] z-10 overflow-hidden${current === index ? " transition-all duration-300 ease-in-out" : ""}`}
        onClick={() => handleSlideClick(index)}
        onMouseMove={current === index ? handleMouseMove : undefined}
        onMouseLeave={current === index ? handleMouseLeave : undefined}
        onMouseEnter={current === index ? handleMouseEnter : undefined}
        style={{
          transform: current !== index ? "scale(0.98) rotateX(8deg)" : "scale(1) rotateX(0deg)",
          transition: current === index ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          transformOrigin: "bottom",
        }}
      >
        {/* EpisodeCard2 Component for hover state - slides up from underneath */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ease-in-out z-20 ${
            isHovered && current === index
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-full opacity-100'
          }`}
          style={{
            transformOrigin: 'bottom',
            transform: isHovered && current === index
              ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
              : "none",
            transition: isHovered && current === index
              ? "transform 0.1s ease-out, all 0.7s ease-in-out"
              : "all 0.7s ease-in-out"
          }}
        >
          <EpisodeCard2 episode={slide} />
        </div>

        {/* Original slide content - moves up and fades out */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[24px] overflow-hidden transition-all duration-700 ease-in-out ${
            isHovered && current === index ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: isHovered && current === index
              ? "translateY(-100%)" 
              : "translateY(0)",
            transformOrigin: 'bottom'
          }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt={title}
            src={coverImageUrl}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          {current === index && (
            <div className="absolute inset-0 bg-black/30 transition-all duration-1000" />
          )}
        </div>

        <article
          className={`relative p-[4vmin] transition-all duration-700 ease-in-out ${
            current === index && !isHovered ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold font-sf-compact relative">
            EP {number}
          </h2>
          <p className="text-md md:text-xl lg:text-3xl font-sf-compact relative">{title}</p>
        </article>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

interface CarouselProps {
  slides: Episode[];
  autoScrollInterval?: number; // Time in milliseconds between auto-scrolls
  pauseOnHover?: boolean; // Whether to pause auto-scroll on hover
}

export function Carousel({ 
  slides, 
  autoScrollInterval = 3000, // Default 5 seconds
  pauseOnHover = true 
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  // Auto-scroll functionality
  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    
    autoScrollRef.current = setInterval(() => {
      if (!isPaused) {
        handleNextClick();
      }
    }, autoScrollInterval);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Handle hover pause/resume
  const handleCarouselMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleCarouselMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Start auto-scroll on mount and restart when current changes
  useEffect(() => {
    if (slides.length > 1) {
      startAutoScroll();
    }

    return () => {
      stopAutoScroll();
    };
  }, [current, isPaused, autoScrollInterval, slides.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);

  const id = useId();

  return (
    <div
      className="relative w-[360px] h-[480px] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
      onMouseEnter={handleCarouselMouseEnter}
      onMouseLeave={handleCarouselMouseLeave}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}
