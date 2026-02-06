import { Check, CheckCircle2, Circle, ClipboardList, DollarSign, Package, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import type { Account, BudgetItem, EventTheme, PackingItem, Trip } from '../../types/wellsChaos';
import QuestionnairesPage from './QuestionnairesPage';

type MorePageProps = {
  trip: Trip;
  currentUser: Account;
  accounts: Account[];
  theme: EventTheme;
  packingList: PackingItem[];
  budgetItems: BudgetItem[];
  onUpdatePackingList: (items: PackingItem[]) => void;
  onUpdateBudgetItems: (items: BudgetItem[]) => void;
};

type TabType = 'packing' | 'budget' | 'questionnaires';

const MorePage = ({
  trip,
  currentUser,
  accounts,
  theme,
  packingList,
  budgetItems,
  onUpdatePackingList,
  onUpdateBudgetItems
}: MorePageProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('packing');
  const [newPackingItem, setNewPackingItem] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    description: '',
    amount: '',
    paidBy: currentUser.username,
    splitWith: trip.members.map((m) => m.username)
  });

  const isAdmin = currentUser.role === 'admin';

  // Packing List Functions
  const handleAddPackingItem = () => {
    if (!newPackingItem.trim()) return;
    const newItem: PackingItem = {
      id: Date.now().toString(),
      item: newPackingItem.trim(),
      packed: false,
      addedBy: currentUser.username
    };
    onUpdatePackingList([...packingList, newItem]);
    setNewPackingItem('');
  };

  const handleTogglePacked = (id: string) => {
    const updated = packingList.map((item) =>
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    onUpdatePackingList(updated);
  };

  const handleDeletePackingItem = (id: string) => {
    onUpdatePackingList(packingList.filter((item) => item.id !== id));
  };

  // Budget Functions
  const handleSaveBudgetItem = () => {
    if (!budgetForm.description.trim() || !budgetForm.amount) return;

    if (editingBudgetItem) {
      const updated = budgetItems.map((item) =>
        item.id === editingBudgetItem.id
          ? {
              ...item,
              description: budgetForm.description.trim(),
              amount: parseFloat(budgetForm.amount),
              paidBy: budgetForm.paidBy,
              splitWith: budgetForm.splitWith
            }
          : item
      );
      onUpdateBudgetItems(updated);
    } else {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        description: budgetForm.description.trim(),
        amount: parseFloat(budgetForm.amount),
        paidBy: budgetForm.paidBy,
        splitWith: budgetForm.splitWith
      };
      onUpdateBudgetItems([...budgetItems, newItem]);
    }

    resetBudgetForm();
  };

  const handleDeleteBudgetItem = (id: string) => {
    onUpdateBudgetItems(budgetItems.filter((item) => item.id !== id));
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      description: '',
      amount: '',
      paidBy: currentUser.username,
      splitWith: trip.members.map((m) => m.username)
    });
    setShowBudgetForm(false);
    setEditingBudgetItem(null);
  };

  const startEditBudgetItem = (item: BudgetItem) => {
    setEditingBudgetItem(item);
    setBudgetForm({
      description: item.description,
      amount: item.amount.toString(),
      paidBy: item.paidBy,
      splitWith: item.splitWith
    });
    setShowBudgetForm(true);
  };

  // Calculate who owes what
  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    trip.members.forEach((m) => {
      balances[m.username] = 0;
    });

    budgetItems.forEach((item) => {
      const splitAmount = item.amount / item.splitWith.length;
      // Payer gets credit
      balances[item.paidBy] = (balances[item.paidBy] || 0) + item.amount;
      // Each person in split owes their share
      item.splitWith.forEach((username) => {
        balances[username] = (balances[username] || 0) - splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  const getAccount = (username: string) => accounts.find((a) => a.username === username);

  const packedCount = packingList.filter((item) => item.packed).length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
            ✨ More
          </h1>
          <div className="text-xs text-gray-400 italic">{trip.name}</div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('packing')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'packing'
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package size={18} />
              Packing List
              {packingList.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'packing' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                }`}>
                  {packedCount}/{packingList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'budget'
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign size={18} />
              Budget
              {budgetItems.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'budget' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                }`}>
                  ${totalBudget.toFixed(0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('questionnaires')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'questionnaires'
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ClipboardList size={18} />
              Surveys
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Packing Checklist */}
        {activeTab === 'packing' && (
          <div className="space-y-3 animate-fade-in">
            {/* Progress */}
            {packingList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Packing Progress</span>
                  <span className="text-sm font-bold text-purple-600">
                    {Math.round((packedCount / packingList.length) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
                    style={{ width: `${(packedCount / packingList.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              {packingList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🧳</div>
                  <p className="text-gray-500 text-sm">No items yet!</p>
                  {isAdmin && <p className="text-gray-400 text-xs mt-1">Add your first packing item below</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {packingList.map((item) => {
                    const addedByAccount = getAccount(item.addedBy);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          item.packed
                            ? 'bg-green-50 border border-green-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <button
                          onClick={() => handleTogglePacked(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.packed ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <Circle size={24} className="text-gray-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${item.packed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {item.item}
                          </span>
                          {addedByAccount && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Added by {addedByAccount.name}
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeletePackingItem(item.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Item Input (Admins Only) */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPackingItem}
                      onChange={(e) => setNewPackingItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPackingItem()}
                      placeholder="Add packing item..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors"
                    />
                    <button
                      onClick={handleAddPackingItem}
                      disabled={!newPackingItem.trim()}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        newPackingItem.trim()
                          ? `bg-gradient-to-r ${theme.primary} text-white shadow-md hover:shadow-lg`
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Splitter */}
        {activeTab === 'budget' && (
          <div className="space-y-3 animate-fade-in">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800">Total Expenses</span>
                <span className={`text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  ${totalBudget.toFixed(2)}
                </span>
              </div>

              {/* Balances */}
              {Object.keys(balances).length > 0 && totalBudget > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 font-medium mb-2">Balance Summary</div>
                  {Object.entries(balances)
                    .filter(([_, balance]) => Math.abs(balance) > 0.01)
                    .sort((a, b) => b[1] - a[1])
                    .map(([username, balance]) => {
                      const account = getAccount(username);
                      const isPositive = balance > 0;
                      return (
                        <div
                          key={username}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isPositive ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                              {account?.customAvatar ? (
                                <img src={account.customAvatar} alt={account.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs bg-gradient-to-br from-purple-100 to-pink-100">
                                  {account?.defaultAvatar}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{account?.name}</span>
                          </div>
                          <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}${balance.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800">Expenses</span>
              </div>

              {budgetItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-gray-500 text-sm">No expenses recorded yet</p>
                  <p className="text-gray-400 text-xs mt-1">Track shared costs with your group</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {budgetItems.map((item) => {
                    const paidByAccount = getAccount(item.paidBy);
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{item.description}</div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span>Paid by {paidByAccount?.name}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                Split {item.splitWith.length} ways
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                              ${item.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              ${(item.amount / item.splitWith.length).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => startEditBudgetItem(item)}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBudgetItem(item.id)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Questionnaires */}
        {activeTab === 'questionnaires' && (
          <QuestionnairesPage currentUser={currentUser} accounts={accounts} theme={theme} />
        )}
      </div>

      {/* Budget FAB - always visible on budget tab, positioned above bottom nav */}
      {activeTab === 'budget' && !showBudgetForm && (
        <button
          onClick={() => setShowBudgetForm(true)}
          data-testid="budget-fab"
          className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200`}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-4 border-b border-gray-100 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingBudgetItem ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={resetBudgetForm}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                  placeholder="e.g., Park tickets, Dinner at..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                <select
                  value={budgetForm.paidBy}
                  onChange={(e) => setBudgetForm({ ...budgetForm, paidBy: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors bg-white"
                >
                  {trip.members.map((member) => (
                    <option key={member.username} value={member.username}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split With */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Split With</label>
                <div className="space-y-2">
                  {trip.members.map((member) => {
                    const isSelected = budgetForm.splitWith.includes(member.username);
                    return (
                      <button
                        key={member.username}
                        onClick={() => {
                          const newSplitWith = isSelected
                            ? budgetForm.splitWith.filter((u) => u !== member.username)
                            : [...budgetForm.splitWith, member.username];
                          if (newSplitWith.length > 0) {
                            setBudgetForm({ ...budgetForm, splitWith: newSplitWith });
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple-50 border-2 border-purple-300'
                            : 'bg-gray-50 border-2 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                          {member.customAvatar ? (
                            <img src={member.customAvatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple-100 to-pink-100">
                              {member.defaultAvatar}
                            </div>
                          )}
                        </div>
                        <span className={`flex-1 text-left text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                          {member.name}
                        </span>
                        {isSelected && <Check size={18} className="text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {budgetForm.amount && budgetForm.splitWith.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-700">
                    ${parseFloat(budgetForm.amount || '0').toFixed(2)} split {budgetForm.splitWith.length} ways ={' '}
                    <span className="font-bold">
                      ${(parseFloat(budgetForm.amount || '0') / budgetForm.splitWith.length).toFixed(2)}
                    </span>{' '}
                    per person
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetBudgetForm}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBudgetItem}
                  disabled={!budgetForm.description.trim() || !budgetForm.amount || budgetForm.splitWith.length === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                    budgetForm.description.trim() && budgetForm.amount && budgetForm.splitWith.length > 0
                      ? `bg-gradient-to-r ${theme.primary} shadow-md hover:shadow-lg`
                      : 'bg-gray-300'
                  }`}
                >
                  {editingBudgetItem ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorePage;
