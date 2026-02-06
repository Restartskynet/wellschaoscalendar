import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type ChangeHandler = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
}) => void;

let channel: RealtimeChannel | null = null;

const SYNC_TABLES = [
  'time_blocks',
  'rsvps',
  'messages',
  'budget_expenses',
  'packing_base_items',
  'packing_checks',
  'trip_days',
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

  SYNC_TABLES.forEach((table) => {
    channel!
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
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
  });

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
