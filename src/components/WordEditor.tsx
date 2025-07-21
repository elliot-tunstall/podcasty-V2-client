
import React from "react";

interface Word {
  word: string;
  start: number;
  end: number;
  explanation?: string;
}

interface Props {
  word: Word;
  onEdit: (newWord: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

const WordEditor: React.FC<Props> = ({ word, onEdit, isSelected, onToggleSelect }) => {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onEdit(e.currentTarget.textContent || "")}
      title={word.explanation ? `Explanation: ${word.explanation}` : `Start: ${word.start.toFixed(2)}s`}
      onClick={(e) => {
        e.preventDefault();
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          onToggleSelect(word.start);
        }
      }}
      style={{
        marginRight: "5px",
        padding: "2px 4px",
        borderBottom: word.explanation ? "2px dotted blue" : "1px dotted #ccc",
        backgroundColor: isSelected ? "#d0eaff" : undefined,
        cursor: "pointer",
        display: "inline-block"
      }}
    >
      {word.word}
    </span>
  );
};

export default WordEditor;
