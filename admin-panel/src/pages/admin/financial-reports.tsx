import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, 
  ArrowDownRight, PieChart, BarChart3, Search, Filter, Eye, Edit, 
  Plus, CheckCircle, XCircle, AlertCircle, User, Download, RefreshCw, Save
} from 'lucide-react';

interface Wallet {
  id: string;
  userId: string;
  username: string;
  email: string;
  mainWallet: number;
  winningWallet: number;
  referralWallet: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  status: 'ACTIVE' | 'FROZEN' | 'BANNED';
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EARNING' | 'REFERRAL' | 'ENTRY_FEE';
  amount: number;
  walletType: 'main' | 'winning' | 'referral';
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  date: string;
  description: string;
}

export default function FinancialReports() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [editBalance, setEditBalance] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchFinancialData();
  }, [user, timeRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummyWallets: Wallet[] = [
        { 
          id: '1', userId: 'user1', username: 'PlayerOne', email: 'player1@example.com',
          mainWallet: 500, winningWallet: 1250, referralWallet: 200, totalBalance: 1950,
          totalDeposits: 1000, totalWithdrawals: 500, status: 'ACTIVE'
        },
        { 
          id: '2', userId: 'user2', username: 'ProGamer', email: 'progamer@example.com',
          mainWallet: 250, winningWallet: 800, referralWallet: 150, totalBalance: 1200,
          totalDeposits: 500, totalWithdrawals: 250, status: 'ACTIVE'
        },
        { 
          id: '3', userId: 'user3', username: 'SniperKing', email: 'sniper@example.com',
          mainWallet: 100, winningWallet: 500, referralWallet: 50, totalBalance: 650,
          totalDeposits: 200, totalWithdrawals: 100, status: 'ACTIVE'
        },
        { 
          id: '4', userId: 'user4', username: 'MedicMain', email: 'medic@example.com',
          mainWallet: 0, winningWallet: 0, referralWallet: 0, totalBalance: 0,
          totalDeposits: 0, totalWithdrawals: 0, status: 'FROZEN'
        }
      ];
      
      const dummyTransactions: Transaction[] = [
        { 
          id: '1', userId: 'user1', username: 'PlayerOne', type: 'DEPOSIT', amount: 500,
          walletType: 'main', status: 'COMPLETED', date: '2024-05-30T10:00:00Z',
          description: 'Deposit via bKash'
        },
        { 
          id: '2', userId: 'user1', username: 'PlayerOne', type: 'EARNING', amount: 150,
          walletType: 'winning', status: 'COMPLETED', date: '2024-05-29T15:00:00Z',
          description: 'Tournament Prize - Weekly Cup'
        },
        { 
          id: '3', userId: 'user2', username: 'ProGamer', type: 'WITHDRAWAL', amount: -200,
          walletType: 'main', status: 'PENDING', date: '2024-05-28T12:00:00Z',
          description: 'Withdrawal to bKash'
        },
        { 
          id: '4', userId: 'user3', username: 'SniperKing', type: 'REFERRAL', amount: 50,
          walletType: 'referral', status: 'COMPLETED', date: '2024-05-27T09:00:00Z',
          description: 'Referral Bonus'
        },
        { 
          id: '5', userId: 'user1', username: 'PlayerOne', type: 'ENTRY_FEE', amount: -50,
          walletType: 'main', status: 'COMPLETED', date: '2024-05-26T20:00:00Z',
          description: 'Tournament Entry - Pro League'
        }
      ];
      
      setWallets(dummyWallets);
      setTransactions(dummyTransactions);
    } catch (err) {
      console.error('Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!selectedWallet || !editBalance) return;
    
    try {
      await api.patch(`/admin/wallets/${selectedWallet.id}`, { balance: parseFloat(editBalance) });
      setShowWalletModal(false);
      setEditBalance('');
      setSelectedWallet(null);
      fetchFinancialData();
      alert('Wallet balance updated successfully');
    } catch (err) {
      console.error('Failed to update wallet');
    }
  };

  const handleFreezeWallet = async (walletId: string) => {
    try {
      await api.patch(`/admin/wallets/${walletId}`, { status: 'FROZEN' });
      fetchFinancialData();
      alert('Wallet frozen successfully');
    } catch (err) {
      console.error('Failed to freeze wallet');
    }
  };

  const handleUnfreezeWallet = async (walletId: string) => {
    try {
      await api.patch(`/admin/wallets/${walletId}`, { status: 'ACTIVE' });
      fetchFinancialData();
      alert('Wallet unfrozen successfully');
    } catch (err) {
      console.error('Failed to unfreeze wallet');
    }
  };

  const totalRevenue = wallets.reduce((sum, w) => sum + w.totalDeposits, 0);
  const totalWithdrawals = wallets.reduce((sum, w) => sum + w.totalWithdrawals, 0);
  const netProfit = totalRevenue - totalWithdrawals;
  const activeWallets = wallets.filter(w => w.status === 'ACTIVE').length;

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = 
      wallet.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wallet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Financial Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Wallet Management
          </h1>
          <p className="text-gray-400">Manage user wallets and financial transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </div>
            <div className="text-3xl font-bold text-green-400">৳{totalRevenue.toLocaleString()}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingDown className="h-4 w-4" />
              Total Withdrawals
            </div>
            <div className="text-3xl font-bold text-red-400">৳{totalWithdrawals.toLocaleString()}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wallet className="h-4 w-4" />
              Net Profit
            </div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ৳{netProfit.toLocaleString()}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <User className="h-4 w-4" />
              Active Wallets
            </div>
            <div className="text-3xl font-bold text-blue-400">{activeWallets}</div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
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
                <option value="FROZEN">Frozen</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-yellow-400" />
            User Wallets
          </h2>
          {filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No wallets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Main</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Winning</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Referral</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-gray-800">
                      <td className="px-4 py-4">
                        <div className="font-semibold">{wallet.username}</div>
                        <div className="text-sm text-gray-400">{wallet.email}</div>
                      </td>
                      <td className="px-4 py-4 text-blue-400">৳{wallet.mainWallet}</td>
                      <td className="px-4 py-4 text-yellow-400">৳{wallet.winningWallet}</td>
                      <td className="px-4 py-4 text-purple-400">৳{wallet.referralWallet}</td>
                      <td className="px-4 py-4 font-bold text-green-400">৳{wallet.totalBalance}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          wallet.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          wallet.status === 'FROZEN' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {wallet.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setEditBalance(wallet.totalBalance.toString());
                              setShowWalletModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {wallet.status === 'ACTIVE' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 border-blue-400"
                              onClick={() => handleFreezeWallet(wallet.id)}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-400 border-green-400"
                              onClick={() => handleUnfreezeWallet(wallet.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'DEPOSIT' || transaction.type === 'EARNING' || transaction.type === 'REFERRAL'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'DEPOSIT' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-400" />
                    ) : transaction.type === 'WITHDRAWAL' ? (
                      <ArrowDownRight className="h-5 w-5 text-red-400" />
                    ) : transaction.type === 'EARNING' ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <Wallet className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.username}</div>
                    <div className="text-sm text-gray-400">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}৳{transaction.amount}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    transaction.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Update Wallet Balance</h2>
                <Button variant="outline" size="sm" onClick={() => setShowWalletModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                  <div className="text-gray-400">{selectedWallet?.username}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Balance (৳)</label>
                  <Input
                    type="number"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    placeholder="Enter new balance"
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleUpdateWallet}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Balance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWalletModal(false);
                      setEditBalance('');
                      setSelectedWallet(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
