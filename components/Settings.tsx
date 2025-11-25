import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onReset }) => {
  const [interestRate, setInterestRate] = useState(settings.interestRate.toString());
  const [monthlySavings, setMonthlySavings] = useState(settings.monthlySavingsAmount.toString());
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: AppSettings = {
      interestRate: parseFloat(interestRate),
      monthlySavingsAmount: parseFloat(monthlySavings),
    };
    onSave(newSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const confirmReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold">App Configuration</h2>
        <p className="text-gray-400 text-sm mt-1">Global settings for calculations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Interest Rate (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Applied monthly on the outstanding loan principal.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Default Monthly Saving (₹)</label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
           <p className="text-xs text-gray-500 mt-2">
            The default amount populated in the bulk entry checklist.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
        >
          {saved ? 'Settings Saved!' : (
              <>
                <Save size={20} />
                Save Changes
              </>
          )}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-rose-600">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-bold">Danger Zone</h3>
        </div>
        
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6">
            <p className="text-sm text-gray-700 mb-4">
                Resetting the application will permanently delete <strong>all members</strong>, <strong>all transactions</strong>, and revert settings to default. This action cannot be undone.
            </p>
            <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-white text-rose-600 border border-rose-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
                <Trash2 size={18} />
                Reset All Data
            </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 transform transition-all">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Factory Reset</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
                        Are you sure? This will delete <strong>all members</strong> and <strong>transactions</strong>. Data cannot be recovered.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowResetConfirm(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300 outline-none"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmReset}
                            className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors focus:ring-2 focus:ring-rose-500 outline-none"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;