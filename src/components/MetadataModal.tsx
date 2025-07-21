
import React, { useState } from "react";

interface Props {
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const MetadataModal: React.FC<Props> = ({ onSubmit, onClose }) => {
  const [text, setText] = useState("");

  return (
    <div style={{
      position: "fixed", top: "20%", left: "30%", right: "30%", background: "white",
      border: "1px solid #ccc", padding: "1em", zIndex: 1000
    }}>
      <h4>Add Explanation</h4>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: "100%" }} />
      <div style={{ marginTop: "1em", textAlign: "right" }}>
        <button onClick={() => onSubmit(text)}>Save</button>
        <button onClick={onClose} style={{ marginLeft: "1em" }}>Cancel</button>
      </div>
    </div>
  );
};

export default MetadataModal;
