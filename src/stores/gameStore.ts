import { create } from 'zustand';
import { Item } from '../data/items';
import { Order, ORDER_TEMPLATES } from '../data/orders';
import { createRandomL1Item } from '../data/items';

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
  requiredEvidence: string[];
  unlocked: boolean;
  teaserCutsceneId: string;
  fullCutsceneId: string;
  chapter: number;
  icon: string;
}

export interface GameState {
  // Meta
  version: string;
  lastSaved: string;

  // Economy
  coins: number;
  energy: number;
  energyLastUpdate: number;

  // Board
  board: (Item | null)[]; // 36 slots

  // Orders
  orders: Order[];
  orderRefreshAt: string;

  // Evidence
  evidence: Evidence[];
  rooms: Room[];

  // Story
  storyProgress: number;
  currentChapter: number;
  seenCutscenes: string[];

  // Actions
  spendEnergy: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setBoardItem: (index: number, item: Item | null) => void;
  setBoardItems: (items: { index: number; item: Item | null }[]) => void;
  addOrder: (order: Order) => void;
  completeOrder: (orderId: string) => void;
  fulfillOrder: (orderId: string) => { success: boolean; error?: string };
  advanceStory: (progress: number) => void;
  markCutsceneSeen: (cutsceneId: string) => void;
  addEvidence: (type: 'key' | 'photo' | 'crystal', roomId: string) => void;
  unlockRoom: (roomId: string) => void;
  calculateCurrentEnergy: () => number;
  buyEnergy: () => boolean;
  refreshOrders: () => void;
  reset: () => void;
}

const INITIAL_ENERGY = 120;
const ENERGY_REGEN_SECONDS = 2.5 * 60;
const MAX_ENERGY = 120;
const ENERGY_BUY_COST = 100; // 金币购买能量
const ENERGY_BUY_AMOUNT = 30; // 每次购买恢复30能量

// 初始8个房间
const INITIAL_ROOMS: Room[] = [
  { id: 'study', name: 'Study', description: 'The study holds fathers last secret...', requiredEvidence: ['key_1','key_2','key_3'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_study', chapter: 1, icon: '📚' },
  { id: 'gallery', name: 'Gallery', description: 'A portrait with eyes that follow...', requiredEvidence: ['photo_1','photo_2','photo_3'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_gallery', chapter: 1, icon: '🖼️' },
  { id: 'wine_cellar', name: 'Wine Cellar', description: 'Footsteps in the basement at midnight...', requiredEvidence: ['crystal_1','crystal_2','crystal_3'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_cellar', chapter: 2, icon: '🍷' },
  { id: 'accounting', name: 'Accounting Room', description: 'A forged signature...', requiredEvidence: ['key_4','key_5','key_6'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_accounting', chapter: 2, icon: '💰' },
  { id: 'grandma', name: 'Grandma Room', description: 'Grandma knew everything...', requiredEvidence: ['photo_4','photo_5','photo_6'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_grandma', chapter: 3, icon: '👵' },
  { id: 'secret', name: 'Secret Chamber', description: 'The hidden room behind the fireplace...', requiredEvidence: ['crystal_4','crystal_5','crystal_6'], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_secret', chapter: 3, icon: '🔥' },
  { id: 'attic', name: 'Attic', description: 'The final revelation awaits...', requiredEvidence: [], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_attic', chapter: 3, icon: '🏛️' },
  { id: 'exit', name: 'The Exit', description: 'Freedom... or the truth?', requiredEvidence: [], unlocked: false, teaserCutsceneId: '', fullCutsceneId: 'cs_ending', chapter: 3, icon: '🚪' },
];

function calculateEnergy(lastUpdate: number, currentEnergy: number): number {
  const now = Date.now();
  const secondsElapsed = (now - lastUpdate) / 1000;
  const energyGained = Math.floor(secondsElapsed / ENERGY_REGEN_SECONDS);
  return Math.min(MAX_ENERGY, currentEnergy + energyGained);
}

let evidenceCounter = 0;
function makeEvidenceId(type: string, roomId: string): string {
  return `${type}_${roomId}_${++evidenceCounter}`;
}

export const useGameStore = create<GameState>((set, get) => ({
  version: '1.0.0',
  lastSaved: new Date().toISOString(),
  coins: 500,
  energy: INITIAL_ENERGY,
  energyLastUpdate: Date.now(),
  board: (() => {
    const b: (Item | null)[] = new Array(36).fill(null);
    for (let i = 0; i < 8; i++) b[i] = createRandomL1Item();
    return b;
  })(),
  orders: (() => {
    const shuffled = [0,1,2,3,4,5,6,7].sort(() => Math.random() - 0.5).slice(0, 4);
    return shuffled.map(idx => {
      const template = ORDER_TEMPLATES[idx];
      return {
        id: `order_init_${idx}`,
        description: template.description,
        requirements: [...template.requirements],
        rewardCoins: template.rewardCoins,
        energyCost: template.energyCost,
        completed: false,
        expired: false,
      };
    });
  })(),
  orderRefreshAt: new Date().toISOString().split('T')[0],
  evidence: [],
  rooms: INITIAL_ROOMS,
  storyProgress: 0,
  currentChapter: 1,
  seenCutscenes: [],

  spendEnergy: (amount) => {
    const state = get();
    const currentEnergy = state.calculateCurrentEnergy();
    if (currentEnergy < amount) return false;
    set({ energy: currentEnergy - amount, energyLastUpdate: Date.now() });
    return true;
  },

  addEnergy: (amount) => {
    const state = get();
    const currentEnergy = state.calculateCurrentEnergy();
    set({
      energy: Math.min(MAX_ENERGY, currentEnergy + amount),
      energyLastUpdate: Date.now(),
    });
  },

  addCoins: (amount) => {
    set(state => ({ coins: state.coins + amount }));
  },

  spendCoins: (amount) => {
    const state = get();
    if (state.coins < amount) return false;
    set(state => ({ coins: state.coins - amount }));
    return true;
  },

  setBoardItem: (index, item) => {
    set(state => {
      const newBoard = [...state.board];
      newBoard[index] = item;
      return { board: newBoard };
    });
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

  addOrder: (order) => {
    set(state => ({ orders: [...state.orders, order] }));
  },

  completeOrder: (orderId) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, completed: true } : o
      ),
    }));
  },

  // 核心：完成订单 — 扣能量、扣物品、掉证据
  fulfillOrder: (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };
    if (order.completed) return { success: false, error: 'Already completed' };

    const currentEnergy = state.calculateCurrentEnergy();
    if (currentEnergy < order.energyCost) {
      return { success: false, error: 'Not enough energy' };
    }

    // 检查物品是否足够
    const boardItems = state.board.map((item, idx) => ({ idx, item }));
    const requiredConsumed: number[] = [];

    for (const req of order.requirements) {
      let needed = req.count;
      for (const slot of boardItems) {
        if (!slot.item) continue;
        if (slot.item.level === req.level && slot.item.type === req.type && needed > 0) {
          if (!requiredConsumed.includes(slot.idx)) {
            requiredConsumed.push(slot.idx);
            needed--;
          }
        }
      }
      if (needed > 0) {
        return { success: false, error: `Need ${needed} more L${req.level} ${req.type}` };
      }
    }

    // 扣除能量
    set({ energy: currentEnergy - order.energyCost, energyLastUpdate: Date.now() });

    // 扣除物品（从后往前删，避免索引偏移）
    const newBoard = [...state.board];
    const consumed = new Set(requiredConsumed);
    for (let i = 35; i >= 0; i--) {
      if (consumed.has(i)) {
        newBoard[i] = null;
      }
    }

    // 完成订单
    const newOrders = state.orders.map(o =>
      o.id === orderId ? { ...o, completed: true } : o
    );

    // 给予金币奖励
    const newCoins = state.coins + order.rewardCoins;

    // L4 订单有 40% 概率掉落证据
    const hasL4 = order.requirements.some(r => r.level === 4);
    let newEvidence = [...state.evidence];
    let newRooms = state.rooms;
    let newStoryProgress = state.storyProgress;

    if (hasL4 && Math.random() < 0.4) {
      const types: ('key' | 'photo' | 'crystal')[] = ['key', 'photo', 'crystal'];
      const type = types[Math.floor(Math.random() * types.length)];
      // 找到未解锁且该类型证据最少的房间
      const lockedRooms = newRooms.filter(r => !r.unlocked && r.requiredEvidence.length > 0);
      const room = lockedRooms[Math.floor(Math.random() * lockedRooms.length)] || lockedRooms[0];
      if (room) {
        const existingForRoom = newEvidence.filter(e => e.roomId === room.id).length;
        const nextId = makeEvidenceId(type, room.id);
        newEvidence.push({ id: nextId, type, roomId: room.id, teaserShown: false, obtained: true });
        newStoryProgress = Math.min(100, newStoryProgress + 5);
      }
    }

    set({
      board: newBoard,
      orders: newOrders,
      coins: newCoins,
      evidence: newEvidence,
      storyProgress: newStoryProgress,
    });

    return { success: true };
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

  addEvidence: (type, roomId) => {
    set(state => {
      const existingForRoom = state.evidence.filter(e => e.roomId === roomId).length;
      if (existingForRoom >= 3) return state; // 每个房间最多3个碎片
      return {
        evidence: [...state.evidence, {
          id: makeEvidenceId(type, roomId),
          type,
          roomId,
          teaserShown: false,
          obtained: true,
        }],
      };
    });
  },

  unlockRoom: (roomId) => {
    set(state => ({
      rooms: state.rooms.map(r =>
        r.id === roomId ? { ...r, unlocked: true } : r
      ),
    }));
  },

  calculateCurrentEnergy: () => {
    const state = get();
    return calculateEnergy(state.energyLastUpdate, state.energy);
  },

  buyEnergy: () => {
    const state = get();
    if (state.coins < ENERGY_BUY_COST) return false;
    const currentEnergy = state.calculateCurrentEnergy();
    if (currentEnergy >= MAX_ENERGY) return false;
    set({
      coins: state.coins - ENERGY_BUY_COST,
      energy: Math.min(MAX_ENERGY, currentEnergy + ENERGY_BUY_AMOUNT),
      energyLastUpdate: Date.now(),
    });
    return true;
  },

  refreshOrders: () => {
    const shuffled = [0,1,2,3,4,5,6,7].sort(() => Math.random() - 0.5).slice(0, 4);
    const newOrders: Order[] = shuffled.map(idx => {
      const template = ORDER_TEMPLATES[idx];
      return {
        id: `order_${Date.now()}_${idx}`,
        description: template.description,
        requirements: [...template.requirements],
        rewardCoins: template.rewardCoins,
        energyCost: template.energyCost,
        completed: false,
        expired: false,
      };
    });
    set({ orders: newOrders, orderRefreshAt: new Date().toISOString().split('T')[0] });
  },

  reset: () => {
    set({
      coins: 500,
      energy: INITIAL_ENERGY,
      energyLastUpdate: Date.now(),
      board: new Array(36).fill(null),
      orders: [],
      evidence: [],
      rooms: INITIAL_ROOMS,
      storyProgress: 0,
      currentChapter: 1,
      seenCutscenes: [],
    });
  },
}));
