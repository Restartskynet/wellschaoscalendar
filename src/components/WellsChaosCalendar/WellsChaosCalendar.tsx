import { useState } from 'react';
import { PRESET_ACCOUNTS } from '../../data/accounts';
import { THEMES } from '../../data/themes';
import type { Account, EventTheme, Trip } from '../../types/wellsChaos';
import AccountSwitcher from './AccountSwitcher';
import AnimationStyles from './AnimationStyles';
import CalendarView from './CalendarView';
import CreateTripForm from './CreateTripForm';
import LoginScreen from './LoginScreen';
import ProfileEditor from './ProfileEditor';
import WelcomeScreen from './WelcomeScreen';

type ViewState = 'login' | 'welcome' | 'createTrip' | 'calendar';

const WellsChaosCalendar = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(PRESET_ACCOUNTS);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const getCurrentTheme = (): EventTheme => {
    if (!currentUser) return THEMES.Default;
    return THEMES[currentUser.theme] || THEMES.Default;
  };

  const handleLogin = (account: Account) => {
    setCurrentUser(account);
    setCurrentView('welcome');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setTrip(null);
  };

  return (
    <div className="font-sans">
      <AnimationStyles />

      {currentView === 'login' && <LoginScreen accounts={accounts} onLogin={handleLogin} />}

      {currentView === 'welcome' && currentUser && (
        <WelcomeScreen
          currentUser={currentUser}
          theme={getCurrentTheme()}
          onEditProfile={() => setShowProfileEdit(true)}
          onSwitchAccount={() => setShowAccountSwitcher(true)}
          onLogout={handleLogout}
          onCreateTrip={() => setCurrentView('createTrip')}
        />
      )}

      {currentView === 'createTrip' && currentUser && (
        <CreateTripForm
          accounts={accounts}
          theme={getCurrentTheme()}
          onBack={() => setCurrentView('welcome')}
          onCreate={(newTrip) => {
            setTrip(newTrip);
            setCurrentView('calendar');
          }}
        />
      )}

      {currentView === 'calendar' && currentUser && trip && (
        <CalendarView
          trip={trip}
          currentUser={currentUser}
          accounts={accounts}
          theme={getCurrentTheme()}
          onShowAccountSwitcher={() => setShowAccountSwitcher(true)}
          onUpdateTrip={setTrip}
        />
      )}

      {showProfileEdit && currentUser && (
        <ProfileEditor
          accounts={accounts}
          currentUser={currentUser}
          onUpdateAccounts={setAccounts}
          onUpdateUser={setCurrentUser}
          onClose={() => setShowProfileEdit(false)}
        />
      )}

      {showAccountSwitcher && currentUser && (
        <AccountSwitcher
          accounts={accounts}
          currentUser={currentUser}
          onSelect={(account) => {
            setCurrentUser(account);
            setShowAccountSwitcher(false);
          }}
          onClose={() => setShowAccountSwitcher(false)}
        />
      )}
    </div>
  );
};

export default WellsChaosCalendar;
