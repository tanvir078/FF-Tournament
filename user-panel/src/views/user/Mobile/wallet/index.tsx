import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Card from '@/views/user/Mobile/_components/Card';
import Button from '@/views/user/Mobile/_components/Button';
import Input from '@/views/user/Mobile/_components/Input';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, History, 
  TrendingUp, Gift, CreditCard, Banknote, Clock, 
  CheckCircle, XCircle, AlertCircle, Filter, Copy
} from 'lucide-react';



interface WalletBalance {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'PRIZE' | 'REFUND' | 'ENTRY_FEE' | 'COMMISSION';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [amount, setAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bkash');
  const [depositTransactionId, setDepositTransactionId] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const MIN_WITHDRAW = 100;
  const WITHDRAW_CHARGE = 10;

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchWalletData();
  }, [hydrated, router, user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get('/wallet/user'),
        api.get('/wallet/transactions'),
      ]);
      setWallet(walletResponse.data);
      setTransactions(transactionsResponse.data.data ?? transactionsResponse.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallet/deposit', {
        amount: parseFloat(amount),
        method: depositMethod,
        transactionId: depositTransactionId,
      });
      setShowDepositModal(false);
      setAmount('');
      setDepositTransactionId('');
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
    
    if (withdrawAmount > (wallet?.totalBalance || 0)) {
      setError('Insufficient balance');
      return;
    }
    
    try {
      await api.post('/withdraw', {
        amount: withdrawAmount,
        method: withdrawMethod,
        ...(withdrawMethod === 'bank'
          ? { accountNumber: withdrawAccount }
          : { mobileNumber: withdrawAccount })
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
      case 'FAILED':
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="h-4 w-4" />;
      case 'WITHDRAW': return <ArrowUpRight className="h-4 w-4" />;
      case 'PRIZE': return <TrendingUp className="h-4 w-4" />;
      case 'REFUND': return <Gift className="h-4 w-4" />;
      case 'ENTRY_FEE': return <CreditCard className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'text-green-400';
      case 'WITHDRAW': return 'text-red-400';
      case 'PRIZE': return 'text-green-400';
      case 'REFUND': return 'text-purple-400';
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
        </div>

        <div className="flex grid grid-cols-3 items-center gap-2 mb-8 md:grid-cols-2">
          <div className="py-2 px-2 flex flex-col bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm inline-block mb-2">
              <Banknote className="h-4 w-4" />
              Main Wallet
            </div>
            <div className="text-[3xl] font-bold text-blue-400">৳{wallet?.totalBalance || 0}</div>
            </div>

            <div className="py-2 px-2 flex flex-col bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm inline-block mb-2">
              <Banknote className="h-4 w-4" />
             Total Deposits
            </div>
            <div className="text-[3xl] font-bold text-blue-400">৳{wallet?.totalBalance || 0}</div>
          </div>

           <div className="py-2 px-2 flex flex-col bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] inline-block mb-2">
              <Banknote className="h-4 w-4" />
             Total Withdrawals
            </div>
            <div className="text-[3xl] font-bold text-blue-400">৳{wallet?.totalBalance || 0}</div>
          </div>


      
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="py-2 px-2">
           
            <Button 
              onClick={() => setShowDepositModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Add Funds
              <ArrowDownLeft className="h-4 w-4" />
            </Button>
            
          </Card>

          <Card className="py-2 px-2">
         
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Withdraw
              <ArrowUpRight className="h-4 w-4" />
            </Button>
         
          </Card>
        </div>
          
          <div className="w-full gap-6 mb-8">
            
     

          <Card className="py-2 px-2">
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
            <div className="flex justify-center text-sm font-bold text-gray-400">
              <p>Earn ৳50 for each referral!</p>
            </div>
          </Card>
        </div>

        <Card className="py-2 px-2">
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
              <option value="PRIZE">Prizes</option>
              <option value="REFUND">Refunds</option>
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
                      transaction.type === 'DEPOSIT' || transaction.type === 'PRIZE' || transaction.type === 'REFUND'
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-semibold">{transaction.description}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
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
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount to Pay:</span>
                    <span className="font-bold text-lg">৳{amount || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use the official payment account shared by management, then submit the transaction ID for approval.
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
                    max={wallet?.totalBalance}
                    step="0.01"
                    placeholder={`Min: ৳${MIN_WITHDRAW}`}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available: ৳{wallet?.totalBalance || 0}</p>
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
