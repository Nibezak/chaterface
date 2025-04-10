'use client';

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDatabase } from "@/providers/database-provider";
import { id } from "@instantdb/react";
import { DateTime } from "luxon";

export default function NewConversation() {
  const { user } = useAuth();
  const router = useRouter();
  const { db } = useDatabase();
  useEffect(() => {
    if (user) {
      createConversation();
    }
  }, [user]);

  const createConversation = async () => {
    const conversationId = id();
    const conversation = await db.transact(db.tx.conversations[conversationId].update({
      name: 'New Conversation',
      createdAt: DateTime.now().toISO(),
    }).link({user: user.id}));
    router.replace(`/conversations/${conversationId}`);
  };

  return (
    <div>
      <h1>New Conversation</h1>
    </div>
  );
}