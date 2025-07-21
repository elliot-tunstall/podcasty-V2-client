
// edit transcriptions after generation.

import type { Transcription, Word } from "@/types/transcription";
import { Button } from "../ui/button";
import { useState } from "react";
import { diff, changed } from "myers-diff";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import React from "react";

// expected transcripton object:
// - text 
// - words
//   - timestamps 

// edit the main block of text. 
// write functions to append edits to words.
  // linear interpolation of timestamps between adjacent words.
// we can build segments back during display.

// Define props type
export type TranscriptEditorProps = {
  transcription: Transcription;
  onUpdate?: (updated: Transcription) => void;
};

export function TranscriptEditor({ transcription, onUpdate }: TranscriptEditorProps) {
  const [editedText, setEditedText] = useState(transcription.text);
  const [words, setWords] = useState<Word[]>(transcription.words)
  const [indexDisplacement, setIndexDisplacement] = useState<number>(0)
  const [showDialog, setShowDialog] = useState(false);

  const createWords = (startIndex: number, del: number, newWords: string[]): Word[] => {
    // creates a list of words with text, and time stamps 

    const add = newWords.length
    
    const startTime = words[startIndex -1].end || words[startIndex].start
    const endTime = words[startIndex + del].start || startTime + 0.3 * (add || 1)
    const timeDiff = endTime - startTime
    const timePeriod = timeDiff / (add)
    console.log("start", startTime)
    console.log("end", endTime)
    console.log("time differnce", timeDiff)
    console.log("word gap:", del)
    console.log("time period", timePeriod)
    console.log("words added", add)
    console.log("insertion:", newWords)
    console.log("words length", words.length)
    console.log("add postion", startIndex)


    const transcriptWords: Word[] = []
    newWords.forEach((word: string , i: number) => {
      transcriptWords.push({ word: word, start: startTime + timePeriod * i, end: startTime + timePeriod * ( i + 1 ) })
    })
    return transcriptWords;
  }

  const updateWords = () => {
    const lhs = transcription.text;
    const rhs = editedText;
    const changes = diff(lhs, rhs, {
      compare: 'words',
      ignoreWhitespace: false,
      ignoreCase: true,
      ignoreAccents: false
    });

    // Sort in descending order to preserve index positions during mutation
    // const sortedChanges = changes.sort((a: Change, b: Change) => (b.rhs.at || b.lhs.at) - (a.lhs.at || a.rhs.at));

    for (const change of changes) {
      // Deletion
      if (changed(change.lhs) && change.lhs.del) {
        // Optionally reconstruct deleted text (not strictly needed for splice, but for consistency)
        let deletedWords: string[] = [];
        for (let k = 0; k < change.lhs.del; k++) {
          deletedWords.push(change.lhs.getPart(change.lhs.at + k).text);
        }
        // Remove the correct number of words
        let updatedWords: Word[] = words.splice(change.lhs.at + indexDisplacement, change.lhs.del)
        setWords(updatedWords);
        setIndexDisplacement(indexDisplacement - change.lhs.del)
      }
      // Insertion
      if (changed(change.rhs) && change.rhs.add) {
        // Reconstruct inserted text
        let insertedWords: string[] = [];
        for (let k = 0; k < change.rhs.add; k++) {
          insertedWords.push(change.rhs.getPart(change.rhs.at + k).text);
        }
        const wordGap: number = change.lhs?.del;
        // Use the reconstructed text for createWords
        const insertions = createWords(change.rhs.at, wordGap, insertedWords);
        
        let updatedWords = words.splice(change.rhs.at, 0, ...insertions)
        setWords(updatedWords);
        setIndexDisplacement(indexDisplacement + change.rhs.add)
      }
    }
    return words;
  };

  // Helper to render word-level diff
  const renderDiff = () => {
    const lhs = transcription.text;
    const rhs = editedText;
    const changes = diff(lhs, rhs, {
      compare: 'words',
      ignoreWhitespace: false,
      ignoreCase: true,
      ignoreAccents: false
    });
    const result: React.ReactNode[] = [];
    changes.forEach((change, i) => {
      // Deletion
      if (changed(change.lhs) && change.lhs.del) {
        let deletedWords: string[] = [];
        for (let k = 0; k < change.lhs.del; k++) {
          deletedWords.push(change.lhs.getPart(change.lhs.at + k).text);
        }
        result.push(
          <div key={`del-${i}`} style={{ background: '#ffeaea', color: '#c00', textDecoration: 'line-through', marginRight: 2 }}>
            - {deletedWords.join(' ')}
          </div>
        );
      }
      // Insertion
      if (changed(change.rhs) && change.rhs.add) {
        let insertedWords: string[] = [];
        for (let k = 0; k < change.rhs.add; k++) {
          insertedWords.push(change.rhs.getPart(change.rhs.at + k).text);
        }
        result.push(
          <div key={`ins-${i}`} style={{ background: '#eaffea', color: '#008000', marginRight: 2 }}>
            + {insertedWords.join(' ')}
          </div>
        );
      }
      // Unchanged
      if (!changed(change.lhs) && !changed(change.rhs)) {
        result.push(
          <span key={`same-${i}`} style={{ marginRight: 2 }}>{change.lhs.text}</span>
        );
      }
    });
    return <div style={{ padding: '1em', border: '1px solid #eee', borderRadius: 4, background: '#fafbfc', marginBottom: 16 }}>{result}</div>;
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleAccept = () => {
    if (onUpdate) {
      updateWords();

      onUpdate({
        ...transcription,
        text: editedText,
        words: words,
      });
    }
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <div>
      <textarea
        value={editedText}
        onChange={e => setEditedText(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />
      <Button variant={'secondary'} onClick={handleEdit}>Edit</Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Changes</DialogTitle>
            <DialogDescription>
              Please review the changes below. Accept to apply, or cancel to discard.
            </DialogDescription>
          </DialogHeader>
          {renderDiff()}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} type="button">Cancel</Button>
            <Button variant="secondary" onClick={handleAccept} type="button">Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

