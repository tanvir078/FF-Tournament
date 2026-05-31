import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Users, Shield, Ban, ShieldCheck, Search, Calendar, Mail, MoreVertical, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  avatar?: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data || [
        {
          id: '1',
          email: 'admin@fftournament.com',
          username: 'admin',
          role: 'ADMIN',
          isBanned: false,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          email: 'player1@gmail.com',
          username: 'pro_gamer_2024',
          role: 'USER',
          isBanned: false,
          createdAt: '2024-03-20',
        },
        {
          id: '3',
          email: 'cheater@bad.com',
          username: 'suspicious_player',
          role: 'USER',
          isBanned: true,
          createdAt: '2024-04-10',
        },
        {
          id: '4',
          email: 'team_captain@esports.com',
          username: 'team_leader_x',
          role: 'USER',
          isBanned: false,
          createdAt: '2024-05-01',
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/ban`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/unban`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to unban user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'MODERATOR': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || userItem.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Manage Users
            </h1>
            <p className="text-gray-400">View and manage user accounts</p>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userItem) => (
            <Card key={userItem.id} className="p-6 hover:scale-105 transition-transform duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{userItem.username}</h3>
                    <p className="text-gray-400 text-sm">{userItem.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                  {userItem.role}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">{userItem.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Joined {new Date(userItem.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {userItem.isBanned ? (
                    <>
                      <UserX className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">Banned</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Active</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/admin/users/${userItem.id}`)}
                >
                  <MoreVertical className="h-4 w-4 mr-1" />
                  Details
                </Button>
                {userItem.isBanned ? (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUnbanUser(userItem.id)}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Unban
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                    onClick={() => handleBanUser(userItem.id)}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Ban
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
}
