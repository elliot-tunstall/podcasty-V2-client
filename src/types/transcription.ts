export interface Word {
    word: string;
    start: number;
    end: number;
}

export interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: Word[];
}

export interface Transcription {
  text: string;
  words: Word[];
  segments: Segment[];
}