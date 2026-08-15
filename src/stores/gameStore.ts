import { create } from 'zustand';
import { Item } from '../data/items';
import { Order } from '../data/orders';

export interface GameState {
  // Meta
  version: string;
  lastSaved: string;

  // Economy
  coins: number;
  energy: number;
  energyLastUpdate: number; // timestamp for energy regen calc

  // Board
  board: (Item | null)[]; // 36 slots

  // Orders
  orders: Order[];
  orderRefreshAt: string;

  // Story
  storyProgress: number; // 0-100
  currentChapter: number; // 1-5
  seenCutscenes: string[];

  // Actions
  spendEnergy: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setBoardItem: (index: number, item: Item | null) => void;
  addOrder: (order: Order) => void;
  completeOrder: (orderId: string) => void;
  advanceStory: (progress: number) => void;
  markCutsceneSeen: (cutsceneId: string) => void;
  calculateCurrentEnergy: () => number;
  reset: () => void;
}

const INITIAL_ENERGY = 120;
const ENERGY_REGEN_SECONDS = 2.5 * 60; // 2.5 minutes per point
const MAX_ENERGY = 120;

function calculateEnergy(lastUpdate: number, currentEnergy: number): number {
  const now = Date.now();
  const secondsElapsed = (now - lastUpdate) / 1000;
  const energyGained = Math.floor(secondsElapsed / ENERGY_REGEN_SECONDS);
  return Math.min(MAX_ENERGY, currentEnergy + energyGained);
}

export const useGameStore = create<GameState>((set, get) => ({
  version: '1.0.0',
  lastSaved: new Date().toISOString(),
  coins: 500,
  energy: INITIAL_ENERGY,
  energyLastUpdate: Date.now(),
  board: new Array(36).fill(null),
  orders: [],
  orderRefreshAt: new Date().toISOString().split('T')[0],
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

  calculateCurrentEnergy: () => {
    const state = get();
    return calculateEnergy(state.energyLastUpdate, state.energy);
  },

  reset: () => {
    set({
      coins: 500,
      energy: INITIAL_ENERGY,
      energyLastUpdate: Date.now(),
      board: new Array(36).fill(null),
      orders: [],
      storyProgress: 0,
      currentChapter: 1,
      seenCutscenes: [],
    });
  },
}));
