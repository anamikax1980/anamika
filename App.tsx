import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import MemberDetail from './components/MemberDetail';
import MonthlyEntry from './components/MonthlyEntry';
import Settings from './components/Settings';
import { Member, Transaction, AppSettings } from './types';
import * as storage from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // App State
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ interestRate: 5, monthlySavingsAmount: 100 });

  // Initial Load
  useEffect(() => {
    setMembers(storage.getMembers());
    setTransactions(storage.getTransactions());
    setSettings(storage.getSettings());
  }, []);

  // Handlers
  const handleAddMember = (member: Member) => {
    storage.saveMember(member);
    setMembers(storage.getMembers());
  };

  const handleAddTransaction = (transaction: Transaction) => {
    storage.addTransaction(transaction);
    setTransactions(storage.getTransactions());
    setMembers(storage.getMembers()); // Members update derived from transactions
  };

  const handleBulkTransactions = (newTransactions: Transaction[]) => {
    newTransactions.forEach(t => storage.addTransaction(t));
    setTransactions(storage.getTransactions());
    setMembers(storage.getMembers());
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleDeleteMember = (id: string) => {
      storage.deleteMember(id);
      setMembers(storage.getMembers());
      setSelectedMember(null);
  };

  const handleBulkDeleteMembers = (ids: string[]) => {
    ids.forEach(id => storage.deleteMember(id));
    setMembers(storage.getMembers());
  };

  const handleReset = () => {
    storage.resetAllData();
    // Refresh state from cleared storage
    setMembers(storage.getMembers());
    setTransactions(storage.getTransactions());
    setSettings(storage.getSettings());
    setActiveTab('dashboard');
    setSelectedMember(null);
  };

  const renderContent = () => {
    if (selectedMember) {
      return (
        <MemberDetail
          member={selectedMember}
          transactions={transactions}
          settings={settings}
          onBack={() => setSelectedMember(null)}
          onAddTransaction={handleAddTransaction}
          onDeleteMember={handleDeleteMember}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard members={members} transactions={transactions} />;
      case 'members':
        return (
          <MemberList
            members={members}
            onAddMember={handleAddMember}
            onSelectMember={setSelectedMember}
            onDeleteMembers={handleBulkDeleteMembers}
          />
        );
      case 'monthly':
        return (
          <MonthlyEntry
            members={members}
            settings={settings}
            onBulkTransaction={handleBulkTransactions}
          />
        );
      case 'settings':
        return (
            <Settings 
                settings={settings} 
                onSave={handleUpdateSettings} 
                onReset={handleReset}
            />
        );
      default:
        return <Dashboard members={members} transactions={transactions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => {
      setActiveTab(tab);
      setSelectedMember(null); // Reset detail view on tab switch
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;