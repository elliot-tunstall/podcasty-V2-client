
import type { Segment } from "@/types/transcription";

import React from "react";
import WordEditor from "./WordEditor";

interface Props {
  segment: Segment;
  onUpdate: (segment: Segment) => void;
  selectedWordIds: number[];
  toggleWordSelection: (id: number) => void;
}

const SegmentEditor: React.FC<Props> = ({ segment, onUpdate, selectedWordIds, toggleWordSelection }) => {
  const updateWord = (index: number, newWord: string) => {
    const updatedWords = [...(segment.words || [])];
    updatedWords[index] = { ...updatedWords[index], word: newWord };
    const updatedText = updatedWords.map(w => w.word).join(" ");
    onUpdate({ ...segment, words: updatedWords, text: updatedText });
  };

  return (
    <div style={{ margin: "1em 0" }}>
      <div style={{ fontSize: "0.9em", color: "#555" }}>
        [{segment.start.toFixed(2)} - {segment.end.toFixed(2)}]
      </div>
      <div>
        {(segment.words || []).map((w, i) => (
          <WordEditor
            key={i}
            word={w}
            onEdit={(newWord) => updateWord(i, newWord)}
            isSelected={selectedWordIds.includes(w.start)}
            onToggleSelect={toggleWordSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default SegmentEditor;
