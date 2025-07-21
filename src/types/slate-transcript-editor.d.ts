declare module 'slate-transcript-editor' {
  interface SlateTranscriptEditorProps {
    transcriptData: any;
    mediaUrl: string;
    sttJsonType: string;
    isEditable: boolean;
    handleSaveTranscript: (data: any) => void;
  }

  const SlateTranscriptEditor: React.FC<SlateTranscriptEditorProps>;
  export default SlateTranscriptEditor;
} 