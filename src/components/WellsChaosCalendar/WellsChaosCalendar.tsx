import { useState } from 'react';
import { PRESET_ACCOUNTS } from '../../data/accounts';
import { THEMES } from '../../data/themes';
import { useAuth } from '../../providers/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import type { Account, BudgetItem, ChatMessage, EventTheme, PackingItem, Trip } from '../../types/wellsChaos';
import AccountSwitcher from './AccountSwitcher';
import AnimationStyles from './AnimationStyles';
import BottomNav, { type PageType } from './BottomNav';
import CalendarView from './CalendarView';
import ChatPage from './ChatPage';
import CreateTripForm from './CreateTripForm';
import FamilyGateScreen, { getDeviceId, getDeviceToken, hasPassedGate } from './FamilyGateScreen';
import HomePage from './HomePage';
import LoginScreen from './LoginScreen';
import MorePage from './MorePage';
import PhotosPage from './PhotosPage';
import ProfileEditor from './ProfileEditor';
import WelcomeScreen from './WelcomeScreen';

type ViewState = 'gate' | 'login' | 'welcome' | 'createTrip' | 'app';

// Default packing list items
const DEFAULT_PACKING_LIST: PackingItem[] = [
  { id: '1', item: '🧴 Sunscreen SPF 50+', packed: false, addedBy: 'ben' },
  { id: '2', item: '👟 Comfortable walking shoes', packed: false, addedBy: 'ben' },
  { id: '3', item: '🎒 Day backpack', packed: false, addedBy: 'ben' },
  { id: '4', item: '🔋 Portable phone charger', packed: false, addedBy: 'marie' },
  { id: '5', item: '💧 Refillable water bottles', packed: false, addedBy: 'marie' },
  { id: '6', item: '🧢 Hats for sun protection', packed: false, addedBy: 'ben' },
  { id: '7', item: '🌂 Ponchos (Florida rain!)', packed: false, addedBy: 'marie' },
  { id: '8', item: '📱 MagicBand / Park tickets', packed: false, addedBy: 'ben' },
  { id: '9', item: '💊 First aid kit / medications', packed: false, addedBy: 'marie' },
  { id: '10', item: '🍫 Snacks for park', packed: false, addedBy: 'ben' }
];

// Default budget items
const DEFAULT_BUDGET_ITEMS: BudgetItem[] = [];

const WellsChaosCalendar = () => {
  const supabaseMode = isSupabaseConfigured();
  const auth = useAuth();

  // Determine initial view: if Supabase is configured and gate not passed, show gate
  const getInitialView = (): ViewState => {
    if (supabaseMode && !hasPassedGate()) return 'gate';
    return 'login';
  };

  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(PRESET_ACCOUNTS);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // New state for pages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>(DEFAULT_PACKING_LIST);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(DEFAULT_BUDGET_ITEMS);

  const getCurrentTheme = (): EventTheme => {
    if (!currentUser) return THEMES.Default;
    return THEMES[currentUser.theme] || THEMES.Default;
  };

  const handleLogin = (account: Account) => {
    setCurrentUser(account);
    setCurrentView('welcome');
  };

  const handleSupabaseLogin = async (username: string, password: string): Promise<{ error: string | null }> => {
    const deviceId = getDeviceId();
    const deviceToken = getDeviceToken() || '';
    const result = await auth.signIn(username, password, deviceId, deviceToken);

    if (!result.error) {
      // After signIn, profile may take a moment to load.
      // For now, set a minimal account from the username to proceed.
      // The profile will be hydrated when AuthProvider fetches it.
      const account: Account = {
        username,
        password: '',
        name: username,
        role: 'user',
        defaultAvatar: '🧑',
        color: 'purple',
        customAvatar: null,
        theme: 'Default',
      };
      setCurrentUser(account);
      setCurrentView('welcome');
    }

    return result;
  };

  const handleLogout = async () => {
    if (supabaseMode) {
      await auth.signOut();
    }
    setCurrentUser(null);
    setCurrentView('login');
    setTrip(null);
    setCurrentPage('home');
  };

  const handleSendChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  // Render the current page based on currentPage state
  const renderCurrentPage = () => {
    if (!currentUser || !trip) return null;

    const theme = getCurrentTheme();

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            trip={trip}
            currentUser={currentUser}
            theme={theme}
            onShowAccountSwitcher={() => setShowAccountSwitcher(true)}
            onShowSettings={() => setShowProfileEdit(true)}
            onUpdateTrip={setTrip}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            trip={trip}
            currentUser={currentUser}
            accounts={accounts}
            theme={theme}
            onShowAccountSwitcher={() => setShowAccountSwitcher(true)}
            onUpdateTrip={setTrip}
          />
        );
      case 'photos':
        return <PhotosPage trip={trip} theme={theme} />;
      case 'chat':
        return (
          <ChatPage
            trip={trip}
            currentUser={currentUser}
            accounts={accounts}
            theme={theme}
            chatMessages={chatMessages}
            onSendMessage={handleSendChatMessage}
          />
        );
      case 'more':
        return (
          <MorePage
            trip={trip}
            currentUser={currentUser}
            accounts={accounts}
            theme={theme}
            packingList={packingList}
            budgetItems={budgetItems}
            onUpdatePackingList={setPackingList}
            onUpdateBudgetItems={setBudgetItems}
          />
        );
      default:
        return null;
    }
  };

  const isDev = import.meta.env.DEV;

  return (
    <div className="font-sans">
      <AnimationStyles />

      {currentView === 'gate' && (
        <FamilyGateScreen onGatePassed={() => setCurrentView('login')} />
      )}

      {currentView === 'login' && (
        <LoginScreen
          accounts={accounts}
          onLogin={handleLogin}
          onSupabaseLogin={supabaseMode ? handleSupabaseLogin : undefined}
          isSupabaseMode={supabaseMode}
        />
      )}

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
            setCurrentView('app');
            setCurrentPage('home');
          }}
        />
      )}

      {currentView === 'app' && currentUser && trip && (
        <>
          {renderCurrentPage()}
          <BottomNav
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            theme={getCurrentTheme()}
          />
        </>
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

      {/* Account switcher - DEV ONLY */}
      {isDev && showAccountSwitcher && currentUser && (
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
