import {
  FileText,
  Gamepad2,
  HelpCircle,
  Home,
  MessageCircle,
  Settings,
  Swords,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Joystick,
} from 'lucide-react';

export const userNavItems = [
  { label: 'Dashboard', icon: Home, path: '/user/dashboard' },
  { label: 'Tournaments', icon: Trophy, path: '/user/tournaments' },
  { label: 'Matches', icon: Gamepad2, path: '/user/matches' },
  { label: 'Teams', icon: Users, path: '/user/teams' },
  { label: 'Game Profiles', icon: Joystick, path: '/user/game-profiles' },
  { label: 'Challenges', icon: Swords, path: '/user/challenges' },
  { label: 'Leaderboard', icon: TrendingUp, path: '/user/leaderboard' },
  { label: 'Messages', icon: MessageCircle, path: '/user/chat' },
  { label: 'Wallet', icon: Wallet, path: '/user/wallet' },
  { label: 'Rules', icon: FileText, path: '/user/rules' },
  { label: 'Support', icon: HelpCircle, path: '/user/support' },
  { label: 'Settings', icon: Settings, path:'/user/profile' },
];
