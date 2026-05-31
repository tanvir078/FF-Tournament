import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/auth';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function BannerManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    order: 0,
    startDate: '',
    endDate: '',
    isFeatured: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchBanners();
  }, [user]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/banners');
      setBanners(response.data || []);
    } catch (err) {
      console.error('Failed to fetch banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/banners', formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        order: 0,
        startDate: '',
        endDate: '',
        isFeatured: false,
      });
      fetchBanners();
    } catch (err) {
      alert('Failed to create banner');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;
    try {
      await api.put(`/banners/${selectedBanner.id}`, formData);
      setShowEditModal(false);
      setSelectedBanner(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        order: 0,
        startDate: '',
        endDate: '',
        isFeatured: false,
      });
      fetchBanners();
    } catch (err) {
      alert('Failed to update banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.put(`/banners/${id}/toggle`);
      fetchBanners();
    } catch (err) {
      alert('Failed to toggle banner');
    }
  };

  const handleMoveUp = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}/order`, { order: banner.order - 1 });
      fetchBanners();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  const handleMoveDown = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}/order`, { order: banner.order + 1 });
      fetchBanners();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  const openEditModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      isActive: banner.isActive,
      order: banner.order,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
      isFeatured: banner.isFeatured,
    });
    setShowEditModal(true);
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
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-800">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-600" />
                  </div>
                )}
                {banner.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    banner.isActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{banner.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Order: {banner.order}</span>
                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Link
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveUp(banner)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveDown(banner)}
                    disabled={index === banners.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(banner.id)}
                  >
                    {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No banners found</h3>
            <p className="text-gray-500">Create your first banner to get started</p>
          </Card>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Banner</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Link URL (optional)</label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
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
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Banner
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

      {showEditModal && selectedBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Banner</h2>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Link URL (optional)</label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
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
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Update Banner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBanner(null);
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
