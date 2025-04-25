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

export default function Files() {
  const { user, sessionId, db } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) {
      console.log('Unauthorized');
      router.push('/');
    }
  }, [user, router]);

  const { data } = db.useQuery({
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
  }, {
    ruleParams: { sessionId: sessionId ?? '' }
  });

  useEffect(() => {
    if (data?.conversations) {
      setConversations(data.conversations as Conversation[]);
    }
  }, [data]);

  return (
    <div className="p-8 h-screen overflow-y-auto no-scrollbar grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {conversations.map(conv => (
        <Link
          key={conv.id}
          href={`/conversations/${conv.id}`}
          className={cn(
            'group w-full max-w-sm rounded-2xl border border-neutral-500/10 p-4',
            'transform-gpu transition-transform hover:scale-[1.02]',
            'dark:border-white/10 dark:shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset]',
            'dark:bg-neutral-800/80',
            'bg-white' // Use white background in light mode (no gray tint)
          )}
        >
          <div className="relative overflow-hidden rounded-xl shadow-inner mb-3" style={{ width: '100%', height: '180px' }}>
            <img
              src={`https://picsum.photos/seed/${conv.id}/600/400`}
              alt={conv.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white/40 dark:from-black/80 pointer-events-none" />
          </div>
          <h6 className="mb-1 font-semibold text-gray-600 text-xl tracking-tight transition-all group-hover:scale-95 dark:text-gray-300">
            {conv.name}
          </h6>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Conversation details go here.
          </p>
          <Button
            onClick={() => console.log(`Play card ${conv.id}`)}
            size="small"
            className="w-full flex items-center justify-center bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-gray-800 dark:text-white border border-neutral-200 dark:border-white/20"
          >
            <Play size={16} weight="bold" className="mr-1" />
            Play
          </Button>
        </Link>
      ))}
    </div>
  );
}

