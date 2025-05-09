'use client';

import { useParams } from "next/navigation";
import { useDatabase } from "@/providers/database-provider";
import { useKey } from "@/providers/key-provider";
import { useEffect, useState } from "react";
import { id, InstaQLEntity, id as newInstantId } from "@instantdb/react";
import { AppSchema } from "@/instant.schema";
import { useChat } from '@ai-sdk/react'
import { DateTime } from "luxon";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import NewMessageInput from "@/components/NewMessageInput";
import { UIMessage } from "ai";
import { useNewConversation } from "@/providers/new-conversation-provider";
import { models } from "@/constants/models";
import { useAuth } from "@/providers/auth-provider";
type Conversation = InstaQLEntity<AppSchema, "conversations">;
type Message = InstaQLEntity<AppSchema, "messages">;
import { useRouter } from "next/navigation";
import MediaThemeSutro from "player.style/sutro/react";

export default function ConversationPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const { db } = useDatabase();
  const { getProviderKey } = useKey();
  const { user, sessionId } = useAuth();
  const [selectedModel, setSelectedModel] = useState<string>(models[0].id);
  const [messagesForChat, setMessagesForChat] = useState<UIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { isLoading, data, error } = db.useQuery({
    conversations: {
      $: {
        where: { id: id as string }
      },
      messages: {}
    }
  }, {
    ruleParams: {
      sessionId: sessionId ?? ''
    }
  });

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
      const aiMessageId = newInstantId();
      await db.transact(db.tx.messages[aiMessageId].ruleParams({ sessionId: sessionId ?? '' }).update({
        content: message.content,
        role: "assistant",
        createdAt: DateTime.now().toISO(),
        model: selectedModel
      }).link({ conversation: id as string }));
    },
    initialMessages: data?.conversations[0]?.messages.map((message) => ({
      role: message.role as "data" | "system" | "user" | "assistant",
      content: message.content,
      id: message.id,
      parts: [{
        type: "text",
        text: message.content
      }],
      annotations: [{
        model: message.model
      }]
    })) ?? []
  });


  async function createMessage(content: string) {
    console.log('createMessage called');
    if (!id) {
      console.error('No conversation ID available');
      return;
    }

    setInput("");
    
    const newMessageId = newInstantId();
    
    // Create user message
    await db.transact(db.tx.messages[newMessageId].ruleParams({ sessionId: sessionId ?? '' }).update({
      content: content,
      createdAt: DateTime.now().toISO(),
      role: "user",
      model: selectedModel
    }).link({ conversation: id }));

    setIsProcessing(true);
    setErrorMessage(null);

    append({
      role: "user",
      content: content,
      parts: [{
        type: "text",
        text: content
      }]
    });
  }
  return (
    <div className="flex flex-col w-full h-full mx-auto relative">
      <div className="flex-1 h-full flex items-center justify-center">
        {data?.conversations[0]?.messages && data.conversations[0].messages.length === 0 ? (
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
        ) : (
          <MediaThemeSutro style={{width: "100%"}}>
            <video
              slot="media"
              src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/high.mp4"
              playsInline
              crossOrigin="anonymous"
            ></video>
          </MediaThemeSutro>
        )}
      </div>
    </div>
  );
}

