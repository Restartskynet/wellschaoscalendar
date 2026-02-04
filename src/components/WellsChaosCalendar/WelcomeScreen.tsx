import { Crown, LogOut, Users } from 'lucide-react';
import type { Account, EventTheme } from '../../types/wellsChaos';

type WelcomeScreenProps = {
  currentUser: Account;
  theme: EventTheme;
  onEditProfile: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onCreateTrip: () => void;
};

const WelcomeScreen = ({
  currentUser,
  theme,
  onEditProfile,
  onSwitchAccount,
  onLogout,
  onCreateTrip
}: WelcomeScreenProps) => (
  <div className={`min-h-screen bg-gradient-to-br ${theme.bg}`}>
    <div className="p-4 flex justify-between items-center bg-white shadow-sm">
      <button
        onClick={onEditProfile}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-2 transition-all"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-200 overflow-hidden">
            {currentUser.customAvatar ? (
              <img src={currentUser.customAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.defaultAvatar
            )}
          </div>
          {currentUser.role === 'admin' && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
              <Crown size={10} className="text-white" />
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-800 text-sm">{currentUser.name}</div>
          <div className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Admin' : 'Member'}</div>
        </div>
      </button>
      <div className="flex gap-2">
        <button
          onClick={onSwitchAccount}
          className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
          title="Switch Account"
        >
          <Users size={20} />
        </button>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </div>

    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className={`text-5xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent mb-2`}>
          Wells Chaos Calendar
        </h1>
        <div className="text-4xl mb-4">✨</div>

        <p className="text-gray-600 text-lg mb-2">Your cute little trip brain</p>
        <p className="text-gray-500 mb-4">Plan the anchors. Leave the rest flexible. Everyone wins.</p>
        <p className="text-xs text-gray-400 italic mb-8">Organized by Ben & Marie</p>

        {currentUser.role === 'admin' ? (
          <button
            onClick={onCreateTrip}
            className={`bg-gradient-to-r ${theme.primary} text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
          >
            Create Your Trip
          </button>
        ) : (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <p className="text-purple-800 font-semibold mb-2">👋 Hey there!</p>
            <p className="text-purple-600 text-sm">
              Ben & Marie will create the trip soon. Once it's ready, you'll be able to RSVP to events and add your fun comments!
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default WelcomeScreen;
