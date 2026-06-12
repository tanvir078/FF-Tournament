import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Send } from 'lucide-react';
import { DirectMessage, fetchMessages, sendDirectMessage } from '@/lib/userSocial';
import { useAuthStore } from '@/store/auth';
import Button from '@/views/user/Mobile/_components/Button';
import Input from '@/views/user/Mobile/_components/Input';

export default function MobileChatThreadScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const conversationId = String(router.query.conversationId || '');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    <div className="flex min-h-screen flex-col bg-[#070a12] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070a12]/95 px-4 py-4 backdrop-blur">
        <h1 className="text-lg font-black">Direct Message</h1>
      </header>

      <main className="flex-1 space-y-3 px-4 py-5 pb-28">
        {messages.map((message) => {
          const mine = message.senderId === user?.id || message.senderId === 'me';
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm ${mine ? 'bg-primary-600 text-white' : 'bg-white/10 text-white/80'}`}>
                <p>{message.body}</p>
                <p className="mt-1 text-[10px] opacity-60">{message.status || 'sent'}</p>
              </div>
            </div>
          );
        })}
        {!messages.length && <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/45">Start the conversation.</div>}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={submit} className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-white/10 bg-[#070a12]/95 px-4 py-3 pb-6 backdrop-blur">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type message" />
        <Button type="submit" aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
