import React, { useMemo } from 'react';
import { Member, Transaction, TransactionType } from '../types';
import { formatIN } from '../utils';
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions }) => {
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.isActive).length;
    
    const totalSavings = members.reduce((sum, m) => sum + (m.totalSavings || 0), 0);
    const totalLoansOutstanding = members.reduce((sum, m) => sum + (m.currentLoanPrincipal || 0), 0);
    
    // Simple calculation: Net Balance = Total Savings - Outstanding Loans + Interest Earned (simplified logic)
    // A better approach for "Organization Balance" is usually: Total Deposits + Total Interest Paid - Total Loans Given + Total Loans Repaid
    
    let orgBalance = 0;
    let totalInterestEarned = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.DEPOSIT) orgBalance += t.amount;
      if (t.type === TransactionType.INTEREST_PAID) {
        orgBalance += t.amount;
        totalInterestEarned += t.amount;
      }
      if (t.type === TransactionType.LOAN_TAKEN) orgBalance -= t.amount;
      if (t.type === TransactionType.LOAN_REPAYMENT) orgBalance += t.amount;
    });

    return {
      activeMembers,
      totalSavings,
      totalLoansOutstanding,
      orgBalance,
      totalInterestEarned
    };
  }, [members, transactions]);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
        <p className="text-emerald-100 text-sm font-medium mb-1">Organization Balance</p>
        <h2 className="text-4xl font-bold tracking-tight">{formatIN(stats.orgBalance)}</h2>
        <div className="mt-4 flex gap-2">
            <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-emerald-400/20">
             Active Fund
            </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-rose-600">
            <TrendingDown size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Loans Given</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatIN(stats.totalLoansOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-1">Principal Outstanding</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <TrendingUp size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Interest</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatIN(stats.totalInterestEarned)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Earned</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Wallet size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Savings</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatIN(stats.totalSavings)}</p>
          <p className="text-xs text-gray-500 mt-1">Member Deposits</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-purple-600">
            <Users size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Members</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.activeMembers}</p>
          <p className="text-xs text-gray-500 mt-1">Active Accounts</p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
         <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
            <Users size={16} />
         </div>
         <div>
            <h4 className="font-semibold text-blue-900 text-sm">Member Status</h4>
            <p className="text-blue-700 text-xs mt-1">
                You have {stats.activeMembers} active members contributing to the pool. Use the checklist in the 'Entry' tab to record monthly deposits.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
