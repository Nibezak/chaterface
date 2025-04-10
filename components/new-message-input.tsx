import { ArrowRight, CircleNotch, Gear, PaperPlaneTilt, Warning } from "@phosphor-icons/react";
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
}: { 
  input: string, 
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  createMessage: (input: string) => void,
  selectedModel: string,
  setSelectedModel: (model: string) => void,
  onHomepage?: boolean,
  isProcessing?: boolean,
  errorMessage?: string | null
}) {

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
      <motion.div className="mx-auto max-w-xl bg-white dark:bg-sage-3 shadow-xl border border-sage-3 dark:border-sage-5 rounded-xl 2-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          createMessage(input);
        }} className="w-full">
          <input
            className="w-full p-4 border-b border-sage-3 dark:border-sage-5 focus:outline-none focus:ring-0 resize-none text-sm placeholder:text-sage-10 text-sage-12"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
        <div className="flex justify-between items-center p-2">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          <button 
            className="ml-auto bg-sage-1 dark:bg-sage-4 px-2 py-1 text-sm flex items-center gap-2 rounded-md border border-sage-5 dark:border-sage-6 hover:bg-sage-2 dark:hover:bg-sage-5 transition-colors cursor-pointer text-sage-10 dark:text-sage-11" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createMessage(input);
            }}
          >
            <PaperPlaneTilt size={16} weight="fill" />
            <p className="text-sm">Send Message</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}