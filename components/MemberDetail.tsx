import React, { useState, useMemo } from 'react';
import { Member, Transaction, TransactionType, AppSettings } from '../types';
import { formatIN, generateId, formatDate } from '../utils';
import { ArrowLeft, Trash2, Plus, Minus, Info, Calendar, History, TrendingUp, Check, ArrowRight } from 'lucide-react';

interface MemberDetailProps {
  member: Member;
  transactions: Transaction[];
  settings: AppSettings;
  onBack: () => void;
  onAddTransaction: (t: Transaction) => void;
  onDeleteMember: (id: string) => void;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ 
  member, 
  transactions, 
  settings, 
  onBack, 
  onAddTransaction,
  onDeleteMember
}) => {
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState('');
  const [historyFilter, setHistoryFilter] = useState<TransactionType | 'ALL' | 'LOAN_HISTORY'>('ALL');
  
  // Calculate Interest Due
  const estimatedInterestDue = Math.round((member.currentLoanPrincipal * settings.interestRate) / 100);

  // Calculate Loan Statistics
  const loanStats = useMemo(() => {
    if (member.currentLoanPrincipal === 0) return null;

    // Find the latest loan taken transaction to determine the start of the current cycle
    const loans = transactions
      .filter(t => t.memberId === member.id && t.type === TransactionType.LOAN_TAKEN)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latestLoan = loans[0];
    if (!latestLoan) return null; 

    const loanDate = new Date(latestLoan.date);
    
    // Filter transactions occurring after the loan was taken
    const relevantTxs = transactions.filter(t => 
      t.memberId === member.id && 
      new Date(t.date) >= loanDate
    );

    const repaymentCount = relevantTxs.filter(t => t.type === TransactionType.LOAN_REPAYMENT).length;
    const totalPrincipalRepaid = relevantTxs
      .filter(t => t.type === TransactionType.LOAN_REPAYMENT)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalInterestPaid = relevantTxs
      .filter(t => t.type === TransactionType.INTEREST_PAID)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      startDate: latestLoan.date,
      repaymentCount,
      totalInterestPaid,
      totalPrincipalRepaid
    };
  }, [member, transactions]);

  const memberTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.memberId === member.id);

    if (historyFilter === 'LOAN_HISTORY') {
      filtered = filtered.filter(t => 
        t.type === TransactionType.LOAN_TAKEN || 
        t.type === TransactionType.LOAN_REPAYMENT || 
        t.type === TransactionType.INTEREST_PAID
      );
    } else if (historyFilter !== 'ALL') {
      filtered = filtered.filter(t => t.type === historyFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, member.id, historyFilter]);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionType || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Validation
    if (transactionType === TransactionType.LOAN_REPAYMENT && numAmount > member.currentLoanPrincipal) {
      alert("Repayment cannot exceed current principal.");
      return;
    }

    const newTx: Transaction = {
      id: generateId(),
      memberId: member.id,
      date: new Date().toISOString(),
      type: transactionType,
      amount: numAmount
    };

    onAddTransaction(newTx);
    setTransactionType(null);
    setAmount('');
  };

  const startTransaction = (type: TransactionType) => {
    setTransactionType(type);
    
    if (type === TransactionType.INTEREST_PAID && estimatedInterestDue > 0) {
      setAmount(estimatedInterestDue.toString());
    } else if (type === TransactionType.DEPOSIT) {
      setAmount(settings.monthlySavingsAmount.toString());
    } else {
      setAmount('');
    }
  };

  const getBadgeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT: return 'bg-blue-100 text-blue-800';
      case TransactionType.LOAN_TAKEN: return 'bg-rose-100 text-rose-800';
      case TransactionType.LOAN_REPAYMENT: return 'bg-emerald-100 text-emerald-800';
      case TransactionType.INTEREST_PAID: return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (transactionType) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">
            {transactionType === TransactionType.LOAN_TAKEN && 'Grant Loan'}
            {transactionType === TransactionType.LOAN_REPAYMENT && 'Repay Loan Principal'}
            {transactionType === TransactionType.INTEREST_PAID && 'Collect Interest'}
            {transactionType === TransactionType.DEPOSIT && 'Add Savings'}
          </h2>
          <button onClick={() => setTransactionType(null)} className="text-gray-300 hover:text-white text-sm">Cancel</button>
        </div>
        
        <form onSubmit={handleTransaction} className="p-6 space-y-6">
          <div className="text-center mb-4">
             <p className="text-gray-500 text-sm">Member</p>
             <p className="text-xl font-bold">{member.name}</p>
          </div>

          {transactionType === TransactionType.INTEREST_PAID && member.currentLoanPrincipal > 0 && (
             <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>Calculated Interest ({settings.interestRate}%): <strong>{formatIN(estimatedInterestDue)}</strong></span>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              placeholder="0"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            Confirm Transaction
          </button>
        </form>
      </div>
    );
  }

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'LOAN_HISTORY', label: 'Loan History' },
    { id: TransactionType.DEPOSIT, label: 'Deposit' },
    { id: TransactionType.LOAN_TAKEN, label: 'Loan Taken' },
    { id: TransactionType.LOAN_REPAYMENT, label: 'Repayment' },
    { id: TransactionType.INTEREST_PAID, label: 'Interest' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
        <div className="ml-auto">
             <button 
                onClick={() => {
                    if(confirm("Are you sure you want to delete this member?")) onDeleteMember(member.id);
                }} 
                className="text-red-500 p-2 hover:bg-red-50 rounded-full"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-600 p-5 rounded-xl text-white shadow-lg shadow-blue-200 flex flex-col justify-between">
            <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Total Savings</p>
                <p className="text-3xl font-bold tracking-tight">{formatIN(member.totalSavings)}</p>
            </div>
            <div className="mt-4 bg-blue-700/30 p-3 rounded-lg flex items-center gap-2">
                <Info size={16} className="text-blue-200" />
                <p className="text-xs text-blue-50">Regular monthly deposits build your capital.</p>
            </div>
        </div>

        {/* Loan Principal Card Refactored */}
        <div className={`p-5 rounded-xl text-white shadow-lg transition-all ${member.currentLoanPrincipal > 0 ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
            {member.currentLoanPrincipal > 0 && loanStats ? (
                <div className="flex flex-col h-full justify-between gap-4">
                    <div>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-rose-100 text-xs font-medium uppercase tracking-wider mb-1">Outstanding Principal</p>
                                <p className="text-3xl font-bold tracking-tight">{formatIN(member.currentLoanPrincipal)}</p>
                             </div>
                             <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                                <TrendingUp size={20} className="text-rose-100" />
                             </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-rose-800/30 p-2.5 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 text-rose-100 mb-1">
                                    <Calendar size={12} />
                                    <span className="text-[10px] uppercase font-bold">Started</span>
                                </div>
                                <p className="text-sm font-semibold">{formatDate(loanStats.startDate)}</p>
                            </div>
                             <div className="bg-rose-800/30 p-2.5 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 text-rose-100 mb-1">
                                    <History size={12} />
                                    <span className="text-[10px] uppercase font-bold">Installments</span>
                                </div>
                                <p className="text-sm font-semibold">{loanStats.repaymentCount} Paid</p>
                            </div>
                        </div>
                        
                         <div className="mt-3 flex justify-between items-center text-rose-100 text-xs px-1">
                             <span>Interest: <strong>{formatIN(loanStats.totalInterestPaid)}</strong></span>
                             <span>Repaid: <strong>{formatIN(loanStats.totalPrincipalRepaid)}</strong></span>
                         </div>
                    </div>

                    <button 
                        onClick={() => {
                            setHistoryFilter('LOAN_HISTORY');
                            document.getElementById('transaction-ledger')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 bg-white text-rose-700 text-xs font-bold uppercase rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        View Loan History
                        <ArrowRight size={14} /> 
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-full justify-between">
                     <div>
                        <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Loan Status</p>
                        <p className="text-3xl font-bold">No Active Loan</p>
                    </div>
                    <div className="mt-4 bg-emerald-700/30 p-4 rounded-xl flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                             <Check size={20} />
                        </div>
                        <p className="text-emerald-50 text-xs leading-relaxed">
                            This member has no outstanding debts. You can grant a new loan from the actions menu.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
            onClick={() => startTransaction(TransactionType.LOAN_TAKEN)}
            className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-50 shadow-sm"
        >
            <Plus size={20} className="text-rose-600" />
            <span className="text-xs font-bold text-gray-700">Give Loan</span>
        </button>
        
        <button 
            onClick={() => startTransaction(TransactionType.LOAN_REPAYMENT)}
            disabled={member.currentLoanPrincipal === 0}
            className={`bg-white border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm ${member.currentLoanPrincipal === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
            <Minus size={20} className="text-emerald-600" />
            <span className="text-xs font-bold text-gray-700">Repay Principal</span>
        </button>

        <button 
            onClick={() => startTransaction(TransactionType.INTEREST_PAID)}
            disabled={member.currentLoanPrincipal === 0}
            className={`bg-white border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm ${member.currentLoanPrincipal === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
            <span className="text-amber-600 font-bold text-lg">%</span>
            <span className="text-xs font-bold text-gray-700">Pay Interest</span>
        </button>

         <button 
            onClick={() => startTransaction(TransactionType.DEPOSIT)}
            className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-50 shadow-sm"
        >
            <Plus size={20} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-700">Add Savings</span>
        </button>
      </div>

      {/* Ledger */}
      <div id="transaction-ledger">
        <h3 className="font-bold text-gray-900 mb-3">Transaction History</h3>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => setHistoryFilter(filter.id as TransactionType | 'ALL' | 'LOAN_HISTORY')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                        historyFilter === filter.id
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {memberTransactions.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No transactions found</div>
            ) : (
                memberTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex justify-between items-center">
                        <div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${getBadgeColor(tx.type)}`}>
                                {tx.type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(tx.date)}</p>
                        </div>
                        <div className="font-bold text-gray-900">
                            {formatIN(tx.amount)}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;