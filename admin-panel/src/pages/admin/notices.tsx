import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/auth';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Edit, Trash2, Eye, EyeOff, Pin, PinOff, AlertTriangle, Info, Bell, AlertCircle } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'MAINTENANCE' | 'ANNOUNCEMENT' | 'WARNING';
  isActive: boolean;
  isPinned: boolean;
  startDate?: string;
  endDate?: string;
  showOnDashboard: boolean;
  showOnTournaments: boolean;
  showOnWallet: boolean;
  targetRoles?: string[];
  createdAt: string;
}

type NoticeType = Notice['type'];

interface NoticeFormData {
  title: string;
  content: string;
  type: NoticeType;
  isActive: boolean;
  isPinned: boolean;
  startDate: string;
  endDate: string;
  showOnDashboard: boolean;
  showOnTournaments: boolean;
  showOnWallet: boolean;
  targetRoles: string[];
}

export default function NoticeManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    type: 'GENERAL',
    isActive: true,
    isPinned: false,
    startDate: '',
    endDate: '',
    showOnDashboard: true,
    showOnTournaments: false,
    showOnWallet: false,
    targetRoles: [] as string[],
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchNotices();
  }, [user]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notices');
      setNotices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/notices', formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        isActive: true,
        isPinned: false,
        startDate: '',
        endDate: '',
        showOnDashboard: true,
        showOnTournaments: false,
        showOnWallet: false,
        targetRoles: [],
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to create notice');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice) return;
    try {
      await api.put(`/notices/${selectedNotice.id}`, formData);
      setShowEditModal(false);
      setSelectedNotice(null);
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        isActive: true,
        isPinned: false,
        startDate: '',
        endDate: '',
        showOnDashboard: true,
        showOnTournaments: false,
        showOnWallet: false,
        targetRoles: [],
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to update notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.put(`/notices/${id}/toggle`);
      fetchNotices();
    } catch (err) {
      alert('Failed to toggle notice');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.put(`/notices/${id}/pin`);
      fetchNotices();
    } catch (err) {
      alert('Failed to toggle pin');
    }
  };

  const openEditModal = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      isActive: notice.isActive,
      isPinned: notice.isPinned,
      startDate: notice.startDate || '',
      endDate: notice.endDate || '',
      showOnDashboard: notice.showOnDashboard,
      showOnTournaments: notice.showOnTournaments,
      showOnWallet: notice.showOnWallet,
      targetRoles: notice.targetRoles || [],
    });
    setShowEditModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return <AlertTriangle className="h-4 w-4" />;
      case 'ANNOUNCEMENT': return <Bell className="h-4 w-4" />;
      case 'WARNING': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ANNOUNCEMENT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WARNING': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notice Management</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {notice.isPinned && <Pin className="h-5 w-5 text-yellow-400" />}
                    <h3 className="font-bold text-lg">{notice.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(notice.type)}`}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(notice.type)}
                        {notice.type}
                      </span>
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      notice.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notice.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{notice.content}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {notice.showOnDashboard && <span className="bg-gray-800 px-2 py-1 rounded">Dashboard</span>}
                    {notice.showOnTournaments && <span className="bg-gray-800 px-2 py-1 rounded">Tournaments</span>}
                    {notice.showOnWallet && <span className="bg-gray-800 px-2 py-1 rounded">Wallet</span>}
                    {notice.startDate && <span className="bg-gray-800 px-2 py-1 rounded">From: {new Date(notice.startDate).toLocaleDateString()}</span>}
                    {notice.endDate && <span className="bg-gray-800 px-2 py-1 rounded">Until: {new Date(notice.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePin(notice.id)}
                  >
                    {notice.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(notice.id)}
                  >
                    {notice.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(notice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(notice.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {notices.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No notices found</h3>
            <p className="text-gray-500">Create your first notice to get started</p>
          </Card>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Notice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="WARNING">Warning</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Locations</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnDashboard}
                    onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Dashboard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnTournaments}
                    onChange={(e) => setFormData({ ...formData, showOnTournaments: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Tournaments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnWallet}
                    onChange={(e) => setFormData({ ...formData, showOnWallet: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Wallet</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pinned</span>
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Notice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Notice</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="WARNING">Warning</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Locations</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnDashboard}
                    onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Dashboard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnTournaments}
                    onChange={(e) => setFormData({ ...formData, showOnTournaments: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Tournaments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnWallet}
                    onChange={(e) => setFormData({ ...formData, showOnWallet: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Wallet</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pinned</span>
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Update Notice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedNotice(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
