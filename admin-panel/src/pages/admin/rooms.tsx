import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Lock, Unlock, Search, Filter, Eye, EyeOff, Copy, Check, 
  Trophy, Gamepad2, Calendar, Users, Save, RefreshCw, AlertCircle
} from 'lucide-react';

interface RoomDetails {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  roomId: string;
  password: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
  format: string;
  map: string;
}

export default function AdminRooms() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [editingRoom, setEditingRoom] = useState<RoomDetails | null>(null);
  const [editFormData, setEditFormData] = useState({ roomId: '', password: '' });

  useEffect(() => {
    if (!user || !['ADMIN', 'ORGANIZER'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/management/rooms');
      setRooms((data || []).map((room: any) => ({
        ...room,
        status: room.status === 'COMPLETED' ? 'EXPIRED' : room.status === 'IN_PROGRESS' ? 'ACTIVE' : 'INACTIVE',
      })));
    } catch (err) {
      console.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string) => {
    try {
      await api.patch(`/management/rooms/${roomId}`, editFormData);
      setEditingRoom(null);
      setEditFormData({ roomId: '', password: '' });
      fetchRooms();
      alert('Room details updated successfully');
    } catch (err) {
      console.error('Failed to update room');
    }
  };

  const handleRegeneratePassword = async (roomId: string) => {
    if (!confirm('Are you sure you want to regenerate the password?')) return;
    
    try {
      const newPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
      await api.patch(`/management/rooms/${roomId}`, { password: newPassword });
      fetchRooms();
      alert('Password regenerated successfully');
    } catch (err) {
      console.error('Failed to regenerate password');
    }
  };

  const togglePasswordVisibility = (roomId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const handleCopy = (text: string, roomId: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [`${roomId}-${field}`]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [`${roomId}-${field}`]: false }));
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INACTIVE': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'EXPIRED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomId.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Room Management
          </h1>
          <p className="text-gray-400">Manage tournament room IDs and passwords</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Lock className="h-4 w-4" />
              Active Rooms
            </div>
            <div className="text-3xl font-bold text-green-400">
              {rooms.filter(r => r.status === 'ACTIVE').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Unlock className="h-4 w-4" />
              Inactive Rooms
            </div>
            <div className="text-3xl font-bold text-gray-400">
              {rooms.filter(r => r.status === 'INACTIVE').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <AlertCircle className="h-4 w-4" />
              Expired Rooms
            </div>
            <div className="text-3xl font-bold text-red-400">
              {rooms.filter(r => r.status === 'EXPIRED').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Trophy className="h-4 w-4" />
              Total Rooms
            </div>
            <div className="text-3xl font-bold text-blue-400">{rooms.length}</div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tournament name or room ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </Card>

        {filteredRooms.length === 0 ? (
          <Card className="p-12 text-center">
            <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No rooms found</h3>
            <p className="text-gray-500">Adjust your filters to see more results</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(room.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">{room.tournamentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">Match #{room.matchNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="h-4 w-4 text-pink-400" />
                        <span className="text-gray-300">{room.format}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{room.map}</span>
                      </div>
                    </div>

                    {editingRoom?.id === room.id ? (
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Room ID</label>
                            <Input
                              value={editFormData.roomId}
                              onChange={(e) => setEditFormData({ ...editFormData, roomId: e.target.value })}
                              placeholder="Enter room ID"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <Input
                              value={editFormData.password}
                              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                              placeholder="Enter password"
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateRoom(room.id)}
                              className="flex-1"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingRoom(null);
                                setEditFormData({ roomId: '', password: '' });
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Room ID:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg">
                                {showPasswords[room.id] ? room.roomId : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(room.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showPasswords[room.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleCopy(room.roomId, room.id, 'roomId')}
                                className="text-gray-400 hover:text-white"
                              >
                                {copied[`${room.id}-roomId`] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Password:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg">
                                {showPasswords[room.id] ? room.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(room.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {showPasswords[room.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleCopy(room.password, room.id, 'password')}
                                className="text-gray-400 hover:text-white"
                              >
                                {copied[`${room.id}-password`] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 min-w-[200px]">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingRoom(room);
                        setEditFormData({ roomId: room.roomId, password: room.password });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRegeneratePassword(room.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    {room.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        className="w-full text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    )}
                    {room.status === 'INACTIVE' && (
                      <Button
                        variant="outline"
                        className="w-full text-green-400 border-green-400 hover:bg-green-400/10"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
