import React, { useState } from 'react';
import { Member, Transaction, TransactionType, AppSettings } from '../types';
import { formatIN, generateId } from '../utils';
import { Check, CheckSquare, Square, Search } from 'lucide-react';

interface MonthlyEntryProps {
  members: Member[];
  settings: AppSettings;
  onBulkTransaction: (transactions: Transaction[]) => void;
}

const MonthlyEntry: React.FC<MonthlyEntryProps> = ({ members, settings, onBulkTransaction }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeMembers = members.filter(m => m.isActive);
  const filteredMembers = activeMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = filteredMembers.map(m => m.id);
      setSelectedIds(new Set(allIds));
    }
  };

  const handleInitiateDeposit = () => {
    if (selectedIds.size === 0) return;
    setShowConfirm(true);
  };

  const processDeposits = () => {
    const transactions: Transaction[] = [];
    const date = new Date().toISOString();

    selectedIds.forEach(id => {
      transactions.push({
        id: generateId(),
        memberId: id,
        date: date,
        type: TransactionType.DEPOSIT,
        amount: settings.monthlySavingsAmount,
        note: 'Monthly Savings Entry'
      });
    });

    onBulkTransaction(transactions);
    setShowConfirm(false);
    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setSelectedIds(new Set());
    }, 2000);
  };

  if (submitted) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-emerald-600 animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold">Entries Saved!</h2>
            <p className="text-gray-500 mt-2">Ledgers have been updated.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-bold">Monthly Collection</h2>
        <p className="text-indigo-200 text-sm mt-1">Select members who paid their monthly savings.</p>
        <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatIN(settings.monthlySavingsAmount)}</span>
            <span className="text-sm text-indigo-200">/ member</span>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-gray-50 pt-2 pb-4 space-y-2">
         <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Filter members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
        
        <div className="flex justify-between items-center px-1">
             <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                {selectedIds.size === filteredMembers.length && filteredMembers.length > 0 ? (
                    <CheckSquare size={20} className="text-indigo-600" />
                ) : (
                    <Square size={20} className="text-gray-400" />
                )}
                Select All
            </button>
            <span className="text-sm font-bold text-indigo-700">
                {selectedIds.size} selected
            </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
        {filteredMembers.map((member) => {
            const isSelected = selectedIds.has(member.id);
            return (
                <div 
                    key={member.id} 
                    onClick={() => toggleSelection(member.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <Check size={14} className="text-white" />}
                         </div>
                         <div>
                            <p className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{member.name}</p>
                            <p className="text-xs text-gray-400">{member.phoneNumber}</p>
                         </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-30">
        <button
            onClick={handleInitiateDeposit}
            disabled={selectedIds.size === 0}
            className={`w-full max-w-4xl mx-auto py-4 rounded-xl font-bold shadow-lg text-lg transition-all pointer-events-auto ${
                selectedIds.size === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01]'
            }`}
        >
            Confirm Deposits ({selectedIds.size})
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        <Check size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Confirm Monthly Collection</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        You are about to record a deposit of <strong>{formatIN(settings.monthlySavingsAmount)}</strong> for <strong>{selectedIds.size}</strong> members.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={processDeposits}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyEntry;