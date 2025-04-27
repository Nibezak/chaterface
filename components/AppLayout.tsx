'use client';

import Button from "@/components/button";
import Logo from "@/components/logo";
import { Plus, MoonStars, Sun, ArrowRight, SignOut, SignIn, Folder, Users } from "@phosphor-icons/react";
import { useAuth } from "@/providers/auth-provider";
import { useDatabase } from "@/providers/database-provider";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import hotkeys from 'hotkeys-js';
import { useCreateConversation } from "@/app/utils/conversation";
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity } from "@instantdb/react";

// Define the expected shape of a conversation based on AppSchema
type Conversation = InstaQLEntity<AppSchema, "conversations">;

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile, db, sessionId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageCount, setMessageCount] = useState<number>(0);
  // Local theme state for non-logged in users with system default
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const pathname = usePathname();
  const { createConversationAndRedirect } = useCreateConversation();

  // Determine the active conversation ID from the pathname
  const conversationId = pathname.startsWith('/conversations/')
    ? pathname.split('/').pop()
    : null;

  // Fetch conversations associated with the current session
  const { data } = db.useQuery({
    conversations: {
      $: {
        where: {
          or: [
            { 'user.id': user?.id ?? '' },
            { sessionId: sessionId ?? '' }
          ],
        },
        order: { createdAt: "desc" }
      },
    },
    messages: {
      $: {
        where: {
          role: 'assistant',
          or: [
            { 'conversation.sessionId': sessionId ?? '' },
            { 'conversation.user.id': user?.id ?? '' }
          ],
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
      setConversations(data.conversations as Conversation[]);
    }

    if (data?.messages) {
      setMessageCount(data.messages.length);
    }
  }, [data]);

  // Set up keyboard shortcuts
  useEffect(() => {
    hotkeys('n', (event) => {
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

  const setTheme = async (newTheme: string) => {
    await db.transact(db.tx.userProfiles[profile?.id].update({ theme: newTheme }));
  };

  // toggleTheme function works for both logged in & non-logged in users
  const toggleTheme = async () => {
    if (profile) {
      await setTheme(profile.theme === 'dark' ? 'light' : 'dark');
    } else {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setThemeState(newTheme);
    }
  };

  // Sync document class based on local theme state
  useEffect(() => {
    if (!profile) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, profile]);

  // Generate current theme for rendering
  const currentTheme = profile ? profile.theme : theme;

  return (
    <div className={`flex flex-row h-dvh w-full overflow-hidden bg-sage-1 dark:bg-sage-1 ${currentTheme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="flex flex-col p-4 overflow-y-auto items-start w-full max-w-64 overflow-hidden">
        <div className="flex flex-row gap-4 justify-between w-full items-center">
          {/* Logo with label when signed in */}
          <div className="flex flex-row items-center gap-2">
            <Logo style="small" className="my-2 ml-1" color={currentTheme === 'dark' ? 'white' : 'black'}/>
              <span className="text-xs text-sage-11 dark:text-sage-11">v1.0</span>
          </div>
        </div>
         <Link
          href="/"
          className="mt-4 w-full bg-sage-3 text-sage-11 hover:bg-sage-4 dark:bg-sage-3 rounded-md dark:text-sage-11 dark:hover:bg-sage-4 duration-300 border border-sage-6 dark:border-sage-6 flex items-center justify-center"
        >
          <Plus size={16} weight="bold" />
          <span className="ml-2">New Conversation</span>
        </Link>
        <div className="flex flex-col border bg-sage-1 dark:bg-sage-3 border-sage-4 dark:border-sage-5 rounded-md p-4 w-full mt-4">
          <div className="flex flex-row gap-2 justify-between items-center">
            <p className="text-[10px] font-mono text-sage-11 dark:text-sage-11 uppercase">Usage </p>
            <p className="text-[10px] font-mono text-sage-11 dark:text-sage-11">
              {user ? messageCount + '/200' : messageCount + '/100'}
            </p>
          </div>
          <div className="relative h-1 w-full bg-sage-3 mt-2 dark:bg-sage-5 rounded-full">
            <div className="h-1 bg-teal-9 rounded-full absolute left-0" style={{ width: `${messageCount}%` }}></div>
          </div>

        </div>

        {/* Conversation List */}
        <div className="gap-2 flex flex-col w-full mt-4 flex-1 overflow-y-auto">
          <Link
            href="/files"
            className="w-full p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center gap-2 sticky top-0 bg-sage-2 dark:bg-sage-1 pb-2"
          >
            <Folder
              size={16}
              weight="bold"
              className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300"
            />
            <span className="text-xs font-mono text-sage-11 dark:text-sage-11">
              My documents 
            </span>
            <span className="text-xs font-mono text-sage-11 dark:text-sage-11 ml-auto">
              {conversations.length}
            </span>
          </Link>

        <Link
            href="/communities"
            className="w-full p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center gap-2"
          >
            <Users
              size={16}
              weight="bold"
              className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300"
            />
            <span className="text-xs font-mono text-sage-11 dark:text-sage-11">
              Community
            </span>
          </Link>
          {/* <div className="flex flex-col w-full gap-2">
            {conversations.map(conv => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className={`text-sm px-2 py-1 rounded-md hover:bg-sage-3 dark:hover:bg-sage-4 duration-300 truncate ${
                  conv.id === conversationId
                    ? 'bg-sage-4 dark:bg-sage-5 font-medium text-sage-12 dark:text-sage-12'
                    : 'text-sage-11 dark:text-sage-11'
                }`}
                title={conv.name}
              >
                {conv.name}
              </Link>
            ))}
          </div> */}
        </div>

        {/* Bottom Controls: Auth actions, Theme toggle and external links */}
        <div className="flex flex-col w-full mt-auto gap-4 py-4 border-t border-sage-4 dark:border-sage-5 pt-4">
        {user ? (
       <>
{/* <div className="flex flex-row gap-1 items-center mt-2">
  <Link
    href="/files"
    className="w-full p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center gap-2"
  >
    <Folder
      size={16}
      weight="bold"
      className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300"
    />
    <span className="text-xs text-sage-11 dark:text-sage-11">
      My Files
    </span>
  </Link>
</div> */}

       </>
          ) : (
            <>
              <p className="text-xs text-sage-11 dark:text-sage-11 mt-4">Create Account for higher limits</p>
            </>
          )}
          <div className="flex flex-col gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center gap-2"
              aria-label={currentTheme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {currentTheme === 'light' ? (
                <>
                  <MoonStars size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
                  <span className="text-xs text-sage-11 dark:text-sage-11">Switch to Dark Theme</span>
                </>
              ) : (
                <>
                  <Sun size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
                  <span className="text-xs text-sage-11 dark:text-sage-11">Switch to Light Theme</span>
                </>
              )}
            </button>
            {profile ? (
              <button
                onClick={signOut}
                className="p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center gap-2"
              >
                <SignOut size={16} weight="bold" className="text-sage-10 group-hover:text-sage-12 dark:text-sage-9 dark:group-hover:text-sage-11 transition-colors duration-300" />
                <span className="text-xs text-sage-11 dark:text-sage-11">Sign Out</span>
              </button>
            ) : (
              <div className="flex flex-row gap-2 items-center p-2">
                <SignIn size={16} weight="bold" className="text-sage-12 transition-colors duration-300" />
                <Link href={db.auth.createAuthorizationURL({
                  clientName: "google-web",
                  redirectURL: window.location.href,
                })} className="text-xs text-sage-12 font-medium">
                  Sign in with Google
                </Link>
              </div>
            )}
          </div>

          <Link href="https://github.com/nibezak/ground-0" target="_blank" className="flex flex-row items-center gap-2 group">
            <p className="text-xs font-mono px-2 text-sage-11 dark:text-sage-11 hover:text-sage-12 transition-colors duration-300">
              Research Paper
            </p>
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