import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MessageCircle } from 'lucide-react';
import { Conversation, fetchConversations } from '@/lib/userSocial';
import Button from '@/views/user/Mobile/_components/Button';

export default function MobileChatListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a12] px-4 py-6 pb-24 text-white">
      <header className="mb-5">
        <h1 className="text-2xl font-black">Messages</h1>
      </header>

      <div className="space-y-3">
        {conversations.map((conversation) => (
          <button key={conversation.id} onClick={() => router.push(`/user/chat/${conversation.id}`)} className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-3 text-left">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
              {conversation.user?.avatar ? <img src={conversation.user.avatar} alt={conversation.user.name} className="h-full w-full object-cover" /> : <MessageCircle className="h-6 w-6 text-white/45" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-black">{conversation.user?.name || 'Direct message'}</div>
              <div className="truncate text-xs text-white/50">{conversation.lastMessage || 'No messages yet'}</div>
            </div>
            {Boolean(conversation.unreadCount) && <span className="rounded-full bg-primary-500 px-2 py-1 text-xs font-black">{conversation.unreadCount}</span>}
          </button>
        ))}
      </div>

      {!conversations.length && (
        <div className="mt-12 rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-white/35" />
          <p className="mt-3 text-sm text-white/50">No direct messages yet.</p>
          <Button className="mt-4" onClick={() => router.push('/user/tournaments')}>Find players</Button>
        </div>
      )}
    </div>
  );
}
