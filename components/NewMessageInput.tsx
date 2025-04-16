import { ArrowRight, CircleNotch, Gear, Microphone, PaperPlaneTilt, Stop, Warning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { models } from "@/constants/models";
import { useEffect, useState } from "react";
import Link from "next/link";
import ModelSelector from "./ModelSelector";

export default function NewMessageInput({ 
  input, 
  handleInputChange, 
  createMessage,
  selectedModel,
  setSelectedModel,
  onHomepage,
  isProcessing,
  errorMessage,
  setInput,
}: { 
  input: string, 
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  createMessage: (input: string) => void,
  selectedModel: string,
  setSelectedModel: (model: string) => void,
  onHomepage?: boolean,
  isProcessing?: boolean,
  errorMessage?: string | null,
  setInput: (input: string) => void
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  async function handleRecord() {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0) {
            const audioBlob = event.data;

            try {
              const formData = new FormData();
              formData.append('audio', audioBlob, 'recording.webm');
              const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`Transcription failed: ${response.statusText}`);
              }

              const data = await response.json();

              if (data.text) {
                setInput(data.text);
              } else {
                console.error("Transcription response did not contain text:", data);
              }
            } catch (error) {
              console.error("Error during transcription request:", error);
            } finally {
              setIsRecording(false);
              setMediaRecorder(null);
              stream.getTracks().forEach(track => track.stop());
            }
          }
        });

        recorder.addEventListener('stop', () => {
          stream.getTracks().forEach(track => track.stop());
        });

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      }
    }
  }

  return (
    <div
     className={`px-4 w-full py-8 ${onHomepage ? "" : "absolute bottom-0 bg-gradient-to-t from-white dark:from-sage-2 to-transparent via-50% via-white/80 dark:via-sage-2/80"}`}
     >
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="flex flex-row gap-2 items-center mx-auto max-w-xl p-2 z-40"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <CircleNotch size={16} weight="bold" className="text-teal-10 mt-1 animate-spin" />
          <p className="text-teal-11 dark:text-sage-12 mt-2 text-sm">Processing...</p>
        </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            className="mx-auto max-w-xl p-2 border bg-red-2 border-red-4 rounded-xl z-40 mb-2 flex-col gap-2 dark:bg-sage-2 dark:border-sage-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <Warning size={18} weight="bold" className="text-red-9 mt-1" />
          <div className="flex flex-col gap-2">
            <p className="text-red-11 dark:text-sage-12 mt-2 font-mono text-xs">Error: {errorMessage}</p>
            <p className="text-red-10 dark:text-sage-12 font-mono text-xs">Make sure you have correct API keys set in the settings page.</p>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="mx-auto max-w-xl bg-white dark:bg-sage-3 shadow-xl border border-sage-3 dark:border-sage-5 rounded-xl 2-50 overflow-hidden"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          createMessage(input);
        }} className="w-full">
          {isRecording ? (
            <div className="w-full p-4 border-b bg-sage-1 dark:bg-sage-2 border-sage-3 dark:border-sage-5 focus:outline-none focus:ring-0 resize-none text-sm placeholder:text-sage-10 text-sage-12">
              <p className="text-sage-11 dark:text-sage-12">Recording...</p>
            </div>
          ) : (
            <input
              className="w-full p-4 border-b border-sage-3 dark:border-sage-5 focus:outline-none focus:ring-0 resize-none text-sm placeholder:text-sage-10 text-sage-12"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
            />
          )}
        </form>
        <div className="flex justify-between items-center p-2">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          <div className="flex items-center flex-row gap-2">
          <button
              type="button"
              className={'ml-auto px-2 py-1 text-sm flex items-center gap-2 rounded-md border border-sage-5 dark:border-sage-6 hover:bg-sage-2 dark:hover:bg-sage-5 transition-colors cursor-pointer text-sage-10 dark:text-sage-11 bg-sage-1 dark:bg-sage-4'}
              onClick={handleRecord}
            >
              {isRecording ? (
                <Stop size={16} weight="fill" className="text-red-9" />
              ) : (
                <Microphone size={16} weight="bold" />
              )}
              <p className="text-sm">{isRecording ? "Stop" : "Speak"}</p>
              
              {/* <div className="flex items-center gap-px">
                <div className="flex items-center gap-1 bg-sage-4 dark:bg-sage-6 p-px rounded-xs px-1">
                  <p className="text-[10px] font-mono font-medium">V</p>
                </div>
              </div> */}
            </button>
            <button
              type="submit"
              className="ml-auto bg-sage-1 dark:bg-sage-4 px-2 py-1 text-sm flex items-center gap-2 rounded-md border border-sage-5 dark:border-sage-6 hover:bg-sage-2 dark:hover:bg-sage-5 transition-colors cursor-pointer text-sage-10 dark:text-sage-11"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                createMessage(input);
              }}
              disabled={isProcessing || !input.trim()}
            >
              <PaperPlaneTilt size={16} weight="fill" />
              <p className="text-sm">Send</p>
              <div className="flex items-center gap-px">
                <div className="flex items-center gap-1 bg-sage-4 dark:bg-sage-6 p-px rounded-xs px-1">
                  <p className="text-[10px] font-mono font-medium"> ↵</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}