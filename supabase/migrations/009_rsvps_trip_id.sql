-- 009: Add trip_id to rsvps for trip-scoped queries and realtime filtering
-- Idempotent: safe to re-run

-- 1. Add column (nullable initially for backfill)
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE;

-- 2. Backfill: rsvps -> time_blocks -> trip_days -> trip_id
-- time_blocks has day_id (references trip_days), trip_days has trip_id
UPDATE public.rsvps
SET trip_id = td.trip_id
FROM public.time_blocks tb
JOIN public.trip_days td ON td.id = tb.day_id
WHERE rsvps.block_id = tb.id
  AND rsvps.trip_id IS NULL;

-- 3. Index for realtime filters + queries
CREATE INDEX IF NOT EXISTS idx_rsvps_trip_id ON public.rsvps(trip_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_trip_block ON public.rsvps(trip_id, block_id);

-- 4. Update RLS policies to use trip_id
-- Note: We keep trip_id nullable in schema to handle any orphaned rows,
-- but new inserts MUST provide trip_id (enforced by RLS + app logic).

-- SELECT: members can read all RSVPs in their trip
DROP POLICY IF EXISTS "rsvps_select" ON public.rsvps;
CREATE POLICY "rsvps_select" ON public.rsvps
  FOR SELECT USING (
    public.is_trip_member(trip_id)
  );

-- INSERT: must be own RSVP, must be trip member, trip_id must match block's trip
DROP POLICY IF EXISTS "rsvps_insert" ON public.rsvps;
CREATE POLICY "rsvps_insert" ON public.rsvps
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.is_trip_member(trip_id)
    AND EXISTS (
      SELECT 1
      FROM public.time_blocks tb
      JOIN public.trip_days td ON td.id = tb.day_id
      WHERE tb.id = block_id
        AND td.trip_id = rsvps.trip_id
    )
  );

-- UPDATE: own RSVP only, trip_id must still be consistent
DROP POLICY IF EXISTS "rsvps_update" ON public.rsvps;
CREATE POLICY "rsvps_update" ON public.rsvps
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_trip_member(trip_id)
    AND EXISTS (
      SELECT 1
      FROM public.time_blocks tb
      JOIN public.trip_days td ON td.id = tb.day_id
      WHERE tb.id = block_id
        AND td.trip_id = rsvps.trip_id
    )
  );

-- DELETE: own RSVP only + must be trip member
DROP POLICY IF EXISTS "rsvps_delete" ON public.rsvps;
CREATE POLICY "rsvps_delete" ON public.rsvps
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_trip_member(trip_id)
  );
