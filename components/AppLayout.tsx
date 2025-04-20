'use client';

import Button from "@/components/button";
import Logo from "@/components/logo";
import { Plus, Gear, MoonStars, Sun, ArrowRight, SignOut, User, SignIn, Diamond } from "@phosphor-icons/react";
import { useAuth } from "@/providers/auth-provider";
import { useDatabase } from "@/providers/database-provider";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import hotkeys from 'hotkeys-js';
import { useCreateConversation } from "@/app/utils/conversation"
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity } from "@instantdb/react";
import Cookies from 'js-cookie';

// Define the expected shape of a conversation based on AppSchema
type Conversation = InstaQLEntity<AppSchema, "conversations">;

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile, db, sessionId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [theme, setTheme] = useState<string>(Cookies.get('theme') ?? 'light');
  const [messageCount, setMessageCount] = useState<number>(0);
  const pathname = usePathname();
  const { createConversationAndRedirect } = useCreateConversation();

  // Determine the active conversation ID from the pathname
  const conversationId = pathname.startsWith('/conversations/') ? pathname.split('/').pop() : null;

  // Fetch conversations associated with the current session
  const { data } = db.useQuery({
    conversations: {
      $: {
        where: {
          or: [{ 'user.id': user?.id ?? '' }, { sessionId: sessionId ?? '' }],

        },
        order: { createdAt: "desc" }
      },
    },
    messages: {
      $: {
        where: {
          role: 'assistant',
          or: [{ 'conversation.sessionId': sessionId ?? '' }, { 'conversation.user.id': user?.id ?? '' }],
        }
      }
    }
  }, {
    ruleParams: {
      sessionId: sessionId ?? ''
    }
  });

  useEffect(() => {
    if (data?.conversations) {
      // No need to map createdAt to Date, keep as ISO string from DB
      setConversations(data.conversations as Conversation[]);
    }

    if (data?.messages) {
      setMessageCount(data.messages.length);
    }
  }, [data]);

  // Set up keyboard shortcuts
  useEffect(() => {
    // Shortcut 'n' to create a new conversation
    hotkeys('n', (event) => {
      // Prevent triggering shortcut if focus is inside an input or textarea
      if (!(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        createConversationAndRedirect();
      }
    });

    return () => {
      hotkeys.unbind('n');
    };
  }, [createConversationAndRedirect]);

  const signOut = () => {
    db.auth.signOut();
  };
  
  // Create the authorization URL:
  const url = db.auth.createAuthorizationURL({
    clientName: "google-web",
    redirectURL: window.location.href,
  });

  return (
    <div className={`flex flex-row h-dvh w-full overflow-hidden bg-sage-1 dark:bg-sage-1 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="flex flex-col p-2 overflow-y-auto items-start w-full max-w-64 overflow-hidden">
        <div className="flex flex-row gap-2 justify-between w-full items-center">
          <Logo style="small" className="my-2 ml-1" color={theme === 'dark' ? 'white' : 'black'}/>
          
          <div className="flex flex-row gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                  <MoonStars size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
              ) : (
                  <Sun size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
              )}
            </button>

            <button onClick={() => signOut()} className="p-1 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300">
              <SignOut size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
            </button>
          </div>
        </div>
        <Button onClick={createConversationAndRedirect} size="small" className="mt-2 w-full bg-sage-3 text-sage-11 hover:bg-sage-4 dark:bg-sage-3 dark:text-sage-11 dark:hover:bg-sage-4 duration-300 border border-sage-6 dark:border-sage-6" icon={<Plus size={16} weight="bold" />}>New Conversation</Button>

        <div className="flex flex-col border bg-sage-1 dark:bg-sage-3 border-sage-4 dark:border-sage-5 rounded-md p-2 w-full mt-2">
          <div className="flex flex-row gap-2 justify-between items-center" >
            <p className="text-[10px] font-mono text-sage-11 dark:text-sage-11 uppercase">Usage </p>
            <p className="text-[10px] font-mono text-sage-11 dark:text-sage-11"> {user ? messageCount + '/200' : messageCount + '/100'} </p>
          </div>
          <div className="relative h-1 w-full bg-sage-3 mt-1 dark:bg-sage-5 rounded-full">
            <div className="h-1 bg-teal-9 rounded-full absolute left-0" style={{ width: `${messageCount }%` }}></div>
          </div>

          {user ? (
            <>
              {/* <p className="text-xs text-sage-11 dark:text-sage-11 mt-4"> Upgrade for higher limits </p>
              <div className="flex flex-row gap-1 items-center mt-1">
                <Diamond size={12} weight="bold" className="text-sage-12 group-hover:text-sage-12 transition-colors duration-300" />
                <Link href={'/plans'} className="text-xs text-sage-12 font-medium">Upgrade Plan</Link>
              </div> */}
            </>
          ) : (
            <>
              <p className="text-xs text-sage-11 dark:text-sage-11 mt-4"> Create Account for higher limits </p>
              <div className="flex flex-row gap-1 items-center mt-1">
                <SignIn size={12} weight="bold" className="text-sage-12 group-hover:text-sage-12 transition-colors duration-300" />
                <Link href={url} className="text-xs text-sage-12 font-medium">Sign in with Google</Link>
              </div>
            </>
          )}

          {/* <Button onClick={() => router.push('/pricing')} size="small" className="mt-1 w-full bg-sage-2 text-sage-11 hover:bg-sage-4 dark:bg-sage-3 dark:text-sage-11 dark:hover:bg-sage-4 duration-300 border border-sage-4 dark:border-sage-6" icon={<User size={16} weight="bold" />}>Sign In</Button> */}
        </div>

        {/* Conversation List */}
        <div className="gap-2 flex flex-col w-full mt-4 flex-1 overflow-y-auto">
          <div className="flex flex-row items-center justify-between gap-2 sticky top-0 bg-sage-2 dark:bg-sage-1 pb-1">
            <p className="text-xs font-mono px-2 text-sage-11 dark:text-sage-11">Conversations</p>
            <p className="text-xs font-mono px-2 text-sage-11 dark:text-sage-11"> {conversations.length} </p>
          </div>
          <div className="flex flex-col w-full gap-px">
            {conversations.map(conv => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className={`text-sm px-2 py-1 rounded-md hover:bg-sage-3 dark:hover:bg-sage-4 duration-300 truncate ${conv.id === conversationId ? 'bg-sage-4 dark:bg-sage-5 font-medium text-sage-12 dark:text-sage-12' : 'text-sage-11 dark:text-sage-11'}`}
                title={conv.name}
              >
                {conv.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col w-full mt-auto gap-2 py-4">
          <Link href="https://github.com/hyperaide/chaterface" target="_blank" className="flex flex-row items-center gap-1 group">
            <p className="text-xs font-mono px-2 text-sage-11 dark:text-sage-11 hover:text-sage-12 transition-colors duration-300">View Github Repo</p>
            <ArrowRight size={12} weight="bold" className="text-sage-11 dark:text-sage-11 group-hover:text-sage-12 transition-colors duration-300" />
          </Link>
          <Link href="https://x.com/dqnamo" target="_blank" className="flex flex-row items-center gap-1 group">
            <p className="text-xs font-mono px-2 text-sage-11 dark:text-sage-11 hover:text-sage-12 transition-colors duration-300">Made by @dqnamo</p>
            <ArrowRight size={12} weight="bold" className="text-sage-11 dark:text-sage-11 group-hover:text-sage-12 transition-colors duration-300" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full bg-white dark:bg-sage-2 mr-2 my-2 rounded-lg overflow-hidden border border-sage-4 dark:border-sage-5">
        {children}
      </div>
    </div>
  );
} 