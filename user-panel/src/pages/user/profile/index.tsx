import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../store/auth';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setLoading(false);
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      setAuth(response.data, localStorage.getItem('token') || '');
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/user/login');
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
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

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
                    <div className="text-lg">{user?.name}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <div className="text-lg">{user?.email}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Role</label>
                    <div className="text-lg">{user?.role}</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                  <Button type="submit">Save Changes</Button>
                </form>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              
              {!showPasswordForm ? (
                <Button onClick={() => setShowPasswordForm(true)}>Change Password</Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit">Update Password</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Account Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => router.push('/user/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/user/teams/manage')}>
                  Manage Team
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/user/wallet')}>
                  View Wallet
                </Button>
                <Button variant="outline" className="w-full text-red-400 border-red-400 hover:bg-red-400/10" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
