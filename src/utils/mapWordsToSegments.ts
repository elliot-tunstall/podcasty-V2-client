
interface Word {
  word: string;
  start: number;
  end: number;
  explanation?: string;
}

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export function mapWordsToSegments(words: Word[], segments: Segment[]) {
  return segments.map(segment => {
    const wordsInSegment = words.filter(
      w => w.start >= segment.start && w.end <= segment.end
    );
    return { ...segment, words: wordsInSegment };
  });
}
