import { Member, Transaction, AppSettings, TransactionType } from '../types';
import { generateId } from '../utils';

const STORAGE_KEYS = {
  MEMBERS: 'samity_members',
  TRANSACTIONS: 'samity_transactions',
  SETTINGS: 'samity_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  interestRate: 5.0,
  monthlySavingsAmount: 100,
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getMembers = (): Member[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  return stored ? JSON.parse(stored) : [];
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
};

export const deleteMember = (id: string): void => {
  const members = getMembers();
  const updated = members.map(m => m.id === id ? { ...m, isActive: false } : m);
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  // Update Member Logic
  const members = getMembers();
  const memberIndex = members.findIndex(m => m.id === transaction.memberId);
  
  if (memberIndex >= 0) {
    const member = members[memberIndex];
    
    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        member.totalSavings = (member.totalSavings || 0) + transaction.amount;
        break;
      case TransactionType.LOAN_TAKEN:
        member.currentLoanPrincipal = (member.currentLoanPrincipal || 0) + transaction.amount;
        break;
      case TransactionType.LOAN_REPAYMENT:
        member.currentLoanPrincipal = Math.max(0, (member.currentLoanPrincipal || 0) - transaction.amount);
        break;
      case TransactionType.INTEREST_PAID:
        // Interest paid doesn't change principal, it's revenue for the group
        break;
    }
    
    members[memberIndex] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }
};

export const resetAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};
