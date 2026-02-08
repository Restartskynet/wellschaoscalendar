import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'wcc-cache';
const DB_VERSION = 2;

// Store names
const STORES = {
  TRIP: 'trip',
  DAYS: 'days',
  BLOCKS: 'blocks',
  RSVPS: 'rsvps',
  MESSAGES: 'messages',
  BUDGET: 'budget',
  PACKING: 'packing',
  PERSONAL_PACKING: 'personal_packing',
  QUESTIONNAIRE_RESPONSES: 'questionnaire_responses',
  META: 'meta',
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create all stores (backward-compatible: only creates missing ones)
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      },
    });
  }
  return dbPromise;
};

// Generic cache operations
export const cacheGet = async <T>(store: string, key: string): Promise<T | undefined> => {
  try {
    const db = await getDb();
    return await db.get(store, key);
  } catch {
    return undefined;
  }
};

export const cacheSet = async <T extends { id: string }>(store: string, value: T): Promise<void> => {
  try {
    const db = await getDb();
    await db.put(store, value);
  } catch {
    // Silent fail — cache is best-effort
  }
};

export const cacheGetAll = async <T>(store: string): Promise<T[]> => {
  try {
    const db = await getDb();
    return await db.getAll(store);
  } catch {
    return [];
  }
};

export const cacheClear = async (store: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.clear(store);
  } catch {
    // Silent fail
  }
};

export const cacheBulkPut = async <T extends { id: string }>(store: string, items: T[]): Promise<void> => {
  try {
    const db = await getDb();
    const tx = db.transaction(store, 'readwrite');
    await Promise.all([
      ...items.map((item) => tx.store.put(item)),
      tx.done,
    ]);
  } catch {
    // Silent fail
  }
};

// Trip-specific cache helpers
export const cacheTripData = async (tripId: string, data: {
  trip?: Record<string, unknown>;
  days?: Array<Record<string, unknown> & { id: string }>;
  blocks?: Array<Record<string, unknown> & { id: string }>;
  rsvps?: Array<Record<string, unknown> & { id: string }>;
  messages?: Array<Record<string, unknown> & { id: string }>;
  budget?: Array<Record<string, unknown> & { id: string }>;
  packing?: Array<Record<string, unknown> & { id: string }>;
  personalPacking?: Array<Record<string, unknown> & { id: string }>;
  questionnaireResponses?: Array<Record<string, unknown> & { id: string }>;
}): Promise<void> => {
  if (data.trip) await cacheSet(STORES.TRIP, { id: tripId, ...data.trip });
  if (data.days) await cacheBulkPut(STORES.DAYS, data.days);
  if (data.blocks) await cacheBulkPut(STORES.BLOCKS, data.blocks);
  if (data.rsvps) await cacheBulkPut(STORES.RSVPS, data.rsvps);
  if (data.messages) await cacheBulkPut(STORES.MESSAGES, data.messages);
  if (data.budget) await cacheBulkPut(STORES.BUDGET, data.budget);
  if (data.packing) await cacheBulkPut(STORES.PACKING, data.packing);
  if (data.personalPacking) await cacheBulkPut(STORES.PERSONAL_PACKING, data.personalPacking);
  if (data.questionnaireResponses) await cacheBulkPut(STORES.QUESTIONNAIRE_RESPONSES, data.questionnaireResponses);

  // Save last sync timestamp
  await cacheSet(STORES.META, { id: 'lastSync', tripId, timestamp: Date.now() });
};

export const getCachedTripData = async (tripId: string) => {
  const meta = await cacheGet<{ id: string; tripId: string; timestamp: number }>(STORES.META, 'lastSync');
  if (!meta || meta.tripId !== tripId) return null;

  return {
    trip: await cacheGet(STORES.TRIP, tripId),
    days: await cacheGetAll(STORES.DAYS),
    blocks: await cacheGetAll(STORES.BLOCKS),
    rsvps: await cacheGetAll(STORES.RSVPS),
    messages: await cacheGetAll(STORES.MESSAGES),
    budget: await cacheGetAll(STORES.BUDGET),
    packing: await cacheGetAll(STORES.PACKING),
    personalPacking: await cacheGetAll(STORES.PERSONAL_PACKING),
    questionnaireResponses: await cacheGetAll(STORES.QUESTIONNAIRE_RESPONSES),
    lastSync: meta.timestamp,
  };
};

export { STORES };
