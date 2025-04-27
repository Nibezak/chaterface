'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from '@phosphor-icons/react';
import { useAuth } from '@/providers/auth-provider';
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
    <div className="p-8 h-screen overflow-y-auto no-scrollbar bg-sage-3 dark:bg-sage-3">
      <table className="min-w-full rounded-md dark:border-neutral-700 shadow-md overflow-hidden bg-white/5 dark:bg-black/10">
        <thead>
          <tr className="dark:bg-black/30 ">
            <th className="p-4 bg-sage-10 dark:bg-sage-5 border border-sage-7  text-sage-11 font-md text-left text-sm"></th>
            <th className="p-4 bg-sage-10 dark:bg-sage-5 border border-sage-7  text-sage-11 font-md text-left text-sm">Name</th>
             <th className="p-4 bg-sage-10 dark:bg-sage-5 border border-sage-7  text-sage-11 font-md text-left text-sm">Details</th>
             <th className="p-4 bg-sage-10 dark:bg-sage-5 border border-sage-7  text-sage-11 font-md text-left text-sm">Action</th>
          </tr>
        </thead>
        <tbody className="shadow-sm bg-transparent divide-y divide-neutral-500/10">
          {conversations.map((conv) => (
            <tr
              key={conv.id}
              onClick={() => router.push(`/conversations/${conv.id}`)}
              className="border border-sage-8 dark:border-sage-7 hover:bg-white/5 dark:hover:bg-black/40 cursor-pointer transition-colors w-full p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300"
            >
              <td className="p-4">
                <div
                  className="relative overflow-hidden border border-neutral-300 dark:border-neutral-600 shadow-sm hover:shadow"
                  style={{ width: '60px', height: '30px' }}
                >
                  <img
                    src={`https://picsum.photos/seed/${conv.id}/600/400`}
                    alt={conv.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td className="p-4">
                <h6 className="font-semibold text-xs font-mono text-sage-11 dark:text-sage-11 truncate">
                  {conv.name}
                </h6>
              </td>
              <td className="p-4 text-xs font-mono text-sage-11 dark:text-sage-11 truncate">
                Conversation details go here.
              </td>
              <td className="p-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/conversations/${conv.id}`);
                  }}
                  size="small"
                  className="w-full p-2 hover:bg-sage-3 dark:hover:bg-sage-4 rounded-md group transition-colors duration-300 flex items-center justify-center bg-transparent hover:bg-white/10 dark:hover:bg-black/40 text-xs font-mono text-sage-11 dark:text-sage-11 border border-neutral-200 dark:border-neutral-600 shadow-sm"
                >
                  <Play size={16} weight="bold" className="mr-1" />
                  Play
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
