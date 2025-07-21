import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// If you see import errors, run: npm install --save-dev @testing-library/react vitest
import { describe, it, expect, vi } from "vitest";
import { TranscriptEditor } from "./TranscriptEditor";
import type { TranscriptEditorProps } from "./TranscriptEditor";
import type { Transcription, Word } from "@/types/transcription";

const mockTranscription: Transcription = {
  text: "hello world this is a test",
  words: [
    { word: "hello", start: 0, end: 0.5 },
    { word: "world", start: 0.5, end: 1 },
    { word: "this", start: 1, end: 1.5 },
    { word: "is", start: 1.5, end: 2 },
    { word: "a", start: 2, end: 2.5 },
    { word: "test", start: 2.5, end: 3 },
  ],
  segments: [],
};

describe("TranscriptEditor", () => {
  it("renders the textarea with initial text", () => {
    render(<TranscriptEditor transcription={mockTranscription} />);
    expect(screen.getByRole("textbox")).toHaveValue(mockTranscription.text);
  });

  it("updates the textarea value on change", () => {
    render(<TranscriptEditor transcription={mockTranscription} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "new text here" } });
    expect(textarea).toHaveValue("new text here");
  });

  it("shows the review dialog and diff when Edit is clicked", async () => {
    render(<TranscriptEditor transcription={mockTranscription} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello world this is a test again" } });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => {
      expect(screen.getByText(/review changes/i)).toBeInTheDocument();
      expect(screen.getByText(/please review the changes/i)).toBeInTheDocument();
      expect(screen.getByText("+ again")).toBeInTheDocument();
    });
  });

  it("calls onUpdate with updated transcription when Accept is clicked", async () => {
    const onUpdate = vi.fn();
    render(<TranscriptEditor transcription={mockTranscription} onUpdate={onUpdate} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello world this is a test again" } });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => {
      expect(screen.getByText(/review changes/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "hello world this is a test again",
          words: expect.any(Array),
        })
      );
    });
  });

  it("closes the dialog and does not call onUpdate when Cancel is clicked", async () => {
    const onUpdate = vi.fn();
    render(<TranscriptEditor transcription={mockTranscription} onUpdate={onUpdate} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello world this is a test again" } });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => {
      expect(screen.getByText(/review changes/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText(/review changes/i)).not.toBeInTheDocument();
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  it("handles deletion and insertion diffs in the dialog", async () => {
    render(<TranscriptEditor transcription={mockTranscription} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello this is a test" } }); // remove 'world'
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => {
      expect(screen.getByText(/review changes/i)).toBeInTheDocument();
      expect(screen.getByText("- world")).toBeInTheDocument();
    });
  });
}); 