import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import { createEcho } from '@/lib/echo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SupportInbox() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const load = async () => { const { data } = await api.get('/support/tickets'); setTickets(data || []); if (selected) setSelected((data || []).find((ticket: any) => ticket.id === selected.id) || null); };
  const open = async (ticket: any) => { const { data } = await api.put(`/support/tickets/${ticket.id}/read`); setSelected(data); await load(); };
  const refreshSelected = async () => { if (!selected) return; await api.put(`/support/tickets/${selected.id}/read`); await load(); };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!selected) return;
    const echo = createEcho();
    echo?.private(`support.ticket.${selected.id}`).listen('.support.message.created', refreshSelected);
    return () => { echo?.leave(`support.ticket.${selected.id}`); echo?.disconnect(); };
  }, [selected?.id]);
  const send = async (event: FormEvent) => { event.preventDefault(); await api.post(`/support/tickets/${selected.id}/replies`, { message: reply }); setReply(''); await load(); };
  return <div className="min-h-screen bg-gray-900 text-white py-8"><div className="max-w-6xl mx-auto px-4"><h1 className="text-3xl font-bold mb-6">Support Inbox</h1><div className="grid md:grid-cols-[320px_1fr] gap-4"><Card className="p-3 space-y-2">{tickets.map((ticket) => <button key={ticket.id} onClick={() => void open(ticket)} className="w-full text-left bg-gray-800 rounded p-3"><b>{ticket.subject}</b><p className="text-xs text-gray-400">{ticket.status}{ticket.unreadCount ? ` · ${ticket.unreadCount} unread` : ''}</p></button>)}</Card><Card className="p-5">{selected ? <><h2 className="font-bold text-xl mb-4">{selected.subject}</h2><div className="space-y-2 mb-4">{selected.replies?.map((message: any) => <div key={message.id} className="bg-gray-800 rounded p-3"><b className="text-xs text-blue-400">{message.isAdmin ? 'Management' : 'User'}</b><p>{message.message}</p></div>)}</div><form onSubmit={send} className="flex gap-2"><input value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 bg-gray-800 px-3 rounded" required /><Button type="submit">Reply</Button></form></> : <p className="text-gray-400">Select a ticket.</p>}</Card></div></div></div>;
}
