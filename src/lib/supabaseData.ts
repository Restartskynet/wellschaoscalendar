/**
 * Supabase data layer — CRUD operations for all trip-related tables.
 * Returns typed results that can be assembled into the app's Trip type.
 * All operations respect RLS (user must be authenticated).
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

// ── Types matching Supabase schema ──────────────────────────

export type DbTrip = {
  id: string;
  name: string;
  hotel_name: string | null;
  hotel_address: string | null;
  notes: string;
  created_by: string;
  created_at: string;
};

export type DbTripMember = {
  trip_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

export type DbProfile = {
  id: string;
  username: string;
  display_name: string;
  role: 'admin' | 'user';
  avatar_emoji: string;
  color: string;
  custom_avatar_url: string | null;
  theme: string;
};

export type DbTripDay = {
  id: string;
  trip_id: string;
  date: string;
  park: string | null;
  day_index: number;
};

export type DbTimeBlock = {
  id: string;
  day_id: string;
  type: 'FAMILY' | 'PERSONAL';
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  park: string;
  notes: string;
  created_by: string | null;
};

export type DbRsvp = {
  id: string;
  block_id: string;
  user_id: string;
  trip_id: string | null;
  status: 'going' | 'not-going';
  quip: string | null;
};

export type DbMessage = {
  id: string;
  trip_id: string | null;
  block_id: string | null;
  user_id: string;
  message: string;
  created_at: string;
};

export type DbBudgetExpense = {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_with: string[];
  created_by: string;
  created_at: string;
};

export type DbPackingBaseItem = {
  id: string;
  trip_id: string;
  item: string;
  added_by: string;
};

export type DbPackingCheck = {
  id: string;
  base_item_id: string;
  user_id: string;
  packed: boolean;
};

export type DbQuestionnaireResponse = {
  id: string;
  questionnaire_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  completed: boolean;
  submitted_at: string | null;
};

export type DbPersonalPackingItem = {
  id: string;
  trip_id: string;
  user_id: string;
  item: string;
  packed: boolean;
};

// ── Guard ──────────────────────────────────────────────────

function requireSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase;
}

// ── Trip queries ───────────────────────────────────────────

/** Get the first trip the current user is a member of */
export async function fetchActiveTrip(): Promise<{ trip: DbTrip; membership: DbTripMember } | null> {
  const sb = requireSupabase();
  const { data: memberships } = await sb
    .from('trip_members')
    .select('*')
    .limit(1)
    .single();

  if (!memberships) return null;

  const { data: trip } = await sb
    .from('trips')
    .select('*')
    .eq('id', memberships.trip_id)
    .single();

  if (!trip) return null;
  return { trip: trip as DbTrip, membership: memberships as DbTripMember };
}

/** Get all members of a trip (with profiles) */
export async function fetchTripMembers(tripId: string): Promise<(DbTripMember & { profile: DbProfile })[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('trip_members')
    .select('*, profile:profiles(*)')
    .eq('trip_id', tripId);
  return (data || []) as (DbTripMember & { profile: DbProfile })[];
}

/** Get all days for a trip, ordered by date */
export async function fetchTripDays(tripId: string): Promise<DbTripDay[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: true });
  return (data || []) as DbTripDay[];
}

/** Get all time blocks for a set of day IDs */
export async function fetchTimeBlocks(dayIds: string[]): Promise<DbTimeBlock[]> {
  if (dayIds.length === 0) return [];
  const sb = requireSupabase();
  const { data } = await sb
    .from('time_blocks')
    .select('*')
    .in('day_id', dayIds)
    .order('start_time', { ascending: true });
  return (data || []) as DbTimeBlock[];
}

/** Get all RSVPs for a set of block IDs */
export async function fetchRsvps(blockIds: string[]): Promise<DbRsvp[]> {
  if (blockIds.length === 0) return [];
  const sb = requireSupabase();
  const { data } = await sb
    .from('rsvps')
    .select('*')
    .in('block_id', blockIds);
  return (data || []) as DbRsvp[];
}

/** Get trip-level messages */
export async function fetchTripMessages(tripId: string): Promise<DbMessage[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('messages')
    .select('*')
    .eq('trip_id', tripId)
    .is('block_id', null)
    .order('created_at', { ascending: true });
  return (data || []) as DbMessage[];
}

/** Get event-level messages for a set of block IDs */
export async function fetchBlockMessages(blockIds: string[]): Promise<DbMessage[]> {
  if (blockIds.length === 0) return [];
  const sb = requireSupabase();
  const { data } = await sb
    .from('messages')
    .select('*')
    .in('block_id', blockIds)
    .order('created_at', { ascending: true });
  return (data || []) as DbMessage[];
}

/** Get budget expenses for a trip */
export async function fetchBudgetExpenses(tripId: string): Promise<DbBudgetExpense[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('budget_expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });
  return (data || []) as DbBudgetExpense[];
}

/** Get packing base items for a trip */
export async function fetchPackingBaseItems(tripId: string): Promise<DbPackingBaseItem[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('packing_base_items')
    .select('*')
    .eq('trip_id', tripId);
  return (data || []) as DbPackingBaseItem[];
}

/** Get packing checks for a set of base item IDs */
export async function fetchPackingChecks(baseItemIds: string[]): Promise<DbPackingCheck[]> {
  if (baseItemIds.length === 0) return [];
  const sb = requireSupabase();
  const { data } = await sb
    .from('packing_checks')
    .select('*')
    .in('base_item_id', baseItemIds);
  return (data || []) as DbPackingCheck[];
}

/** Get questionnaire responses for a user within a trip's questionnaires */
export async function fetchQuestionnaireResponses(tripId: string): Promise<DbQuestionnaireResponse[]> {
  const sb = requireSupabase();
  // First get questionnaire IDs for this trip
  const { data: questionnaires } = await sb
    .from('questionnaires')
    .select('id')
    .eq('trip_id', tripId);

  if (!questionnaires || questionnaires.length === 0) return [];

  const qIds = questionnaires.map((q: { id: string }) => q.id);
  const { data } = await sb
    .from('questionnaire_responses')
    .select('*')
    .in('questionnaire_id', qIds);
  return (data || []) as DbQuestionnaireResponse[];
}

/** Get personal packing items for a trip (RLS restricts to current user's items) */
export async function fetchPersonalPackingItems(tripId: string): Promise<DbPersonalPackingItem[]> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('personal_packing_items')
    .select('*')
    .eq('trip_id', tripId);
  return (data || []) as DbPersonalPackingItem[];
}

// ── Mutations ──────────────────────────────────────────────

/** Create a new trip */
export async function createTrip(name: string, userId: string): Promise<DbTrip | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('trips')
    .insert({ name, created_by: userId })
    .select()
    .single();

  if (error || !data) return null;

  // Add creator as admin member
  await sb.from('trip_members').insert({
    trip_id: data.id,
    user_id: userId,
    role: 'admin',
  });

  return data as DbTrip;
}

/** Add a trip day */
export async function addTripDay(tripId: string, date: string, park: string | null, dayIndex: number): Promise<DbTripDay | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('trip_days')
    .insert({ trip_id: tripId, date, park, day_index: dayIndex })
    .select()
    .single();
  return data as DbTripDay | null;
}

/** Add a time block */
export async function addTimeBlock(block: Omit<DbTimeBlock, 'id'>): Promise<DbTimeBlock | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('time_blocks')
    .insert(block)
    .select()
    .single();
  return data as DbTimeBlock | null;
}

/** Update a time block */
export async function updateTimeBlock(id: string, updates: Partial<DbTimeBlock>): Promise<DbTimeBlock | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('time_blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return data as DbTimeBlock | null;
}

/** Delete a time block */
export async function deleteTimeBlock(id: string): Promise<boolean> {
  const sb = requireSupabase();
  const { error } = await sb.from('time_blocks').delete().eq('id', id);
  return !error;
}

/** Upsert an RSVP (trip_id required for RLS integrity check) */
export async function upsertRsvp(blockId: string, userId: string, status: 'going' | 'not-going', quip?: string, tripId?: string): Promise<DbRsvp | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('rsvps')
    .upsert(
      { block_id: blockId, user_id: userId, status, quip: quip || null, ...(tripId ? { trip_id: tripId } : {}) },
      { onConflict: 'block_id,user_id' }
    )
    .select()
    .single();
  return data as DbRsvp | null;
}

/** Send a message (trip or event chat) */
export async function sendMessage(msg: {
  trip_id?: string;
  block_id?: string;
  user_id: string;
  message: string;
}): Promise<DbMessage | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('messages')
    .insert(msg)
    .select()
    .single();
  return data as DbMessage | null;
}

/** Add a budget expense */
export async function addBudgetExpense(expense: Omit<DbBudgetExpense, 'id' | 'created_at'>): Promise<DbBudgetExpense | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('budget_expenses')
    .insert(expense)
    .select()
    .single();
  return data as DbBudgetExpense | null;
}

/** Update a budget expense */
export async function updateBudgetExpense(id: string, updates: Partial<DbBudgetExpense>): Promise<DbBudgetExpense | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('budget_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return data as DbBudgetExpense | null;
}

/** Delete a budget expense */
export async function deleteBudgetExpense(id: string): Promise<boolean> {
  const sb = requireSupabase();
  const { error } = await sb.from('budget_expenses').delete().eq('id', id);
  return !error;
}

/** Add a packing base item */
export async function addPackingBaseItem(tripId: string, item: string, addedBy: string): Promise<DbPackingBaseItem | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('packing_base_items')
    .insert({ trip_id: tripId, item, added_by: addedBy })
    .select()
    .single();
  return data as DbPackingBaseItem | null;
}

/** Delete a packing base item */
export async function deletePackingBaseItem(id: string): Promise<boolean> {
  const sb = requireSupabase();
  const { error } = await sb.from('packing_base_items').delete().eq('id', id);
  return !error;
}

/** Upsert a packing check */
export async function upsertPackingCheck(baseItemId: string, userId: string, packed: boolean): Promise<DbPackingCheck | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('packing_checks')
    .upsert(
      { base_item_id: baseItemId, user_id: userId, packed },
      { onConflict: 'base_item_id,user_id' }
    )
    .select()
    .single();
  return data as DbPackingCheck | null;
}

/** Save questionnaire response */
export async function saveQuestionnaireResponse(
  questionnaireId: string,
  userId: string,
  answers: Record<string, unknown>,
  completed: boolean
): Promise<DbQuestionnaireResponse | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('questionnaire_responses')
    .upsert(
      {
        questionnaire_id: questionnaireId,
        user_id: userId,
        answers,
        completed,
        submitted_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'questionnaire_id,user_id' }
    )
    .select()
    .single();
  return data as DbQuestionnaireResponse | null;
}

/** Create a personal packing item */
export async function createPersonalPackingItem(tripId: string, userId: string, item: string): Promise<DbPersonalPackingItem | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('personal_packing_items')
    .insert({ trip_id: tripId, user_id: userId, item })
    .select()
    .single();
  return data as DbPersonalPackingItem | null;
}

/** Toggle a personal packing item's packed state */
export async function togglePersonalPackingItem(id: string, packed: boolean): Promise<DbPersonalPackingItem | null> {
  const sb = requireSupabase();
  const { data } = await sb
    .from('personal_packing_items')
    .update({ packed })
    .eq('id', id)
    .select()
    .single();
  return data as DbPersonalPackingItem | null;
}

/** Delete a personal packing item */
export async function deletePersonalPackingItem(id: string): Promise<boolean> {
  const sb = requireSupabase();
  const { error } = await sb.from('personal_packing_items').delete().eq('id', id);
  return !error;
}

// ── Full trip hydration ────────────────────────────────────

export type HydratedTripData = {
  trip: DbTrip;
  members: (DbTripMember & { profile: DbProfile })[];
  days: DbTripDay[];
  blocks: DbTimeBlock[];
  rsvps: DbRsvp[];
  tripMessages: DbMessage[];
  blockMessages: DbMessage[];
  budgetExpenses: DbBudgetExpense[];
  packingBaseItems: DbPackingBaseItem[];
  packingChecks: DbPackingCheck[];
  questionnaireResponses: DbQuestionnaireResponse[];
  personalPackingItems: DbPersonalPackingItem[];
};

/** Fetch all trip data in one batch */
export async function hydrateTripData(tripId: string): Promise<HydratedTripData | null> {
  try {
    const sb = requireSupabase();

    // Parallel fetch
    const [tripRes, members, days] = await Promise.all([
      sb.from('trips').select('*').eq('id', tripId).single(),
      fetchTripMembers(tripId),
      fetchTripDays(tripId),
    ]);

    if (!tripRes.data) return null;

    const dayIds = days.map((d) => d.id);
    const [blocks, tripMessages, budgetExpenses, packingBaseItems, questionnaireResponses, personalPackingItems] =
      await Promise.all([
        fetchTimeBlocks(dayIds),
        fetchTripMessages(tripId),
        fetchBudgetExpenses(tripId),
        fetchPackingBaseItems(tripId),
        fetchQuestionnaireResponses(tripId),
        fetchPersonalPackingItems(tripId),
      ]);

    const blockIds = blocks.map((b) => b.id);
    const baseItemIds = packingBaseItems.map((p) => p.id);

    const [rsvps, blockMessages, packingChecks] = await Promise.all([
      fetchRsvps(blockIds),
      fetchBlockMessages(blockIds),
      fetchPackingChecks(baseItemIds),
    ]);

    return {
      trip: tripRes.data as DbTrip,
      members,
      days,
      blocks,
      rsvps,
      tripMessages,
      blockMessages,
      budgetExpenses,
      packingBaseItems,
      packingChecks,
      questionnaireResponses,
      personalPackingItems,
    };
  } catch {
    return null;
  }
}
