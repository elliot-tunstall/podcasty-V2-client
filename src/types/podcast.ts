
import type { Transcription } from "./transcription"

export interface Podcast {
  _id: string
  title: string
  description: string
  author: string
  coverImageUrl: string
}

export interface Person {
  _id: string
  name: string
  image?: File | null
  imageUrl: string
  bio: string
  role: string
}

export interface Tag {
  _id: string
  name: string
  color: string
}

export interface Episode {
  _id: string
  podcastId : string
  title: string
  number: number
  publishedAt: string
  image?: File | null
  coverImageUrl: string
  duration: number
  tags: ID[]
  host: ID
  guests: ID[]
  audioUrl: string
  audioKey?: string
  audio?: File | null
  description?: string
  transcription: Transcription
  requiredTier?: number
}

type ID = string;