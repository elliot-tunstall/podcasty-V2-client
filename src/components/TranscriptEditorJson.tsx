import React from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react18';
import 'jsoneditor-react18/es/editor.min.css';
import type { Episode } from "@/types/podcast";

interface TranscriptEditorProps {
  formData: Omit<Episode, "_id">;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Episode, "_id">>>;
  isTranscribing: boolean;
}

const TranscriptEditor = ({ formData, setFormData, isTranscribing }: TranscriptEditorProps) => {

  const handleTranscriptionChange = (json: any) => {
    setFormData(prev => ({
      ...prev,
      transcription: json,
    }));
  };

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <label htmlFor="transcript" className="text-sm font-medium text-gray-700">
          Transcript
        </label>
        {isTranscribing && (
          <div className="text-sm text-muted-foreground">Generating transcript...</div>
        )}
      </div>
      <div className="border rounded p-2 bg-muted shadow-sm">
      <Editor
          value={formData.transcription || {}}
          onChange={handleTranscriptionChange}
          mode="tree" // Options: 'tree', 'code', 'text', etc.
          history={true}
          schema={{
            type: "object",
            properties: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          }}
          htmlElementProps={{
            style: { height: '400px', borderRadius: '0.5rem' },
          }}
        />
      </div>
    </div>
  );
};

export default TranscriptEditor;