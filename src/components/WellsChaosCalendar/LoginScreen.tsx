import { useState } from 'react';
import { Crown } from 'lucide-react';
import type { Account } from '../../types/wellsChaos';

type LoginScreenProps = {
  accounts: Account[];
  onLogin: (account: Account) => void;
};

const LoginScreen = ({ accounts, onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = accounts.find((acc) => acc.username === username && acc.password === password);
    if (user) {
      onLogin(user);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const quickLogin = (account: Account) => {
    onLogin(account);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Wells Chaos Calendar
          </h1>
          <div className="text-3xl mb-2">✨</div>
          <p className="text-gray-600">Family Trip Planning</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              placeholder="Enter username"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              placeholder="Enter password"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-purple-600 font-semibold text-center mb-3">🚀 Quick Test Login:</p>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {accounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => quickLogin(acc)}
                className="bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-3 rounded-xl transition-all transform hover:scale-105 border-2 border-purple-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg border-2 border-purple-200">
                    {acc.customAvatar ? (
                      <img src={acc.customAvatar} alt={acc.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      acc.defaultAvatar
                    )}
                  </div>
                  {acc.role === 'admin' && <Crown size={12} className="text-yellow-500" />}
                </div>
                <div className="text-xs font-semibold text-gray-800">{acc.name}</div>
                <div className="text-xs text-gray-500">{acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
