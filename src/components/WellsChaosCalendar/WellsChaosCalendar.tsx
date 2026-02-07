import { useState, useCallback, useEffect, useRef } from 'react';
import { PRESET_ACCOUNTS } from '../../data/accounts';
import { THEMES } from '../../data/themes';
import { useAuth } from '../../providers/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { hydrateTripData, fetchActiveTrip, sendMessage as sbSendMessage, addBudgetExpense, updateBudgetExpense, deleteBudgetExpense, addPackingBaseItem, deletePackingBaseItem, upsertPackingCheck, type HydratedTripData, type DbProfile } from '../../lib/supabaseData';
import { subscribeToTrip, unsubscribeAll } from '../../lib/realtimeSync';
import { cacheTripData, getCachedTripData } from '../../lib/localCache';
import type { Account, BudgetItem, ChatMessage, EventTheme, PackingItem, Trip } from '../../types/wellsChaos';
import type { ThemeKey } from '../../data/themes';
import AccountSwitcher from './AccountSwitcher';
import AnimationStyles from './AnimationStyles';
import BottomNav, { type PageType } from './BottomNav';
import CalendarView from './CalendarView';
import ChatPage from './ChatPage';
import CreateTripForm from './CreateTripForm';
import DesktopLayout from './DesktopLayout';
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

// ── Helpers: Convert Supabase data → app types ─────────────

function profileToAccount(profile: DbProfile): Account {
  return {
    username: profile.username,
    password: '',
    name: profile.display_name,
    role: profile.role === 'admin' ? 'admin' : 'user',
    defaultAvatar: profile.avatar_emoji,
    color: profile.color,
    customAvatar: profile.custom_avatar_url,
    theme: (profile.theme || 'Default') as ThemeKey,
  };
}

function assembleFromSupabase(data: HydratedTripData): {
  trip: Trip;
  accounts: Account[];
  chatMessages: ChatMessage[];
  budgetItems: BudgetItem[];
  packingList: PackingItem[];
  profileMap: Map<string, DbProfile>;
} {
  const profileMap = new Map<string, DbProfile>();
  const accounts: Account[] = [];
  for (const m of data.members) {
    profileMap.set(m.user_id, m.profile);
    accounts.push(profileToAccount(m.profile));
  }

  const usernameForId = (uid: string) => profileMap.get(uid)?.username || uid;

  // Assemble RSVPs by block
  const rsvpsByBlock = new Map<string, { username: string; status: 'going' | 'not-going'; quip?: string }[]>();
  for (const r of data.rsvps) {
    if (!rsvpsByBlock.has(r.block_id)) rsvpsByBlock.set(r.block_id, []);
    rsvpsByBlock.get(r.block_id)!.push({
      username: usernameForId(r.user_id),
      status: r.status,
      quip: r.quip || undefined,
    });
  }

  // Block messages
  const chatsByBlock = new Map<string, ChatMessage[]>();
  for (const m of data.blockMessages) {
    if (!m.block_id) continue;
    if (!chatsByBlock.has(m.block_id)) chatsByBlock.set(m.block_id, []);
    chatsByBlock.get(m.block_id)!.push({
      username: usernameForId(m.user_id),
      message: m.message,
      timestamp: new Date(m.created_at),
    });
  }

  // Blocks by day
  const blocksByDay = new Map<string, typeof data.blocks[0][]>();
  for (const b of data.blocks) {
    if (!blocksByDay.has(b.day_id)) blocksByDay.set(b.day_id, []);
    blocksByDay.get(b.day_id)!.push(b);
  }

  const days = data.days.map((d) => ({
    date: new Date(d.date + 'T00:00:00'),
    park: d.park,
    blocks: (blocksByDay.get(d.id) || []).map((b) => ({
      type: b.type as 'FAMILY' | 'PERSONAL',
      title: b.title,
      startTime: b.start_time,
      endTime: b.end_time,
      location: b.location,
      park: b.park,
      notes: b.notes,
      rsvps: rsvpsByBlock.get(b.id) || [],
      chats: chatsByBlock.get(b.id) || [],
    })),
  }));

  const trip: Trip = {
    name: data.trip.name,
    members: accounts,
    days,
    hotel: data.trip.hotel_name ? { name: data.trip.hotel_name, address: data.trip.hotel_address || '' } : null,
    notes: data.trip.notes,
  };

  const chatMessages: ChatMessage[] = data.tripMessages.map((m) => ({
    username: usernameForId(m.user_id),
    message: m.message,
    timestamp: new Date(m.created_at),
  }));

  const budgetItems: BudgetItem[] = data.budgetExpenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    paidBy: usernameForId(e.paid_by),
    splitWith: e.split_with.map((uid) => usernameForId(uid)),
  }));

  const checkMap = new Map<string, boolean>();
  for (const c of data.packingChecks) checkMap.set(c.base_item_id, c.packed);

  const packingList: PackingItem[] = data.packingBaseItems.map((p) => ({
    id: p.id,
    item: p.item,
    packed: checkMap.get(p.id) || false,
    addedBy: usernameForId(p.added_by),
  }));

  return { trip, accounts, chatMessages, budgetItems, packingList, profileMap };
}

// ── Main Component ─────────────────────────────────────────

const WellsChaosCalendar = () => {
  const supabaseMode = isSupabaseConfigured();
  const auth = useAuth();

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

  // Supabase trip context
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [profileMap, setProfileMap] = useState<Map<string, DbProfile>>(new Map());

  // Focus mode: hides BottomNav when a questionnaire is active
  const [focusMode, setFocusMode] = useState(false);
  const handleFocusModeChange = useCallback((active: boolean) => setFocusMode(active), []);

  // Page data state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>(DEFAULT_PACKING_LIST);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(DEFAULT_BUDGET_ITEMS);

  const getCurrentTheme = (): EventTheme => {
    if (!currentUser) return THEMES.Default;
    return THEMES[currentUser.theme] || THEMES.Default;
  };

  // ── Supabase: load trip after login ──────────────────────

  const realtimeCleanupRef = useRef<(() => void) | null>(null);

  const loadSupabaseTrip = useCallback(async () => {
    if (!supabaseMode) return;
    try {
      const active = await fetchActiveTrip();
      if (!active) {
        setCurrentView('welcome');
        return;
      }

      const tid = active.trip.id;
      setActiveTripId(tid);

      // Fast-open: try loading from IndexedDB cache first
      try {
        const cached = await getCachedTripData(tid);
        if (cached && cached.trip) {
          // Show cached data immediately while we hydrate from server
          // (cached data is best-effort, may be stale)
        }
      } catch {
        // Cache miss is fine
      }

      // Hydrate from Supabase (source of truth)
      const data = await hydrateTripData(tid);
      if (!data) {
        setCurrentView('welcome');
        return;
      }

      const assembled = assembleFromSupabase(data);
      setTrip(assembled.trip);
      setAccounts(assembled.accounts);
      setChatMessages(assembled.chatMessages);
      setBudgetItems(assembled.budgetItems);
      setPackingList(assembled.packingList);
      setProfileMap(assembled.profileMap);
      setCurrentView('app');
      setCurrentPage('home');

      // Write to cache for next fast-open
      cacheTripData(tid, {
        trip: data.trip as unknown as Record<string, unknown>,
        days: data.days.map((d) => ({ ...d, id: d.id })),
        blocks: data.blocks.map((b) => ({ ...b, id: b.id })),
        rsvps: data.rsvps.map((r) => ({ ...r, id: r.id })),
        messages: [...data.tripMessages, ...data.blockMessages].map((m) => ({ ...m, id: m.id })),
        budget: data.budgetExpenses.map((e) => ({ ...e, id: e.id })),
        packing: data.packingBaseItems.map((p) => ({ ...p, id: p.id })),
      }).catch(() => {});

      // Subscribe to realtime changes
      if (realtimeCleanupRef.current) realtimeCleanupRef.current();
      realtimeCleanupRef.current = subscribeToTrip(tid, (payload) => {
        // On realtime change, refetch the full dataset
        // A more granular approach would patch individual items,
        // but full refetch is simpler and correct
        hydrateTripData(tid).then((freshData) => {
          if (!freshData) return;
          const fresh = assembleFromSupabase(freshData);
          setTrip(fresh.trip);
          setAccounts(fresh.accounts);
          setChatMessages(fresh.chatMessages);
          setBudgetItems(fresh.budgetItems);
          setPackingList(fresh.packingList);
          setProfileMap(fresh.profileMap);
        }).catch(() => {});
      });
    } catch {
      setCurrentView('welcome');
    }
  }, [supabaseMode]);

  // Cleanup realtime on unmount or logout
  useEffect(() => {
    return () => {
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current();
        realtimeCleanupRef.current = null;
      }
      unsubscribeAll();
    };
  }, []);

  // ── Auth handlers ────────────────────────────────────────

  const handleLogin = (account: Account) => {
    setCurrentUser(account);
    setCurrentView('welcome');
  };

  const handleSupabaseLogin = async (username: string, password: string): Promise<{ error: string | null }> => {
    const deviceId = getDeviceId();
    const deviceToken = getDeviceToken() || '';
    const result = await auth.signIn(username, password, deviceId, deviceToken);

    if (!result.error) {
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
      // Try to load existing trip from Supabase
      // The effect below will handle the actual loading
      setCurrentView('welcome');
    }

    return result;
  };

  // After Supabase login, try to load existing trip
  useEffect(() => {
    if (supabaseMode && currentView === 'welcome' && currentUser && auth.user) {
      loadSupabaseTrip();
    }
  }, [supabaseMode, currentView, currentUser, auth.user, loadSupabaseTrip]);

  // Hydrate currentUser from profile when available
  useEffect(() => {
    if (auth.profile && currentUser) {
      const updated = profileToAccount(auth.profile);
      setCurrentUser(updated);
    }
  }, [auth.profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    // Cleanup realtime subscriptions
    if (realtimeCleanupRef.current) {
      realtimeCleanupRef.current();
      realtimeCleanupRef.current = null;
    }
    unsubscribeAll();

    if (supabaseMode) {
      await auth.signOut();
    }
    setCurrentUser(null);
    setCurrentView('login');
    setTrip(null);
    setActiveTripId(null);
    setProfileMap(new Map());
    setCurrentPage('home');
    setChatMessages([]);
    setBudgetItems(DEFAULT_BUDGET_ITEMS);
    setPackingList(DEFAULT_PACKING_LIST);
  };

  // ── Supabase-backed mutation callbacks ───────────────────

  const usernameToUserId = useCallback((username: string): string => {
    for (const [uid, profile] of profileMap) {
      if (profile.username === username) return uid;
    }
    return username; // fallback
  }, [profileMap]);

  const handleSendChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);

    // Write to Supabase if configured
    if (supabaseMode && activeTripId && auth.user) {
      sbSendMessage({
        trip_id: activeTripId,
        user_id: auth.user.id,
        message: message.message,
      }).catch(() => {}); // best-effort
    }
  }, [supabaseMode, activeTripId, auth.user]);

  const handleUpdateBudgetItems = useCallback((items: BudgetItem[]) => {
    setBudgetItems((prev) => {
      // Detect what changed
      if (supabaseMode && activeTripId && auth.user) {
        // New item added
        if (items.length > prev.length) {
          const newItem = items[items.length - 1];
          addBudgetExpense({
            trip_id: activeTripId,
            description: newItem.description,
            amount: newItem.amount,
            paid_by: usernameToUserId(newItem.paidBy),
            split_with: newItem.splitWith.map(usernameToUserId),
            created_by: auth.user.id,
          }).catch(() => {});
        }
        // Item deleted
        else if (items.length < prev.length) {
          const removedIds = prev
            .filter((p) => !items.find((i) => i.id === p.id))
            .map((p) => p.id);
          for (const id of removedIds) {
            deleteBudgetExpense(id).catch(() => {});
          }
        }
        // Item updated
        else {
          for (const item of items) {
            const old = prev.find((p) => p.id === item.id);
            if (old && (old.description !== item.description || old.amount !== item.amount)) {
              updateBudgetExpense(item.id, {
                description: item.description,
                amount: item.amount,
                paid_by: usernameToUserId(item.paidBy),
                split_with: item.splitWith.map(usernameToUserId),
              }).catch(() => {});
            }
          }
        }
      }
      return items;
    });
  }, [supabaseMode, activeTripId, auth.user, usernameToUserId]);

  const handleUpdatePackingList = useCallback((items: PackingItem[]) => {
    setPackingList((prev) => {
      if (supabaseMode && activeTripId && auth.user) {
        // New item added
        if (items.length > prev.length) {
          const newItem = items[items.length - 1];
          addPackingBaseItem(activeTripId, newItem.item, auth.user.id).catch(() => {});
        }
        // Item deleted
        else if (items.length < prev.length) {
          const removedIds = prev
            .filter((p) => !items.find((i) => i.id === p.id))
            .map((p) => p.id);
          for (const id of removedIds) {
            deletePackingBaseItem(id).catch(() => {});
          }
        }
        // Check toggled
        else {
          for (const item of items) {
            const old = prev.find((p) => p.id === item.id);
            if (old && old.packed !== item.packed) {
              upsertPackingCheck(item.id, auth.user.id, item.packed).catch(() => {});
            }
          }
        }
      }
      return items;
    });
  }, [supabaseMode, activeTripId, auth.user]);

  // ── Render pages ─────────────────────────────────────────

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
            onUpdatePackingList={handleUpdatePackingList}
            onUpdateBudgetItems={handleUpdateBudgetItems}
            onFocusModeChange={handleFocusModeChange}
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
          {/* Mobile: bottom nav (hidden during questionnaire focus mode) */}
          <div className="lg:hidden">
            {renderCurrentPage()}
            {!focusMode && (
              <BottomNav
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                theme={getCurrentTheme()}
              />
            )}
          </div>

          {/* Desktop: sidebar layout */}
          <DesktopLayout
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            theme={getCurrentTheme()}
            tripName={trip.name}
          >
            {renderCurrentPage()}
          </DesktopLayout>
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
