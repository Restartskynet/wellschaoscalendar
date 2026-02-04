import { Check, Crown, X } from 'lucide-react';
import type { Account } from '../../types/wellsChaos';

type AccountSwitcherProps = {
  accounts: Account[];
  currentUser: Account;
  onSelect: (account: Account) => void;
  onClose: () => void;
};

const AccountSwitcher = ({ accounts, currentUser, onSelect, onClose }: AccountSwitcherProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="text-xl font-bold text-gray-800">Switch Account</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-2">
        {accounts.map((acc) => (
          <button
            key={acc.username}
            onClick={() => onSelect(acc)}
            className={`w-full p-4 rounded-xl transition-all flex items-center gap-3 ${
              currentUser.username === acc.username
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-purple-200 overflow-hidden flex-shrink-0">
              {acc.customAvatar ? (
                <img src={acc.customAvatar} alt={acc.name} className="w-full h-full object-cover" />
              ) : (
                acc.defaultAvatar
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold flex items-center gap-2">
                {acc.name}
                {acc.role === 'admin' && <Crown size={16} className="text-yellow-400" />}
              </div>
              <div
                className={`text-sm ${
                  currentUser.username === acc.username ? 'text-white opacity-90' : 'text-gray-500'
                }`}
              >
                {acc.role === 'admin' ? 'Admin' : 'Member'}
              </div>
            </div>
            {currentUser.username === acc.username && <Check size={20} />}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default AccountSwitcher;
