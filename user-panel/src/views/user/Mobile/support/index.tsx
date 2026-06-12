import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/views/user/Mobile/_components/Card';
import Button from '@/views/user/Mobile/_components/Button';
import Input from '@/views/user/Mobile/_components/Input';
import { createEcho } from '@/lib/echo';
import { MessageSquare, Send, Plus, Clock, CheckCircle, ExternalLink } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  replies?: Reply[];
}

interface Reply {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  readAt?: string | null;
}

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'MEDIUM' });
  const [reply, setReply] = useState('');
  const [supportLinks, setSupportLinks] = useState<{ telegramUrl?: string; whatsappUrl?: string }>({});

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchTickets();
    api.get('/support/settings').then(({ data }) => setSupportLinks(data || {})).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedTicket) return;
    const echo = createEcho();
    echo?.private(`support.ticket.${selectedTicket.id}`).listen('.support.message.created', refreshSelectedTicket);
    return () => { echo?.leave(`support.ticket.${selectedTicket.id}`); echo?.disconnect(); };
  }, [selectedTicket?.id]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/tickets');
      setTickets(response.data);
      setSelectedTicket((current) => current
        ? response.data.find((ticket: Ticket) => ticket.id === current.id) ?? current
        : current);
    } catch (err) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedTicket = async () => {
    if (!selectedTicket) return;
    await api.put(`/support/tickets/${selectedTicket.id}/read`);
    await fetchTickets();
  };

  const openTicket = async (ticket: Ticket) => {
    const { data } = await api.put(`/support/tickets/${ticket.id}/read`);
    setSelectedTicket(data);
    await fetchTickets();
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support/tickets', newTicket);
      setShowNewTicket(false);
      setNewTicket({ subject: '', message: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (err) {
      console.error('Failed to create ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/replies`, { message: reply });
      setReply('');
      fetchTickets();
    } catch (err) {
      console.error('Failed to send reply');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'RESOLVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'URGENT': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Support
            </h1>
            <p className="text-gray-400">Get help with any issues</p>
          </div>
          <Button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
        {(supportLinks.telegramUrl || supportLinks.whatsappUrl) && <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm text-gray-400">Need a quick fallback?</span>
          {supportLinks.telegramUrl && <a href={supportLinks.telegramUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm flex gap-1 items-center">Telegram <ExternalLink className="h-3 w-3" /></a>}
          {supportLinks.whatsappUrl && <a href={supportLinks.whatsappUrl} target="_blank" rel="noreferrer" className="text-green-400 text-sm flex gap-1 items-center">WhatsApp <ExternalLink className="h-3 w-3" /></a>}
        </Card>}

        {showNewTicket && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Ticket</h2>
              <Button variant="outline" size="sm" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  required
                  placeholder="Brief description of your issue"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  required
                  rows={6}
                  placeholder="Describe your issue in detail"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Ticket
              </Button>
            </form>
          </Card>
        )}

        {selectedTicket ? (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                ← Back to Tickets
              </Button>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className={`px-3 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h2>
              <p className="text-gray-400 text-sm">
                Created: {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <p className="text-gray-300">{selectedTicket.message}</p>
            </div>
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold">Replies</h3>
                {selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-lg ${reply.isAdmin ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {reply.isAdmin ? (
                        <span className="text-blue-400 text-sm font-semibold">Admin</span>
                      ) : (
                        <span className="text-gray-400 text-sm">You</span>
                      )}
                      <span className="text-gray-500 text-xs">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedTicket.status !== 'CLOSED' && (
              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Reply</label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    required
                    rows={4}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Button type="submit" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </form>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No support tickets</h3>
                <p className="text-gray-500">Create a ticket to get help with any issues</p>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="p-6 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => void openTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {!!ticket.unreadCount && <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">
                          {ticket.unreadCount} unread
                        </span>}
                      </div>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {ticket.status === 'RESOLVED' && (
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 ml-4" />
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
