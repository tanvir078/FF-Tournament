import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Trophy, Users, Gamepad2, Play, ArrowRight, Star, Clock, DollarSign, Flame, Zap, Shield, TrendingUp, Award, Calendar, Target, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

interface Tournament {
  id: string;
  title: string;
  format: string;
  status: string;
  entryFee: number;
  prizePool: number;
  registeredTeams: number;
  maxTeams: number;
  startDate: string;
  description?: string;
  isFree?: boolean;
}

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'MAINTENANCE' | 'ANNOUNCEMENT' | 'WARNING';
  isActive: boolean;
  isPinned: boolean;
}

function asArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    fetchTournaments();
    fetchBanners();
    fetchNotices();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/tournaments`);
      const data = await response.json();
      setTournaments(asArray<Tournament>(data));
    } catch (err) {
      console.error('Failed to fetch tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/banners/active`);
      const data = await response.json();
      setBanners(asArray<Banner>(data));
    } catch (err) {
      console.error('Failed to fetch banners');
      setBanners([]);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/notices/active`);
      const data = await response.json();
      setNotices(asArray<Notice>(data));
    } catch (err) {
      console.error('Failed to fetch notices');
      setNotices([]);
    }
  };

  const featuredTournaments = tournaments.filter(t => t.status === 'REGISTRATION_OPEN').slice(0, 3);

  const handleJoinTournament = (tournamentId: string) => {
    if (user) {
      router.push(`/user/tournaments/${tournamentId}`);
    } else {
      router.push('/user/login');
    }
  };

  const getNoticeColor = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'ANNOUNCEMENT': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'WARNING': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden h-64 md:h-96">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                {banner.description && (
                  <p className="text-gray-300 text-sm md:text-base mb-4">{banner.description}</p>
                )}
                {banner.linkUrl && (
                  <Button onClick={() => window.open(banner.linkUrl, '_blank')}>
                    Learn More
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notices Bar */}
      {notices.length > 0 && (
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
            <div className="flex gap-4">
              {notices.filter(n => n.isPinned || n.type === 'ANNOUNCEMENT').slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${getNoticeColor(notice.type)}`}
                >
                  {notice.isPinned && <Star className="h-3 w-3 fill-current" />}
                  <span className="font-medium">{notice.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6 animate-bounce">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/50">
                <Gamepad2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                Bangladesh's #1 Tournament Platform
              </span>
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              FF Tournament
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate Free Fire tournament platform. Compete with the best, win exciting prizes, and become a champion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => user ? router.push('/user/tournaments') : router.push('/user/register')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 transition-all"
              >
                <Play className="h-5 w-5" />
                {user ? 'Browse Tournaments' : 'Get Started Free'}
              </Button>
              <Button 
                onClick={() => router.push('/user/tournaments')}
                variant="outline"
                className="flex items-center gap-2 text-lg px-8 py-4 border-2 border-purple-500/50 hover:border-purple-500 transition-all"
              >
                <Trophy className="h-5 w-5" />
                View Tournaments
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: 'Active Players', value: '10K+', color: 'from-blue-500 to-cyan-500' },
            { icon: Trophy, label: 'Tournaments', value: '500+', color: 'from-yellow-500 to-orange-500' },
            { icon: DollarSign, label: 'Prize Pool', value: '৳50K+', color: 'from-green-500 to-emerald-500' },
            { icon: Flame, label: 'Daily Matches', value: '100+', color: 'from-red-500 to-pink-500' },
          ].map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600">
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg mx-auto mb-3 w-fit`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Tournaments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-8 w-8 text-yellow-400" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Featured Tournaments
            </h2>
            <Award className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-lg">Join the most exciting competitions and win big</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-xl">Loading tournaments...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTournaments.map((tournament) => (
              <Card key={tournament.id} className="overflow-hidden hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-purple-500/50 group">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">Featured</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{tournament.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">{tournament.format}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">
                        {tournament.isFree ? (
                          <span className="text-green-400 font-semibold">FREE</span>
                        ) : (
                          <span>Entry: ৳{tournament.entryFee}</span>
                        )}
                        <span className="mx-2">|</span>
                        <span className="text-purple-400">Prize: ৳{tournament.prizePool}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">{tournament.registeredTeams}/{tournament.maxTeams} Teams</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` }}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => handleJoinTournament(tournament.id)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                  >
                    {user ? 'Join Tournament' : 'Register to Join'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            onClick={() => router.push('/user/tournaments')}
            variant="outline"
            className="flex items-center gap-2 mx-auto px-8 py-3 border-2 border-purple-500/50 hover:border-purple-500"
          >
            View All Tournaments
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-gray-400 text-lg">Experience the best tournament platform in Bangladesh</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Fast Matchmaking', description: 'Quick and efficient team matching system', color: 'from-yellow-500 to-orange-500' },
            { icon: Trophy, title: 'Big Prizes', description: 'Compete for massive prize pools', color: 'from-purple-500 to-pink-500' },
            { icon: Shield, title: 'Fair Play', description: 'Anti-cheat system for fair competition', color: 'from-blue-500 to-cyan-500' },
            { icon: Users, title: 'Community', description: 'Join thousands of active players', color: 'from-green-500 to-emerald-500' },
            { icon: DollarSign, title: 'Secure Payments', description: 'Safe and instant prize withdrawals', color: 'from-yellow-500 to-green-500' },
            { icon: Star, title: 'Pro Features', description: 'Advanced analytics and stats tracking', color: 'from-red-500 to-pink-500' },
          ].map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 group">
              <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-lg mx-auto mb-4 w-fit group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Ready to Compete?
              </h2>
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of players in exciting tournaments and win big prizes. Your journey to becoming a champion starts here.
            </p>
            <Button 
              onClick={() => user ? router.push('/user/tournaments') : router.push('/user/register')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 mx-auto shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 transition-all"
            >
              <Play className="h-5 w-5" />
              {user ? 'Join Tournament Now' : 'Create Account Free'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">FF Tournament</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 FF Tournament. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
