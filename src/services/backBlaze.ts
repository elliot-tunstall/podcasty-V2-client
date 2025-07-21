// Backblaze Services

import type { Transcription } from "@/types/transcription";
import axios from "axios";

export async function retriveTranscription(signedUrl: string) {

  if (signedUrl == null) {
    return "You must subscribe to access this content"
  } else {
    const response = await axios.get(signedUrl);
    return formatTranscript(response.data)
  }
};

export function formatTranscript(transcript: Transcription) {
  const formatTime = (timeStr: string) => {
    const floatTime = parseFloat(timeStr);
    const minutes = Math.floor(floatTime / 60);
    const seconds = (floatTime % 60).toFixed(2).padStart(5, '0');
    return `${minutes}:${seconds}`;
  };

  if (transcript == null) return "You require a subscription to access this content"
  let result = '';
  for (const segment of transcript.segments) {
    const formattedStart = formatTime(segment.start.toString());
    const formattedEnd = formatTime(segment.end.toString());
    result += `[${formattedStart} - ${formattedEnd}] ${segment.text}\n\n`;
  }

  return result; // Remove trailing newline
};