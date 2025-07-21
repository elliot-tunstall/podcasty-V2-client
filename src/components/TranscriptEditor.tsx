
import type { Transcription, Segment } from "@/types/transcription";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import SegmentEditor from "./SegmentEditor";
import MetadataModal from "./MetadataModal";
import { mapWordsToSegments } from "../utils/mapWordsToSegments";


interface Props {
  transcription: Transcription;
  onSave: (segments: Segment[]) => void;
}

const TranscriptEditor: React.FC<Props> = ({ transcription, onSave }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const mapped = mapWordsToSegments(transcription.words, transcription.segments);
    setSegments(mapped);
  }, [transcription]);

  const toggleWordSelection = (wordId: number) => {
    setSelectedWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  const handleAddExplanation = (text: string) => {
    const updatedSegments = segments.map((segment) => {
      const updatedWords = segment.words?.map((word) => {
        if (selectedWordIds.includes(word.start)) {
          return { ...word, explanation: text };
        }
        return word;
      }) || [];
      return { ...segment, words: updatedWords };
    });
    setSegments(updatedSegments);
    setSelectedWordIds([]);
    setShowModal(false);
  };

  return (
    <div>
      {segments.map((seg, i) => (
        <SegmentEditor
          key={i}
          segment={seg}
          onUpdate={(s) => {
            const newSegs = [...segments];
            newSegs[i] = s;
            setSegments(newSegs);
          }}
          selectedWordIds={selectedWordIds}
          toggleWordSelection={toggleWordSelection}
        />
      ))}
      {selectedWordIds.length > 0 && (
        <>
          <Button onClick={() => setShowModal(true)}>Add Explanation</Button>
          {showModal && (
            <MetadataModal
              onSubmit={handleAddExplanation}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}
      <Button onClick={() => onSave(segments)}>Save</Button>
    </div>
  );
};

export default TranscriptEditor;
