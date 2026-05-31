import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, History, 
  TrendingUp, Gift, CreditCard, Banknote, Clock, 
  CheckCircle, XCircle, AlertCircle, Filter, Copy, Upload
} from 'lucide-react';

interface WalletBalance {
  mainWallet: number;
  winningWallet: number;
  referralWallet: number;
  totalBalance: number;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'EARNING' | 'REFERRAL' | 'ENTRY_FEE';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'PROCESSING';
  description: string;
  walletType: 'main' | 'winning' | 'referral';
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [amount, setAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bkash');
  const [depositTransactionId, setDepositTransactionId] = useState('');
  const [depositScreenshot, setDepositScreenshot] = useState<File | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const MIN_WITHDRAW = 100;
  const WITHDRAW_CHARGE = 10;

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummyWallet: WalletBalance = {
        mainWallet: 500,
        winningWallet: 1250,
        referralWallet: 200,
        totalBalance: 1950
      };
      
      const dummyTransactions: Transaction[] = [
        {
          id: '1',
          type: 'EARNING',
          amount: 150,
          status: 'COMPLETED',
          description: 'Tournament Prize - Weekly Cup',
          walletType: 'winning',
          createdAt: '2024-05-28T10:30:00Z'
        },
        {
          id: '2',
          type: 'DEPOSIT',
          amount: 500,
          status: 'COMPLETED',
          description: 'Deposit via bKash',
          walletType: 'main',
          createdAt: '2024-05-27T15:45:00Z'
        },
        {
          id: '3',
          type: 'ENTRY_FEE',
          amount: -100,
          status: 'COMPLETED',
          description: 'Tournament Entry - Pro League',
          walletType: 'main',
          createdAt: '2024-05-26T20:00:00Z'
        },
        {
          id: '4',
          type: 'REFERRAL',
          amount: 50,
          status: 'COMPLETED',
          description: 'Referral Bonus - User joined',
          walletType: 'referral',
          createdAt: '2024-05-25T12:00:00Z'
        },
        {
          id: '5',
          type: 'WITHDRAW',
          amount: -200,
          status: 'PENDING',
          description: 'Withdrawal to bKash',
          walletType: 'main',
          createdAt: '2024-05-24T14:30:00Z'
        }
      ];
      
      setWallet(dummyWallet);
      setTransactions(dummyTransactions);
    } catch (err: any) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('method', depositMethod);
      formData.append('transactionId', depositTransactionId);
      if (depositScreenshot) {
        formData.append('screenshot', depositScreenshot);
      }
      
      await api.post('/wallet/deposit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowDepositModal(false);
      setAmount('');
      setDepositTransactionId('');
      setDepositScreenshot(null);
      fetchWalletData();
      alert('Deposit request submitted! Wait for admin approval.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount < MIN_WITHDRAW) {
      setError(`Minimum withdrawal amount is ৳${MIN_WITHDRAW}`);
      return;
    }
    
    if (withdrawAmount > (wallet?.mainWallet || 0)) {
      setError('Insufficient balance in main wallet');
      return;
    }
    
    try {
      await api.post('/wallet/withdraw', { 
        amount: withdrawAmount,
        method: withdrawMethod,
        account: withdrawAccount
      });
      setShowWithdrawModal(false);
      setAmount('');
      setWithdrawAccount('');
      fetchWalletData();
      alert('Withdrawal request submitted!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleCopyReferralCode = () => {
    const code = `REF-${user?.id?.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="h-4 w-4" />;
      case 'WITHDRAW': return <ArrowUpRight className="h-4 w-4" />;
      case 'EARNING': return <TrendingUp className="h-4 w-4" />;
      case 'REFERRAL': return <Gift className="h-4 w-4" />;
      case 'ENTRY_FEE': return <CreditCard className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'text-green-400';
      case 'WITHDRAW': return 'text-red-400';
      case 'EARNING': return 'text-green-400';
      case 'REFERRAL': return 'text-purple-400';
      case 'ENTRY_FEE': return 'text-orange-400';
      default: return 'text-gray-400';
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
    <div className="min-h-screen bg-gray-900 text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Wallet
          </h1>
          <p className="text-gray-400">Manage your funds and transactions</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wallet className="h-4 w-4" />
              Total Balance
            </div>
            <div className="text-3xl font-bold text-green-400">৳{wallet?.totalBalance || 0}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Banknote className="h-4 w-4" />
              Main Wallet
            </div>
            <div className="text-3xl font-bold text-blue-400">৳{wallet?.mainWallet || 0}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingUp className="h-4 w-4" />
              Winning Wallet
            </div>
            <div className="text-3xl font-bold text-yellow-400">৳{wallet?.winningWallet || 0}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Gift className="h-4 w-4" />
              Referral Wallet
            </div>
            <div className="text-3xl font-bold text-purple-400">৳{wallet?.referralWallet || 0}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5" />
              Deposit
            </h2>
            <Button 
              onClick={() => setShowDepositModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Add Funds
              <ArrowDownLeft className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              <p>Payment methods: bKash, Nagad, Rocket, Bank</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdraw
            </h2>
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Request Withdrawal
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              <p>Min: ৳{MIN_WITHDRAW} | Charge: ৳{WITHDRAW_CHARGE}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Referral Program
            </h2>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Code:</span>
                <code className="text-sm text-blue-400">REF-{user?.id?.slice(0, 8).toUpperCase()}</code>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={handleCopyReferralCode}
              >
                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <div className="text-sm text-gray-400">
              <p>Earn ৳50 for each referral!</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Transactions</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAW">Withdrawals</option>
              <option value="EARNING">Earnings</option>
              <option value="REFERRAL">Referrals</option>
              <option value="ENTRY_FEE">Entry Fees</option>
            </select>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No transactions found</h3>
              <p className="text-gray-500">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'DEPOSIT' || transaction.type === 'EARNING' || transaction.type === 'REFERRAL'
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-semibold">{transaction.description}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()} • {transaction.walletType} wallet
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}৳{transaction.amount}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded border ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Deposit Funds</h2>
                <Button variant="outline" size="sm" onClick={() => setShowDepositModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount (৳)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID</label>
                  <Input
                    type="text"
                    value={depositTransactionId}
                    onChange={(e) => setDepositTransactionId(e.target.value)}
                    required
                    placeholder="Enter your transaction ID"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Screenshot</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDepositScreenshot(e.target.files?.[0] || null)}
                      className="hidden"
                      id="deposit-screenshot"
                    />
                    <label htmlFor="deposit-screenshot" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Click to upload screenshot</p>
                      {depositScreenshot && (
                        <p className="text-sm text-green-400 mt-2">{depositScreenshot.name}</p>
                      )}
                    </label>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount to Pay:</span>
                    <span className="font-bold text-lg">৳{amount || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Send payment to: 017XXXXXXXX (bKash)
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Submit Deposit Request
                </Button>
              </form>
            </Card>
          </div>
        )}

        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Withdraw Funds</h2>
                <Button variant="outline" size="sm" onClick={() => setShowWithdrawModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount (৳)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min={MIN_WITHDRAW}
                    max={wallet?.mainWallet}
                    step="0.01"
                    placeholder={`Min: ৳${MIN_WITHDRAW}`}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available: ৳{wallet?.mainWallet || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
                  <Input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    required
                    placeholder="Enter your account number"
                    className="w-full"
                  />
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Withdrawal charge: ৳{WITHDRAW_CHARGE} will be deducted</span>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Request Withdrawal
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
