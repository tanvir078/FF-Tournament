import Head from 'next/head';
import Link from 'next/link';
import { Trophy, Users, Target, Calendar, ArrowRight, Gamepad2 } from 'lucide-react';
import Button from '@/views/user/Mobile/_components/Button';

export default function Home() {
  return (
    <>
      <Head>
        <title>FF Tournament Manager - Enterprise Esports Platform</title>
        <meta name="description" content="Professional Free Fire tournament management platform" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Gamepad2 className="h-20 w-20 text-primary-500 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Enterprise Esports Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete tournament management system with room automation, live leaderboard, 
              anti-cheat, analytics, and multi-channel notifications.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/tournaments">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>View Tournaments</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Enterprise Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-xl">
              <Trophy className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Tournament Management</h3>
              <p className="text-gray-300">Create tournaments with multiple stages (Qualifier → Final), auto-qualification system, and prize distribution.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <Users className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Team & Player Management</h3>
              <p className="text-gray-300">Complete team registration, player invite system, UID verification, and statistics tracking.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <Target className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Room Management</h3>
              <p className="text-gray-300">Auto room creation, password generation, slot assignment, and multi-channel notifications.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <Trophy className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Live Leaderboard</h3>
              <p className="text-gray-300">Real-time scoring formula, automatic point calculation, tiebreaker system, and live updates.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <Users className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Wallet System</h3>
              <p className="text-gray-300">Integrated payment gateways (bKash, Nagad, Stripe), transaction history, and prize distribution.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <Calendar className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
              <p className="text-gray-300">Push notifications, email, SMS, Discord webhook, and Telegram bot integration.</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">User Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-white mb-2">Player</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Team Join/Create</li>
                <li>• Tournament Registration</li>
                <li>• Match Schedule</li>
                <li>• Wallet Management</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-white mb-2">Team Captain</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Team Management</li>
                <li>• Player Invite</li>
                <li>• UID Submission</li>
                <li>• Room Access</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-white mb-2">Organizer</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Create Tournaments</li>
                <li>• Room Management</li>
                <li>• Result Entry</li>
                <li>• Prize Distribution</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-white mb-2">Admin</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• User Management</li>
                <li>• Financial Reports</li>
                <li>• Platform Analytics</li>
                <li>• System Settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
