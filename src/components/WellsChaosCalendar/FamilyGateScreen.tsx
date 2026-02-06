import { useState } from 'react';
import { Shield } from 'lucide-react';
import { getEdgeFunctionUrl } from '../../lib/supabaseClient';

const DEVICE_TOKEN_KEY = 'wcc_device_token';
const DEVICE_ID_KEY = 'wcc_device_id';

// Generate or retrieve a stable device ID
export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const getDeviceToken = (): string | null => {
  return localStorage.getItem(DEVICE_TOKEN_KEY);
};

export const setDeviceToken = (token: string) => {
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
};

export const hasPassedGate = (): boolean => {
  return Boolean(getDeviceToken());
};

type FamilyGateScreenProps = {
  onGatePassed: () => void;
};

const FamilyGateScreen = ({ onGatePassed }: FamilyGateScreenProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const deviceId = getDeviceId();
      const res = await fetch(getEdgeFunctionUrl('family_gate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyCode: code, deviceId }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Invalid code');
        setIsLoading(false);
        return;
      }

      setDeviceToken(body.deviceToken);
      onGatePassed();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Wells Chaos Calendar
          </h1>
          <div className="text-3xl mb-2">🔐</div>
          <p className="text-gray-600">Family Access</p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Family-Only App</span>
          </div>
          <p className="text-xs text-purple-600">
            Enter the family access code to set up this device. You only need to do this once.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Family Access Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder="Enter the code from Ben or Marie"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !code.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 ${
              isLoading || !code.trim()
                ? 'bg-gray-300 text-gray-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyGateScreen;
