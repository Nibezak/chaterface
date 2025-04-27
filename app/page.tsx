'use client';

import { useState, useRef, useEffect } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useKey } from "@/providers/key-provider";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { id, InstaQLEntity } from "@instantdb/react";
import Button from "@/components/button";
import ApiKeyInput from "@/components/api-key-input";
import Logo from "@/components/logo";
import { Lora } from "next/font/google";
import IntroductionModal from "@/components/IntroductionModal";
import { AnimatePresence } from "motion/react";
import ChatInput from "@/components/ChatInput";
import NewMessageInput from "@/components/NewMessageInput";
import { useNewConversation } from "@/providers/new-conversation-provider";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@/providers/auth-provider";
import { AppSchema } from "@/instant.schema";
import MessageList from "@/components/MessageList";
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type Message = InstaQLEntity<AppSchema, "messages">;

export default function Home() {
  const { db } = useDatabase();
  const { providerKeys } = useKey();
  const router = useRouter();
  const { user, sessionId } = useAuth();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getProviderKey } = useKey();
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4.1-nano');
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const conversationIdRef = useRef<string>('');

  const { data } = db.useQuery({
    conversations: {
      $: {
        where: { id: conversationId }
      },
      messages: {}
    }
  }, {
    ruleParams: {
      sessionId: sessionId ?? ''
    }
  });

  useEffect(() => {
    if (conversationId && data && data.conversations[0]) {
      setDbMessages(data.conversations[0].messages ?? []);
    }
  }, [data, conversationId]);

  const { messages, input, handleInputChange, append, setInput, status } = useChat({
    api: '/api/chat',
    headers: {
      'Authorization': `Bearer ${getProviderKey(selectedModel)}`,
      'X-Session-Id': sessionId ?? '',
      'X-Token': user?.refreshToken ?? ''
    },
    body: {
      model: selectedModel
    },
    onError: async (error) => {
      setIsProcessing(false);
      setErrorMessage(error.message);
    },
    onFinish: async (message) => {
      setIsProcessing(false);
      const aiMessageId = id();
      const currentConversationId = conversationIdRef.current;
      if (currentConversationId) {
        await db.transact(db.tx.messages[aiMessageId].ruleParams({ sessionId: sessionId }).update({
          content: message.content,
          role: "assistant",
          createdAt: DateTime.now().toISO(),
          model: selectedModel
        }).link({ conversation: currentConversationId }));
      } else {
        console.error("onFinish executed but conversationIdRef.current was empty.");
      }
    }
  });

  // Get the current provider from the selected model
  const currentProvider = selectedModel.split('/')[0] as keyof typeof providerKeys;

  const getPlaceholder = () => {
    if (!providerKeys[currentProvider]) {
      return `Please set your ${currentProvider} API key first...`;
    }
    return "Start a new chat...";
  };

  async function createMessage(content: string) {
    setIsProcessing(true);
    setErrorMessage(null);
    if (!conversationId) {
      const generatedNewConversationId = id();
      setConversationId(generatedNewConversationId);
      conversationIdRef.current = generatedNewConversationId;
      // Create conversation
      await db.transact(db.tx.conversations[generatedNewConversationId].update({
        createdAt: DateTime.now().toISO(),
        name: content.slice(0, 20).trim(),
        sessionId: sessionId ?? ''
      }));
      await db.transact(db.tx.messages[id()].ruleParams({ sessionId: sessionId }).update({
        content: content,
        role: "user",
        createdAt: DateTime.now().toISO(),
        model: selectedModel
      }).link({ conversation: generatedNewConversationId }));
    } else {
      await db.transact(db.tx.messages[id()].ruleParams({ sessionId: sessionId }).update({
        content: content,
        role: "user",
        createdAt: DateTime.now().toISO(),
        model: selectedModel
      }).link({ conversation: conversationId }));
    }
    append({
      role: "user",
      content: content,
      parts: [{
        type: "text",
        text: content
      }]
    });
    setInput('');
  }

  return (
    <div className="flex flex-col w-full h-full mx-auto relative">
      <div className="flex-1 h-full flex items-center justify-center">

          <div className="flex flex-col h-full justify-between items-center">
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-medium text-sage-12">What's on your mind?</h2>
              <p className="text-sage-11 text-sm font-mono mt-1">
                I can generate stories and podcasts for your ideas.
              </p>
            </div>
            <div className="w-full flex justify-center mb-4">
              <NewMessageInput 
                input={input}
                handleInputChange={handleInputChange}
                createMessage={createMessage}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isProcessing={isProcessing}
                errorMessage={errorMessage}
                setInput={setInput}
              />
            </div>
          </div>

      </div>
    </div>
  );
}
