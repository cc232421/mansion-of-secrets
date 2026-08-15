import { get, set, del } from 'idb-keyval';
import type { Item } from '../data/items';
import type { Order } from '../data/orders';
import type { GameState } from '../stores/gameStore';

const SAVE_KEY = 'mansion_of_secrets_save';

// Simplified version for IndexedDB storage
interface StoredSave {
  version: string;
  lastSaved: string;
  coins: number;
  energy: number;
  energyLastUpdate: number;
  board: (SerializedItem | null)[];
  orders: SerializedOrder[];
  orderRefreshAt: string;
  storyProgress: number;
  currentChapter: number;
  seenCutscenes: string[];
}

interface SerializedItem {
  id: string;
  level: number;
  type: string;
}

interface SerializedOrder {
  id: string;
  description: string;
  requirements: { level: number; type: string; count: number }[];
  rewardCoins: number;
  energyCost: number;
  completed: boolean;
  expired: boolean;
}

export async function saveGame(state: GameState): Promise<void> {
  const stored: StoredSave = {
    version: state.version,
    lastSaved: new Date().toISOString(),
    coins: state.coins,
    energy: state.energy,
    energyLastUpdate: state.energyLastUpdate,
    board: state.board.map((item: Item | null) => item ? { id: item.id, level: item.level, type: item.type } : null) as (SerializedItem | null)[],
    orders: state.orders.map((o: Order) => ({
      id: o.id,
      description: o.description,
      requirements: o.requirements,
      rewardCoins: o.rewardCoins,
      energyCost: o.energyCost,
      completed: o.completed,
      expired: o.expired,
    })),
    orderRefreshAt: state.orderRefreshAt,
    storyProgress: state.storyProgress,
    currentChapter: state.currentChapter,
    seenCutscenes: state.seenCutscenes,
  };

  await set(SAVE_KEY, stored);
}

export async function loadGame(): Promise<StoredSave | null> {
  try {
    const saved = await get<StoredSave>(SAVE_KEY);
    return saved || null;
  } catch (e) {
    console.error('Failed to load save:', e);
    return null;
  }
}

export async function deleteSave(): Promise<void> {
  await del(SAVE_KEY);
}
