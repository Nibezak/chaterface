'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from 'src/utils/cn';
import { Play } from '@phosphor-icons/react';
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

  if (isDarkMode) {
    return (
      <div className="p-8 h-screen overflow-y-auto no-scrollbar grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 bg-black/20 backdrop-blur-sm">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            href={`/conversations/${conv.id}`}
            className={cn(
              'group w-full max-w-sm rounded-2xl p-4 shadow-lg',
              'bg-black/20 backdrop-blur-sm'
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
            <h6 className="mb-1 font-semibold text-gray-100 text-xl tracking-tight transition-all group-hover:scale-95">
              {conv.name}
            </h6>
            <p className="mb-3 text-sm text-gray-100">
              Dark mode conversation details.
            </p>
            <Button
              onClick={() => console.log(`Play card ${conv.id}`)}
              size="small"
              className="w-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white"
            >
              <Play size={16} weight="bold" className="mr-1" />
              Play
            </Button>
          </Link>
        ))}
      </div>
    );
  } 
  }


