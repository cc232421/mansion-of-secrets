import { create } from 'zustand';
import { Item, ItemLevel, ItemType, createRandomL1Item, createItem, getItemConfig, canMerge } from '../data/items';
import { Order, OrderTemplate, ORDER_TEMPLATES } from '../data/orders';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Evidence {
  id: string;
  type: 'key' | 'photo' | 'crystal';
  roomId: string;
  teaserShown: boolean;
  obtained: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  requiredEvidenceCount: number; // 只需数量，不需特定ID
  unlocked: boolean;
  teaserCutsceneId: string;
  fullCutsceneId: string;
  chapter: number;
  icon: string;
}

export interface GameState {
  version: string;
  lastSaved: string;
  coins: number;
  energy: number;
  energyLastUpdate: number;
  board: (Item | null)[];
  orders: Order[];
  orderRefreshAt: string;
  evidence: Evidence[];
  rooms: Room[];
  storyProgress: number;
  currentChapter: number;
  seenCutscenes: string[];
  spendEnergy: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setBoardItems: (items: { index: number; item: Item | null }[]) => void;
  fulfillOrder: (orderId: string) => { success: boolean; message?: string };
  advanceStory: (progress: number) => void;
  markCutsceneSeen: (cutsceneId: string) => void;
  unlockRoom: (roomId: string) => void;
  checkAndUnlockRooms: () => void;
  calculateCurrentEnergy: () => number;
  buyEnergy: () => boolean;
  refreshOrders: () => void;
  reset: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_ENERGY = 120;
const ENERGY_REGEN_SECONDS = 150; // 2.5分钟回复满
const MAX_ENERGY = 120;
const ENERGY_BUY_COST = 100;
const ENERGY_BUY_AMOUNT = 30;
const INITIAL_BOARD_SIZE = 8;

// ─── Room definitions ────────────────────────────────────────────────────────

const INITIAL_ROOMS: Room[] = [
  { id: 'study',      name: '书房',              description: '父亲最后的秘密...',     requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_study',      chapter: 1, icon: '📚' },
  { id: 'gallery',    name: '画廊',              description: '画像的目光如影随形...', requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_gallery',    chapter: 1, icon: '🖼️' },
  { id: 'wine_cellar',name: '酒窖',              description: '地下室的脚步声...',        requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_cellar',     chapter: 2, icon: '🍷' },
  { id: 'accounting', name: '账房',              description: '伪造的签名...',              requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_accounting', chapter: 2, icon: '💰' },
  { id: 'grandma',    name: '祖母房',            description: '祖母什么都知道...',         requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_grandma',    chapter: 3, icon: '👵' },
  { id: 'secret',     name: '密室',              description: '壁炉后的秘密...',            requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_secret',     chapter: 3, icon: '🔥' },
  { id: 'attic',      name: '阁楼',             description: '最终的真相...',             requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_attic',      chapter: 3, icon: '🏛️' },
  { id: 'exit',       name: '出口',             description: '自由...还是真相?',            requiredEvidenceCount: 3, unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_ending',     chapter: 3, icon: '🚪' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateEnergy(lastUpdate: number, storedEnergy: number): number {
  const now = Date.now();
  const secondsElapsed = (now - lastUpdate) / 1000;
  const energyGained = Math.floor(secondsElapsed / ENERGY_REGEN_SECONDS);
  return Math.min(MAX_ENERGY, storedEnergy + energyGained);
}

function initBoard(): (Item | null)[] {
  const board: (Item | null)[] = new Array(36).fill(null);
  for (let i = 0; i < INITIAL_BOARD_SIZE; i++) {
    board[i] = createRandomL1Item();
  }
  return board;
}

function initOrders(): Order[] {
  const indices = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 4);
  return indices.map(idx => makeOrder(ORDER_TEMPLATES[idx], `init_${idx}`));
}

function makeOrder(template: OrderTemplate, suffix: string): Order {
  return {
    id: `order_${Date.now()}_${suffix}`,
    description: template.description,
    requirements: template.requirements.map(r => ({ ...r })),
    rewardCoins: template.rewardCoins,
    energyCost: template.energyCost,
    completed: false,
    expired: false,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  version: '1.0.0',
  lastSaved: new Date().toISOString(),
  coins: 500,
  energy: INITIAL_ENERGY,
  energyLastUpdate: Date.now(),
  board: initBoard(),
  orders: initOrders(),
  orderRefreshAt: new Date().toISOString().split('T')[0],
  evidence: [],
  rooms: INITIAL_ROOMS,
  storyProgress: 0,
  currentChapter: 1,
  seenCutscenes: [],

  spendEnergy: (amount) => {
    const state = get();
    const current = state.calculateCurrentEnergy();
    if (current < amount) return false;
    set({ energy: current - amount, energyLastUpdate: Date.now() });
    return true;
  },

  addEnergy: (amount) => {
    const state = get();
    const current = state.calculateCurrentEnergy();
    set({ energy: Math.min(MAX_ENERGY, current + amount), energyLastUpdate: Date.now() });
  },

  addCoins: (amount) => set(state => ({ coins: state.coins + amount })),

  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set(state => ({ coins: state.coins - amount }));
    return true;
  },

  setBoardItems: (items) => {
    set(state => {
      const newBoard = [...state.board];
      for (const { index, item } of items) {
        newBoard[index] = item;
      }
      return { board: newBoard };
    });
  },

  fulfillOrder: (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    if (order.completed) return { success: false, message: 'Already completed' };

    // Check energy first (do NOT deduct yet)
    const currentEnergy = state.calculateCurrentEnergy();
    if (currentEnergy < order.energyCost) {
      return { success: false, message: `Not enough energy (need ${order.energyCost})` };
    }

    // Check if player has enough items
    const required: number[] = [];
    for (const req of order.requirements) {
      let needed = req.count;
      for (let i = 0; i < 36; i++) {
        const item = state.board[i];
        if (!item) continue;
        if (item.level === req.level && item.type === req.type && needed > 0 && !required.includes(i)) {
          required.push(i);
          needed--;
        }
      }
      if (needed > 0) {
        return { success: false, message: `Need ${needed} more L${req.level} ${req.type}` };
      }
    }

    // All checks passed — NOW deduct energy
    set({ energy: currentEnergy - order.energyCost, energyLastUpdate: Date.now() });

    // Remove consumed items
    const newBoard = [...state.board];
    const consumed = new Set(required);
    for (let i = 35; i >= 0; i--) {
      if (consumed.has(i)) newBoard[i] = null;
    }

    // Mark order completed
    const newOrders = state.orders.map(o =>
      o.id === orderId ? { ...o, completed: true } : o
    );

    // Award coins
    const newCoins = state.coins + order.rewardCoins;

    // L4 order → 40% evidence drop
    let newEvidence = [...state.evidence];
    let newStoryProgress = state.storyProgress;
    let message = `Order complete! +${order.rewardCoins} coins`;

    // Advance story for ALL order completions (scaled by level)
    const progressByLevel: Record<number, number> = { 1: 1, 2: 2, 3: 5, 4: 10 };
    const maxReqLevel = Math.max(...order.requirements.map(r => r.level));
    newStoryProgress = Math.min(100, state.storyProgress + (progressByLevel[maxReqLevel] ?? 1));

    const hasL4 = order.requirements.some(r => r.level === 4);
    if (hasL4 && Math.random() < 0.4) {
      const types: ('key' | 'photo' | 'crystal')[] = ['key', 'photo', 'crystal'];
      const type = types[Math.floor(Math.random() * types.length)];

      // Find a locked room with room for more evidence
      const roomsNeedingEvidence = state.rooms.filter(r => !r.unlocked);
      if (roomsNeedingEvidence.length > 0) {
        const room = roomsNeedingEvidence[Math.floor(Math.random() * roomsNeedingEvidence.length)];
        const currentCount = newEvidence.filter(e => e.roomId === room.id).length;

        if (currentCount < room.requiredEvidenceCount) {
          const evidenceId = `${type}_${room.id}_${Date.now()}`;
          newEvidence.push({ id: evidenceId, type, roomId: room.id, teaserShown: false, obtained: true });
          newStoryProgress = Math.min(100, state.storyProgress + 5);
          message += ` | 🔍 Evidence found for "${room.name}"!`;

          // Check if room just got unlocked
          const newCount = newEvidence.filter(e => e.roomId === room.id).length;
          if (newCount >= room.requiredEvidenceCount && !room.unlocked) {
            message += ` | 🚪 "${room.name}" UNLOCKED!`;
          }
        }
      }
    }

    set({
      board: newBoard,
      orders: newOrders,
      coins: newCoins,
      evidence: newEvidence,
      storyProgress: newStoryProgress,
    });

    // Check if any rooms should now be unlocked
    get().checkAndUnlockRooms();

    return { success: true, message };
  },

  advanceStory: (progress) => {
    set(state => ({
      storyProgress: Math.min(100, state.storyProgress + progress),
    }));
  },

  markCutsceneSeen: (cutsceneId) => {
    set(state => ({
      seenCutscenes: [...state.seenCutscenes, cutsceneId],
    }));
  },

  unlockRoom: (roomId) => {
    set(state => ({
      rooms: state.rooms.map(r =>
        r.id === roomId ? { ...r, unlocked: true } : r
      ),
    }));
  },

  // Check if any room has enough evidence to unlock
  checkAndUnlockRooms: () => {
    const state = get();
    let changed = false;
    const newRooms = state.rooms.map(room => {
      if (room.unlocked) return room;
      const count = state.evidence.filter(e => e.roomId === room.id).length;
      if (count >= room.requiredEvidenceCount) {
        changed = true;
        return { ...room, unlocked: true };
      }
      return room;
    });
    if (changed) set({ rooms: newRooms });
  },

  calculateCurrentEnergy: () => {
    const { energy, energyLastUpdate } = get();
    return calculateEnergy(energyLastUpdate, energy);
  },

  buyEnergy: () => {
    const state = get();
    if (state.coins < ENERGY_BUY_COST) return false;
    const current = state.calculateCurrentEnergy();
    if (current >= MAX_ENERGY) return false;
    set({
      coins: state.coins - ENERGY_BUY_COST,
      energy: Math.min(MAX_ENERGY, current + ENERGY_BUY_AMOUNT),
      energyLastUpdate: Date.now(),
    });
    return true;
  },

  refreshOrders: () => {
    const indices = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 4);
    const newOrders = indices.map((idx, i) => makeOrder(ORDER_TEMPLATES[idx], `refresh_${i}`));
    set({ orders: newOrders, orderRefreshAt: new Date().toISOString().split('T')[0] });
  },

  reset: () => {
    set({
      coins: 500,
      energy: INITIAL_ENERGY,
      energyLastUpdate: Date.now(),
      board: initBoard(),
      orders: initOrders(),
      evidence: [],
      rooms: INITIAL_ROOMS.map(r => ({ ...r, unlocked: false })),
      storyProgress: 0,
      currentChapter: 1,
      seenCutscenes: [],
    });
  },
}));

// ─── Energy auto-regen timer ─────────────────────────────────────────────────
// Every 5 seconds, bump energyLastUpdate so calculateCurrentEnergy recalculates
// This keeps the energy bar moving in real-time without RAF loops

let energyTimer: ReturnType<typeof setInterval> | null = null;

export function startEnergyTimer() {
  if (energyTimer) return;
  energyTimer = setInterval(() => {
    useGameStore.setState({ energyLastUpdate: Date.now() });
  }, 5000);
}

export function stopEnergyTimer() {
  if (energyTimer) {
    clearInterval(energyTimer);
    energyTimer = null;
  }
}
