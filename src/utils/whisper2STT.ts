export function whisperToSttJson({
  text,
  words
}: {
  text: string;
  words: { word: string; start: number; end: number }[];
}) {
  const cleanText = text.trim();
  const textWords = cleanText.match(/\b[\w']+\b|[.,!?;]/g) || [];
  const items: any[] = [];

  let wi = 0;

  for (let i = 0; i < textWords.length; i++) {
    const token = textWords[i];

    if (/^[.,!?;]$/.test(token)) {
      // Punctuation
      items.push({
        type: "punctuation",
        alternatives: [{ content: token, confidence: "1.0" }]
      });
    } else {
      const wordData = words[wi];
      if (wordData) {
        items.push({
          start_time: wordData.start.toFixed(2),
          end_time: wordData.end.toFixed(2),
          type: "pronunciation",
          alternatives: [{ content: token, confidence: "1.0" }]
        });
      }
      wi++;
    }
  }

  return {
    jobName: "whisper-transcription",
    accountId: "openai",
    results: {
      transcripts: [{ transcript: text }],
      items
    }
  };
}
