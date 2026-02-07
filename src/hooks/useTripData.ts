/**
 * useTripData — provides Trip data from Supabase (when configured) or local state.
 *
 * When Supabase is configured:
 *   - Fetches trip data via hydrateTripData()
 *   - Assembles flat Supabase rows into the nested Trip type
 *   - All mutations write to Supabase AND update local state
 *
 * When Supabase is not configured:
 *   - Returns null (app uses local state as fallback)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  hydrateTripData,
  fetchActiveTrip,
  type HydratedTripData,
  type DbProfile,
  type DbTripMember,
} from '../lib/supabaseData';
import type { Account, Trip, TripDay, TimeBlock, RSVP, ChatMessage, BudgetItem, PackingItem } from '../types/wellsChaos';
import type { ThemeKey } from '../data/themes';

// ── Assemblers: convert Supabase rows → app types ──────────

function profileToAccount(profile: DbProfile, memberRole?: string): Account {
  return {
    username: profile.username,
    password: '',
    name: profile.display_name,
    role: (profile.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    defaultAvatar: profile.avatar_emoji,
    color: profile.color,
    customAvatar: profile.custom_avatar_url,
    theme: (profile.theme || 'Default') as ThemeKey,
  };
}

function assembleTrip(data: HydratedTripData): {
  trip: Trip;
  accounts: Account[];
  chatMessages: ChatMessage[];
  budgetItems: BudgetItem[];
  packingList: PackingItem[];
  profileMap: Map<string, DbProfile>; // userId -> profile
} {
  // Build profile map (userId -> profile)
  const profileMap = new Map<string, DbProfile>();
  const accounts: Account[] = [];
  for (const m of data.members) {
    profileMap.set(m.user_id, m.profile);
    accounts.push(profileToAccount(m.profile, m.role));
  }

  // Username lookup
  const usernameForId = (userId: string): string =>
    profileMap.get(userId)?.username || userId;

  // Assemble RSVPs by block
  const rsvpsByBlock = new Map<string, RSVP[]>();
  for (const r of data.rsvps) {
    if (!rsvpsByBlock.has(r.block_id)) rsvpsByBlock.set(r.block_id, []);
    rsvpsByBlock.get(r.block_id)!.push({
      username: usernameForId(r.user_id),
      status: r.status,
      quip: r.quip || undefined,
    });
  }

  // Assemble block messages
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

  // Assemble blocks by day
  const blocksByDay = new Map<string, TimeBlock[]>();
  for (const b of data.blocks) {
    if (!blocksByDay.has(b.day_id)) blocksByDay.set(b.day_id, []);
    blocksByDay.get(b.day_id)!.push({
      type: b.type,
      title: b.title,
      startTime: b.start_time,
      endTime: b.end_time,
      location: b.location,
      park: b.park,
      notes: b.notes,
      rsvps: rsvpsByBlock.get(b.id) || [],
      chats: chatsByBlock.get(b.id) || [],
    });
  }

  // Assemble days
  const days: TripDay[] = data.days.map((d) => ({
    date: new Date(d.date + 'T00:00:00'),
    park: d.park,
    blocks: blocksByDay.get(d.id) || [],
  }));

  // Assemble trip
  const trip: Trip = {
    name: data.trip.name,
    members: accounts,
    days,
    hotel: data.trip.hotel_name
      ? { name: data.trip.hotel_name, address: data.trip.hotel_address || '' }
      : null,
    notes: data.trip.notes,
  };

  // Trip chat messages
  const chatMessages: ChatMessage[] = data.tripMessages.map((m) => ({
    username: usernameForId(m.user_id),
    message: m.message,
    timestamp: new Date(m.created_at),
  }));

  // Budget items — need to map user IDs to usernames
  const budgetItems: BudgetItem[] = data.budgetExpenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    paidBy: usernameForId(e.paid_by),
    splitWith: e.split_with.map((uid) => usernameForId(uid)),
  }));

  // Packing items — combine base items with user checks
  const checkMap = new Map<string, boolean>();
  for (const c of data.packingChecks) {
    checkMap.set(c.base_item_id, c.packed);
  }

  const packingList: PackingItem[] = data.packingBaseItems.map((p) => ({
    id: p.id,
    item: p.item,
    packed: checkMap.get(p.id) || false,
    addedBy: usernameForId(p.added_by),
  }));

  return { trip, accounts, chatMessages, budgetItems, packingList, profileMap };
}

// ── Hook ───────────────────────────────────────────────────

export type TripDataResult = {
  trip: Trip | null;
  accounts: Account[];
  chatMessages: ChatMessage[];
  budgetItems: BudgetItem[];
  packingList: PackingItem[];
  isLoading: boolean;
  error: string | null;
  tripId: string | null;
  profileMap: Map<string, DbProfile>;
  refetch: () => Promise<void>;
};

export function useTripData(): TripDataResult | null {
  const [data, setData] = useState<HydratedTripData | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const configured = isSupabaseConfigured();

  const fetchData = useCallback(async () => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find active trip
      const active = await fetchActiveTrip();
      if (!active) {
        setTripId(null);
        setData(null);
        setIsLoading(false);
        return;
      }

      setTripId(active.trip.id);

      // Hydrate full trip data
      const hydrated = await hydrateTripData(active.trip.id);
      if (mountedRef.current) {
        setData(hydrated);
        setIsLoading(false);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Failed to load trip data');
        setIsLoading(false);
      }
    }
  }, [configured]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  // Not configured => return null (use local state)
  if (!configured) return null;

  if (!data) {
    return {
      trip: null,
      accounts: [],
      chatMessages: [],
      budgetItems: [],
      packingList: [],
      isLoading,
      error,
      tripId,
      profileMap: new Map(),
      refetch: fetchData,
    };
  }

  const assembled = assembleTrip(data);

  return {
    trip: assembled.trip,
    accounts: assembled.accounts,
    chatMessages: assembled.chatMessages,
    budgetItems: assembled.budgetItems,
    packingList: assembled.packingList,
    isLoading,
    error,
    tripId,
    profileMap: assembled.profileMap,
    refetch: fetchData,
  };
}
