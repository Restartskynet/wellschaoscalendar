/**
 * Realtime Sync — Supabase Postgres Changes subscriptions scoped to active trip.
 *
 * Uses postgres_changes (NOT broadcast) with RLS as the gate.
 * Tables with trip_id are filtered: trip_id=eq.<ACTIVE_TRIP_ID>.
 * Tables without direct trip_id (rsvps, packing_checks, time_blocks) subscribe
 * to all rows and rely on RLS to limit what the user sees.
 *
 * DELETE events have filtering limitations in Supabase Realtime:
 * - DELETE payloads only contain the `old` record's primary key columns
 * - Column filters (like trip_id=eq.X) do NOT work for DELETE events
 * - Handle deletes defensively client-side by checking if the record belongs to the trip
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type ChangeHandler = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
}) => void;

let channel: RealtimeChannel | null = null;

// Tables with direct trip_id column — filtered for INSERT/UPDATE,
// but DELETE events bypass the filter (Supabase limitation)
const TRIP_FILTERED_TABLES = [
  'messages',
  'budget_expenses',
  'packing_base_items',
  'trip_days',
] as const;

// Tables without direct trip_id — subscribe to all, RLS gates access
const RLS_ONLY_TABLES = [
  'time_blocks',
  'rsvps',
  'packing_checks',
] as const;

export const subscribeToTrip = (tripId: string, onChange: ChangeHandler): (() => void) => {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {};
  }

  // Unsubscribe from previous channel
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }

  channel = supabase.channel(`trip:${tripId}`);

  // Tables with trip_id: filter to active trip
  for (const table of TRIP_FILTERED_TABLES) {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          table,
          new: (payload.new as Record<string, unknown>) || null,
          old: (payload.old as Record<string, unknown>) || null,
        });
      }
    );
  }

  // RLS-only tables: subscribe to all, RLS gates what the user sees
  for (const table of RLS_ONLY_TABLES) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          table,
          new: (payload.new as Record<string, unknown>) || null,
          old: (payload.old as Record<string, unknown>) || null,
        });
      }
    );
  }

  channel.subscribe();

  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
};

export const unsubscribeAll = () => {
  if (channel && supabase) {
    supabase.removeChannel(channel);
    channel = null;
  }
};
