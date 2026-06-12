import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MessageCircle } from 'lucide-react';
import { Conversation, fetchConversations } from '@/lib/userSocial';
import Button from '@/views/user/Desktop/_components/Button';

export default function DesktopChatListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <main className="mx-auto grid max-w-7xl grid-cols-[380px_minmax(0,1fr)] gap-6 px-8 py-8">
        <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <h1 className="mb-4 text-2xl font-black">Messages</h1>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => router.push(`/user/chat/${conversation.id}`)} className="flex w-full items-center gap-3 rounded-2xl bg-black/20 p-3 text-left hover:bg-white/10">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                  {conversation.user?.avatar ? <img src={conversation.user.avatar} alt={conversation.user.name} className="h-full w-full object-cover" /> : <MessageCircle className="h-5 w-5 text-white/45" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black">{conversation.user?.name || 'Direct message'}</div>
                  <div className="truncate text-xs text-white/50">{conversation.lastMessage || 'No messages yet'}</div>
                </div>
                {Boolean(conversation.unreadCount) && <span className="rounded-full bg-primary-500 px-2 py-1 text-xs font-black">{conversation.unreadCount}</span>}
              </button>
            ))}
          </div>
        </section>
        <section className="flex min-h-[620px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02]">
          <div className="text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-3 text-sm text-white/50">Select a conversation.</p>
            {!conversations.length && <Button className="mt-4" onClick={() => router.push('/user/tournaments')}>Find players</Button>}
          </div>
        </section>
      </main>
    </div>
  );
}
