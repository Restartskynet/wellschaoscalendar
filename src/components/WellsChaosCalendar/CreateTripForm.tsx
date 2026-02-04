import { ChevronLeft, Crown } from 'lucide-react';
import { useState } from 'react';
import type { Account, EventTheme, Trip } from '../../types/wellsChaos';

type CreateTripFormProps = {
  accounts: Account[];
  theme: EventTheme;
  onBack: () => void;
  onCreate: (trip: Trip) => void;
};

const CreateTripForm = ({ accounts, theme, onBack, onCreate }: CreateTripFormProps) => {
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreate = () => {
    if (!tripName || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        blocks: []
      });
    }

    onCreate({
      name: tripName,
      members: accounts,
      days,
      weather: null
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
      <div className="max-w-lg mx-auto pt-8">
        <button onClick={onBack} className="text-purple-600 mb-6 flex items-center gap-2 hover:gap-3 transition-all">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Your Adventure</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Disney World Summer 2024"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-sm font-semibold text-purple-800 mb-3">Family Members</div>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((member) => (
                  <div key={member.username} className="bg-white rounded-lg p-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-200 overflow-hidden flex-shrink-0">
                      {member.customAvatar ? (
                        <img src={member.customAvatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.defaultAvatar
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                        {member.name}
                        {member.role === 'admin' && <Crown size={12} className="text-yellow-500" />}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className={`w-full bg-gradient-to-r ${theme.primary} text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              Create Trip ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTripForm;
