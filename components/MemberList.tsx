import React, { useState } from 'react';
import { Member } from '../types';
import { formatIN, generateId } from '../utils';
import { Search, UserPlus, Phone, ChevronRight, Pencil, X, Square, CheckSquare, Trash2, AlertTriangle } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onSelectMember: (member: Member) => void;
  onDeleteMembers: (ids: string[]) => void;
}

const MemberList: React.FC<MemberListProps> = ({ members, onAddMember, onSelectMember, onDeleteMembers }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const activeMembers = members.filter(m => m.isActive);
  const filteredMembers = activeMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phoneNumber.includes(searchTerm)
  );

  const startAdding = () => {
    setEditingMember(null);
    setName('');
    setPhone('');
    setIsFormOpen(true);
  };

  const startEditing = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setPhone(member.phoneNumber);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    setName('');
    setPhone('');
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const initiateBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    onDeleteMembers(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingMember) {
      // Update existing member
      const updatedMember: Member = {
        ...editingMember,
        name: name,
        phoneNumber: phone,
      };
      onAddMember(updatedMember);
    } else {
      // Create new member
      const newMember: Member = {
        id: generateId(),
        name: name,
        phoneNumber: phone,
        isActive: true,
        currentLoanPrincipal: 0,
        totalSavings: 0,
        joinedDate: new Date().toISOString(),
      };
      onAddMember(newMember);
    }
    
    closeForm();
  };

  if (isFormOpen) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-white font-bold text-lg">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
            <button onClick={closeForm} className="text-emerald-100 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Rahul Kumar"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. 9876543210"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {editingMember ? 'Save Changes' : 'Create Member'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm"
          />
        </div>
        <button
          onClick={startAdding}
          className="bg-emerald-600 text-white px-4 rounded-xl flex items-center justify-center shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 pb-20">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members found.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors group ${selectedIds.has(member.id) ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <button 
                    onClick={(e) => toggleSelection(member.id, e)}
                    className="text-gray-400 hover:text-emerald-600 cursor-pointer p-1 -ml-1"
                >
                    {selectedIds.has(member.id) ? (
                        <CheckSquare size={22} className="text-emerald-600" />
                    ) : (
                        <Square size={22} />
                    )}
                </button>

                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{member.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-0.5">
                    <Phone size={12} className="mr-1" />
                    {member.phoneNumber}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                    {member.currentLoanPrincipal > 0 ? (
                        <div className="text-rose-600 font-bold text-sm">
                            Loan: {formatIN(member.currentLoanPrincipal)}
                        </div>
                    ) : (
                        <div className="text-emerald-600 font-medium text-sm">
                            Savings: {formatIN(member.totalSavings)}
                        </div>
                    )}
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        startEditing(member);
                    }}
                    className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    aria-label="Edit Member"
                >
                    <Pencil size={18} />
                </button>

                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-30">
            <button
                onClick={initiateBulkDelete}
                className="w-full max-w-4xl mx-auto py-3 rounded-xl font-bold shadow-lg text-lg transition-all pointer-events-auto bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200"
            >
                <Trash2 size={20} />
                Delete Selected ({selectedIds.size})
            </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 transform transition-all">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Delete {selectedIds.size} Members?</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
                        Are you sure you want to remove the selected members? They will be marked as inactive.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300 outline-none"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmBulkDelete}
                            className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors focus:ring-2 focus:ring-rose-500 outline-none"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;