import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/auth';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  tier: string;
  packages: string[];
  socialLinks: Record<string, string>;
  isActive: boolean;
}

export default function SponsorManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    tier: 'BRONZE',
    packages: [] as string[],
    socialLinks: {} as Record<string, string>,
  });
  const [packageInput, setPackageInput] = useState('');
  const [socialKey, setSocialKey] = useState('');
  const [socialValue, setSocialValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchSponsors();
  }, [user]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sponsors');
      setSponsors(response.data);
    } catch (err) {
      console.error('Failed to fetch sponsors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = () => {
    if (packageInput.trim()) {
      setFormData({ ...formData, packages: [...formData.packages, packageInput.trim()] });
      setPackageInput('');
    }
  };

  const handleRemovePackage = (index: number) => {
    setFormData({ ...formData, packages: formData.packages.filter((_, i) => i !== index) });
  };

  const handleAddSocialLink = () => {
    if (socialKey.trim() && socialValue.trim()) {
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey.trim()]: socialValue.trim() },
      });
      setSocialKey('');
      setSocialValue('');
    }
  };

  const handleRemoveSocialLink = (key: string) => {
    const newLinks = { ...formData.socialLinks };
    delete newLinks[key];
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSponsor) {
        await api.put(`/sponsors/${editingSponsor.id}`, formData);
        alert('Sponsor updated successfully!');
      } else {
        await api.post('/sponsors', formData);
        alert('Sponsor created successfully!');
      }
      setShowCreateForm(false);
      setEditingSponsor(null);
      setFormData({
        name: '',
        logo: '',
        website: '',
        tier: 'BRONZE',
        packages: [],
        socialLinks: {},
      });
      fetchSponsors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save sponsor');
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo || '',
      website: sponsor.website || '',
      tier: sponsor.tier,
      packages: sponsor.packages || [],
      socialLinks: sponsor.socialLinks || {},
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (sponsorId: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;
    
    try {
      await api.delete(`/sponsors/${sponsorId}`);
      fetchSponsors();
      alert('Sponsor deleted successfully');
    } catch (err) {
      alert('Failed to delete sponsor');
    }
  };

  const handleToggleActive = async (sponsorId: string, isActive: boolean) => {
    try {
      await api.put(`/sponsors/${sponsorId}`, { isActive: !isActive });
      fetchSponsors();
    } catch (err) {
      alert('Failed to update sponsor status');
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
          <h1 className="text-3xl font-bold">Sponsor Management</h1>
          <Button onClick={() => setShowCreateForm(true)}>Add Sponsor</Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingSponsor ? 'Edit Sponsor' : 'Create Sponsor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tier *</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <Input
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Packages</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={packageInput}
                    onChange={(e) => setPackageInput(e.target.value)}
                    placeholder="Add a package"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPackage())}
                  />
                  <Button type="button" onClick={handleAddPackage}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.packages.map((pkg, index) => (
                    <span key={index} className="bg-gray-800 px-3 py-1 rounded-full flex items-center space-x-2">
                      <span>{pkg}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Social Links</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={socialKey}
                    onChange={(e) => setSocialKey(e.target.value)}
                    placeholder="Platform (e.g., twitter)"
                  />
                  <Input
                    value={socialValue}
                    onChange={(e) => setSocialValue(e.target.value)}
                    placeholder="URL"
                  />
                  <Button type="button" onClick={handleAddSocialLink}>Add</Button>
                </div>
                <div className="space-y-1">
                  {Object.entries(formData.socialLinks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span>{key}: {value}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit">
                  {editingSponsor ? 'Update Sponsor' : 'Create Sponsor'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSponsor(null);
                    setFormData({
                      name: '',
                      logo: '',
                      website: '',
                      tier: 'BRONZE',
                      packages: [],
                      socialLinks: {},
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                {sponsor.logo && (
                  <img src={sponsor.logo} alt={sponsor.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <span className={`px-2 py-1 rounded text-xs ${
                  sponsor.tier === 'PLATINUM' ? 'bg-purple-500' :
                  sponsor.tier === 'GOLD' ? 'bg-yellow-500' :
                  sponsor.tier === 'SILVER' ? 'bg-gray-400' :
                  'bg-orange-600'
                }`}>
                  {sponsor.tier}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{sponsor.name}</h3>
              {sponsor.website && (
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-2 block">
                  {sponsor.website}
                </a>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {sponsor.packages.map((pkg, index) => (
                  <span key={index} className="bg-gray-800 px-2 py-1 rounded text-xs">
                    {pkg}
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(sponsor)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(sponsor.id, sponsor.isActive)}
                  className={sponsor.isActive ? 'text-yellow-400 border-yellow-400' : 'text-green-400 border-green-400'}
                >
                  {sponsor.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(sponsor.id)}
                  className="text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
