import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Building2, TrendingUp, Users, Award, Plus, Search, ExternalLink } from 'lucide-react';
import Button from '@/views/user/Desktop/_components/Button';
import Card from '@/views/user/Desktop/_components/Card';
import Input from '@/views/user/Desktop/_components/Input';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  sponsoredTournaments: number;
  totalPrizePool: number;
  createdAt: string;
}

export default function SponsorsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [application, setApplication] = useState({
    companyName: '',
    website: '',
    description: '',
    tier: 'SILVER',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sponsors/apply', application);
      setShowApplyModal(false);
      setApplication({ companyName: '', website: '', description: '', tier: 'SILVER' });
      alert('Application submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'from-gray-300 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'SILVER': return 'from-gray-400 to-gray-600';
      case 'BRONZE': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-gray-300/20 text-gray-300 border-gray-300/30';
      case 'GOLD': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'SILVER': return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      case 'BRONZE': return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      default: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-xl text-white">Loading sponsors...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sponsors - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Sponsors</h1>
              <p className="text-gray-400">Our partners who make tournaments possible</p>
            </div>
            <Button onClick={() => setShowApplyModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Become a Sponsor
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search sponsors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSponsors.map((sponsor) => (
              <Card key={sponsor.id} className="p-6 hover:border-primary-500 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold border ${getTierBadge(sponsor.tier)}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{sponsor.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sponsor.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-500">{sponsor.sponsoredTournaments}</p>
                    <p className="text-xs text-gray-400">Tournaments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-500">৳{sponsor.totalPrizePool.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Prize Pool</p>
                  </div>
                </div>
                {sponsor.website && (
                  <Button variant="outline" className="w-full" onClick={() => window.open(sponsor.website, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {filteredSponsors.length === 0 && (
            <Card className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No sponsors found</h3>
              <p className="text-gray-500">Be the first to sponsor our tournaments!</p>
            </Card>
          )}
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Become a Sponsor</h2>
              <Button variant="outline" size="sm" onClick={() => setShowApplyModal(false)}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <Input
                  value={application.companyName}
                  onChange={(e) => setApplication({ ...application, companyName: e.target.value })}
                  required
                  placeholder="Enter company name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                <Input
                  value={application.website}
                  onChange={(e) => setApplication({ ...application, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sponsorship Tier</label>
                <select
                  value={application.tier}
                  onChange={(e) => setApplication({ ...application, tier: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="BRONZE">Bronze - ৳5,000+</option>
                  <option value="SILVER">Silver - ৳10,000+</option>
                  <option value="GOLD">Gold - ৳25,000+</option>
                  <option value="PLATINUM">Platinum - ৳50,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={application.description}
                  onChange={(e) => setApplication({ ...application, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Tell us about your company and why you want to sponsor"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
