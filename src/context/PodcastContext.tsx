// context/PodcastContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '@/services/api';
import { toast } from 'sonner';

import type { Podcast, Episode, Person, Tag } from '@/types/podcast';

interface PodcastContextType {
  podcasts: Podcast[];
  episodes: Episode[]
  peopleMap: Record<string, Person>;
  tagMap: Record<string, Tag>;
  isLoading: boolean;
}

const PodcastContext = createContext<PodcastContextType>({
  podcasts: [],
  episodes: [],
  tagMap: {},
  peopleMap: {},
  isLoading: true,
});

export const usePodcasts = () => useContext(PodcastContext);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [tagMap, setTagMap] = useState<Record<string, Tag>>({});
  const [peopleMap, setPeopleMap] = useState<Record<string, Person>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchPeople(),
          fetchTags(),
          fetchPodcasts()
        ]);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await API.get('/populate/people');
      const peopleMap = Object.fromEntries(response.data.map((p: Person) => [p._id, p]));
      setPeopleMap(peopleMap);
    } catch (error) {
      console.error('Error fetching people:', error);
      throw error;
    }
  }

  const fetchTags = async () => {
    try {
      const response = await API.get('/populate/tags');
      const tagMap = Object.fromEntries(response.data.map((t: Tag) => [t._id, t]));
      setTagMap(tagMap);
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  const fetchPodcasts = async () => {
    try {
      const response = await API.get('/populate/');
      const podcastResponse = response.data.podcast
      const episodeResponse = response.data.episodes
      setPodcasts(podcastResponse);
      setEpisodes(episodeResponse);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      throw error;
    }
  }

  return (
    <PodcastContext.Provider value={{ podcasts, episodes, tagMap, peopleMap, isLoading }}>
      {children}
    </PodcastContext.Provider>
  );
};
