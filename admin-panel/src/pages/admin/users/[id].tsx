import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../store/auth';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  stats?: {
    totalMatches: number;
    totalWins: number;
    totalKills: number;
    totalPoints: number;
  };
}

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'PLAYER',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    if (id) {
      fetchUser();
    }
  }, [currentUser, id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        role: response.data.role || 'PLAYER',
      });
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.put(`/admin/users/${id}`, formData);
      setEditing(false);
      fetchUser();
      alert('User updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleBan = async () => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    
    try {
      await api.put(`/admin/users/${id}/ban`);
      fetchUser();
      alert('User banned successfully');
    } catch (err) {
      alert('Failed to ban user');
    }
  };

  const handleUnban = async () => {
    if (!confirm('Are you sure you want to unban this user?')) return;
    
    try {
      await api.put(`/admin/users/${id}/unban`);
      fetchUser();
      alert('User unbanned successfully');
    } catch (err) {
      alert('Failed to unban user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Details</h1>
          <Button variant="outline" onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Profile Information</h2>
                {!editing ? (
                  <Button onClick={() => setEditing(true)}>Edit</Button>
                ) : (
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Name</label>
                    <div className="text-lg">{user.name}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <div className="text-lg">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Role</label>
                    <div className="text-lg">{user.role}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <div className={`text-lg ${user.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Joined</label>
                    <div className="text-lg">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="PLAYER">Player</option>
                      <option value="CAPTAIN">Captain</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              )}
            </Card>

            {user.stats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Matches</div>
                    <div className="text-2xl font-bold">{user.stats.totalMatches}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Wins</div>
                    <div className="text-2xl font-bold text-green-400">{user.stats.totalWins}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Kills</div>
                    <div className="text-2xl font-bold">{user.stats.totalKills}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Points</div>
                    <div className="text-2xl font-bold text-yellow-400">{user.stats.totalPoints}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Account Actions</h2>
              <div className="space-y-3">
                {user.isBanned ? (
                  <Button className="w-full" onClick={handleUnban}>
                    Unban User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                    onClick={handleBan}
                  >
                    Ban User
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/users/${id}/wallet`)}>
                  View Wallet
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/users/${id}/team`)}>
                  View Team
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
