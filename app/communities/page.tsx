'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from 'src/utils/cn';
import { Play, MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import Button from '@/components/button';

type Conversation = {
  id: string;
  name: string;
  // add additional fields as needed
};

export default function Communities() {
  const { user, sessionId, db } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user) {
      console.log('Unauthorized');
      router.push('/');
    }
  }, [user, router]);

  // Determine the current theme on mount
  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    console.log('Dark mode:', dark);
    setIsDarkMode(dark);
  }, []);

  const { data } = db.useQuery(
    {
      conversations: {
        $: {
          where: {
            or: [
              { 'user.id': user?.id ?? '' },
              { sessionId: sessionId ?? '' }
            ]
          },
          order: { createdAt: 'desc' }
        }
      }
    },
    {
      ruleParams: { sessionId: sessionId ?? '' }
    }
  );

  useEffect(() => {
    if (data?.conversations) {
      setConversations(data.conversations as Conversation[]);
    }
  }, [data]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(query.toLowerCase())
  );

  if (isDarkMode) {
    return (
      <div className="p-4 h-screen overflow-y-auto no-scrollbar bg-sage-3">
        <div className="mb-4 sticky top-0 z-10 mx-auto w-1/3 px-1 bg-sage-3">
          <div className="relative flex items-center">
            <MagnifyingGlass size={20} weight="bold" className="absolute left-3 text-sage-11 dark:text-sage-11" />
            <input
              type="text"
              placeholder="Search ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-2 py-1 rounded-full  border border-sage-4 dark:border-sage-8 bg-sage-5 text-sage-11 dark:text-sage-11 placeholder-sage-10 focus:outline-none focus:ring-2 focus:ring-teal-10"
            />
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filteredConversations.map(conv => (
            <Link
              key={conv.id}
              href={`/conversations/${conv.id}`}
              className={cn(
                'group w-full max-w-sm rounded-2xl p-4 border border-sage-4 dark:border-sage-8',
                'bg-sage-5 backdrop-blur-sm'
              )}
            >
              <div
                className="relative overflow-hidden rounded-xl shadow-inner mb-3"
                style={{ width: '100%', height: '180px' }}
              >
                <img
                  src={`https://picsum.photos/seed/${conv.id}/600/400`}
                  alt={conv.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/40 pointer-events-none" />
              </div>
              <h6 className="text-md font-mono text-sage-11 dark:text-sage-11">
                {conv.name}
              </h6>
              <p className="mb-3 text-xs font-mono text-sage-11 dark:text-sage-11">
                Dark mode conversation details.
              </p>
              <Button
                onClick={() => console.log(`Play card ${conv.id}`)}
                size="small"
                className="w-full flex items-center justify-center bg-black/30 hover:bg-black/20 text-white"
              >
                <Play size={16} weight="bold" className="mr-1" />
                Play
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}


