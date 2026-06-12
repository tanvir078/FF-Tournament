import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MessageCircle, Send } from 'lucide-react';
import { Conversation, DirectMessage, fetchConversations, fetchMessages, sendDirectMessage } from '@/lib/userSocial';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Desktop/_components/Button';
import Input from '@/views/user/Desktop/_components/Input';

export default function DesktopChatThreadScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const conversationId = String(router.query.conversationId || '');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages(conversationId).then(setMessages);
    const timer = window.setInterval(() => fetchMessages(conversationId).then(setMessages), 8000);
    return () => window.clearInterval(timer);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    const optimistic: DirectMessage = {
      id: `local-${Date.now()}`,
      conversationId,
      senderId: user?.id || 'me',
      body: body.trim(),
      status: 'sending',
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setBody('');
    try {
      const sent = await sendDirectMessage(conversationId, optimistic.body);
      setMessages((current) => current.map((message) => message.id === optimistic.id ? { ...optimistic, ...sent, status: 'sent' } : message));
    } catch {
      setMessages((current) => current.map((message) => message.id === optimistic.id ? { ...message, status: 'failed' } : message));
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <main className="mx-auto grid max-w-7xl grid-cols-[380px_minmax(0,1fr)] gap-6 px-8 py-8">
        <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <h1 className="mb-4 text-2xl font-black">Messages</h1>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => router.push(`/user/chat/${conversation.id}`)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${conversation.id === conversationId ? 'bg-primary-600/25' : 'bg-black/20 hover:bg-white/10'}`}>
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                  {conversation.user?.avatar ? <img src={conversation.user.avatar} alt={conversation.user.name} className="h-full w-full object-cover" /> : <MessageCircle className="h-5 w-5 text-white/45" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black">{conversation.user?.name || 'Direct message'}</div>
                  <div className="truncate text-xs text-white/50">{conversation.lastMessage || 'No messages yet'}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex h-[calc(100vh-64px)] min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
          <header className="border-b border-white/10 px-5 py-4">
            <h2 className="text-xl font-black">Direct Message</h2>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {messages.map((message) => {
              const mine = message.senderId === user?.id || message.senderId === 'me';
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] rounded-3xl px-4 py-3 text-sm ${mine ? 'bg-primary-600 text-white' : 'bg-black/30 text-white/80'}`}>
                    <p>{message.body}</p>
                    <p className="mt-1 text-[10px] opacity-60">{message.status || 'sent'}</p>
                  </div>
                </div>
              );
            })}
            {!messages.length && <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/45">Start the conversation.</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={submit} className="flex gap-3 border-t border-white/10 p-4">
            <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type message" />
            <Button type="submit" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
