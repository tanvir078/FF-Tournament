import Head from 'next/head';
import { useState } from 'react';
import { UserPlus, User, Lock, Mail, Phone, Gamepad2, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { startSocialAuth, SocialProvider } from '@/lib/socialAuth';
import Input from '@/views/user/Mobile/_components/Input';
import Button from '@/views/user/Mobile/_components/Button';
import Card from '@/views/user/Mobile/_components/Card';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    uid: '',
    ign: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | ''>('');

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      router.push('/user/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: SocialProvider) => {
    try {
      setError('');
      setSocialLoading(provider);
      await startSocialAuth(provider);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `${provider} signup failed`);
      setSocialLoading('');
    }
  };

  return (
    <>
      <Head>
        <title>Register - FF Tournament</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Gamepad2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-400">Join thousands of players and start competing</p>
          </div>

          <Card className="p-8">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="pl-10"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-10"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="pl-10"
                    placeholder="+8801XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="uid" className="block text-sm font-medium text-gray-300 mb-2">
                    FF UID
                  </label>
                  <Input
                    id="uid"
                    name="uid"
                    type="text"
                    placeholder="12345678"
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="ign" className="block text-sm font-medium text-gray-300 mb-2">
                    IGN
                  </label>
                  <Input
                    id="ign"
                    name="ign"
                    type="text"
                    placeholder="Your IGN"
                    value={formData.ign}
                    onChange={(e) => setFormData({ ...formData, ign: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            passwordStrength >= level
                              ? level <= 2
                                ? 'bg-red-500'
                                : level <= 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {passwordStrength <= 2 && 'Weak password'}
                      {passwordStrength === 3 && 'Fair password'}
                      {passwordStrength === 4 && 'Good password'}
                      {passwordStrength === 5 && 'Strong password'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800 mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {(['google', 'facebook', 'linkedin'] as SocialProvider[]).map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleSocialSignup(provider)}
                    disabled={Boolean(socialLoading)}
                    className="flex items-center justify-center rounded-lg border border-gray-700 px-3 py-2 text-sm font-bold capitalize transition hover:bg-gray-700 disabled:opacity-60"
                  >
                    {socialLoading === provider ? '...' : provider}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-gray-400">
              Already have an account?{' '}
              <Link href="/user/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
                <ArrowRight className="inline h-4 w-4 ml-1" />
              </Link>
            </p>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              By creating an account, you'll get access to:
            </p>
            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Tournaments</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Prizes</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
