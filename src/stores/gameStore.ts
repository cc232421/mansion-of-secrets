import { create } from 'zustand';
import { Item, ItemLevel, ItemType, createRandomL1Item, createItem, getItemConfig, canMerge } from '../data/items';
import { Order, OrderTemplate, ORDER_TEMPLATES } from '../data/orders';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Evidence {
  id: string;
  type: 'key' | 'photo' | 'crystal';
  roomId: string;
  teaserText: string;   // 第1个碎片时显示的悬念文字
  revealText: string;   // 第2个碎片时显示的关键线索
  teaserShown: boolean; // Teaser 1 是否已展示
  revealShown: boolean; // Teaser 2 是否已展示
  obtained: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  teaserText: string;     // 第1个碎片的悬念文字
  revealText: string;     // 第2个碎片的关键线索
  requiredEvidenceCount: number; // 只需数量，不需特定ID
  unlocked: boolean;
  teaserCutsceneId: string;
  fullCutsceneId: string;
  chapter: number;
  icon: string;
}

export interface Requirement {
  type: 'key' | 'photo' | 'crystal';
  level: ItemLevel;
  count: number;
}

export interface LegendaryOrder {
  id: string;
  description: string;   // 悬念风格描述
  descriptionZh: string; // 中文悬念描述
  requirements: Requirement[];
  rewardCoins: number;    // 800-1200
  energyCost: number;      // 40-60
  expiresAt: number;       // timestamp (24h from spawn)
  doubleEvidence: boolean;  // 完成时是否双倍掉落
  completed: boolean;
}

// 每日登录奖励
export interface DailyReward {
  lastLoginDate: string;     // 'YYYY-MM-DD'
  currentStreak: number;     // 连续登录天数 (1-7)
  claimedToday: boolean;     // 今日是否已领取
  legendaryRefreshers: number; // 传说刷新券数量
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
  latestEvidence: Evidence | null;
  latestUnlockedRoom: Room | null;
  clearLatestEvidence: () => void;
  clearLatestUnlockedRoom: () => void;
  sellItem: (slotIndex: number) => { success: boolean; coinsEarned: number };
  dailyReward: DailyReward | null;
  legendaryOrder: LegendaryOrder | null;
  showDailyRewardModal: boolean;
  setShowDailyRewardModal: (v: boolean) => void;
  setDailyReward: (dr: DailyReward) => void;
  claimDailyReward: () => { coins: number; refresher: boolean };
  checkAndSpawnLegendaryOrder: () => void;
  fulfillLegendaryOrder: (orderId: string) => { success: boolean; message?: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_ENERGY = 120;
const ENERGY_REGEN_SECONDS = 150; // 2.5分钟回复满
const MAX_ENERGY = 120;
const ENERGY_BUY_COST = 100;
const ENERGY_BUY_AMOUNT = 30;
const INITIAL_BOARD_SIZE = 8;

// ─── Room definitions ────────────────────────────────────────────────────────

// ─── Legendary Order Templates ───────────────────────────────────────────────

const LEGENDARY_ORDER_TEMPLATES: Omit<LegendaryOrder, 'id' | 'expiresAt' | 'completed'>[] = [
  {
    description: 'The key in the safe doesn\'t fit any lock in this house. Who changed the locks?',
    descriptionZh: '保险箱里的钥匙，打不开这宅子里的任何一扇门。谁换过锁？',
    requirements: [{ type: 'key', level: 4, count: 1 }],
    rewardCoins: 1000,
    energyCost: 50,
    doubleEvidence: true,
  },
  {
    description: 'The photo behind the painting shows a woman who died before I was born.',
    descriptionZh: '画像背后藏着一张照片——照片里的女人，在我出生前就已离世。',
    requirements: [{ type: 'photo', level: 4, count: 1 }],
    rewardCoins: 1200,
    energyCost: 60,
    doubleEvidence: true,
  },
  {
    description: 'The crystal hums when I hold it near the fireplace. It remembers something.',
    descriptionZh: '当我把水晶靠近壁炉时，它开始嗡鸣。它记得什么。',
    requirements: [{ type: 'crystal', level: 4, count: 1 }],
    rewardCoins: 1000,
    energyCost: 50,
    doubleEvidence: true,
  },
  {
    description: 'Combine all three artifacts. Only together do they reveal the full truth.',
    descriptionZh: '将三件神器合一。只有三者相聚，真相才能完整显现。',
    requirements: [
      { type: 'key', level: 4, count: 1 },
      { type: 'photo', level: 4, count: 1 },
      { type: 'crystal', level: 4, count: 1 },
    ],
    rewardCoins: 2000,
    energyCost: 80,
    doubleEvidence: false,
  },
  {
    description: 'Grandma\'s locket was never opened. The heirloom key fits it perfectly.',
    descriptionZh: '祖母的项链盒从未被打开过。那把传家钥匙与它完美契合。',
    requirements: [{ type: 'key', level: 3, count: 2 }],
    rewardCoins: 800,
    energyCost: 40,
    doubleEvidence: true,
  },
  {
    description: 'The hidden diary mentions three locations. Only the crystal can reveal them all.',
    descriptionZh: '隐藏日记提到三个地点。只有水晶能将它们全部显现。',
    requirements: [{ type: 'crystal', level: 3, count: 2 }],
    rewardCoins: 800,
    energyCost: 40,
    doubleEvidence: true,
  },
];

// ─── Daily Reward Table ───────────────────────────────────────────────────

const DAILY_REWARD_TABLE = [50, 80, 120, 150, 200, 300, 500]; // day 1-7

function todayString() {
  return new Date().toISOString().split('T')[0];
}

const INITIAL_ROOMS: Room[] = [
  {
    id: 'study',
    name: '书房',
    description: '父亲最后的秘密...',
    teaserText: '一封未署名的信从书页间滑落...',
    revealText: '信上写着："她不是你的亲生女儿。"',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_study',
    chapter: 1,
    icon: '📚',
  },
  {
    id: 'gallery',
    name: '画廊',
    description: '画像的目光如影随形...',
    teaserText: '画中人的眼睛...似乎在追随你移动。',
    revealText: '画作角落有一个隐藏的签名日期：1985年——Emily出生前两年。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_gallery',
    chapter: 1,
    icon: '🖼️',
  },
  {
    id: 'wine_cellar',
    name: '酒窖',
    description: '地下室的脚步声...',
    teaserText: '深夜，酒窖深处传来玻璃碰撞的声音...',
    revealText: '一个隐藏的保险箱，密码是Brad的生日。里面是一份领养文件。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_cellar',
    chapter: 2,
    icon: '🍷',
  },
  {
    id: 'accounting',
    name: '账房',
    description: '伪造的签名...',
    teaserText: '账本上的数字，似乎被人篡改过...',
    revealText: '父亲的笔迹在颤抖——这不是他写的。有人在模仿他的签名。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_accounting',
    chapter: 2,
    icon: '💰',
  },
  {
    id: 'grandma',
    name: '祖母房',
    description: '祖母什么都知道...',
    teaserText: '祖母的遗物箱里，有一封从未寄出的信...',
    revealText: '"Claire，我对不起Emily。她是你和Brad的女儿。"',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_grandma',
    chapter: 3,
    icon: '👵',
  },
  {
    id: 'secret',
    name: '密室',
    description: '壁炉后的秘密...',
    teaserText: '壁炉的石板松动了一块，露出一道暗门...',
    revealText: '密室里有一张照片：年轻的父亲，和一个长得和Emily一模一样的女人。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_secret',
    chapter: 3,
    icon: '🔥',
  },
  {
    id: 'attic',
    name: '阁楼',
    description: '最终的真相...',
    teaserText: '阁楼的灰尘下，藏着一个尘封已久的秘密...',
    revealText: '一份医疗记录：Emily的双胞胎姐姐，出生时被卖给了Harper家。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_attic',
    chapter: 3,
    icon: '🏛️',
  },
  {
    id: 'exit',
    name: '出口',
    description: '自由...还是真相?',
    teaserText: '大门近在咫尺，但真相还在这宅邸深处等待...',
    revealText: 'Emily终于明白了一切——她的整个人生，都是一场精心设计的谎言。',
    requiredEvidenceCount: 3,
    unlocked: false,
    teaserCutsceneId: '',
    fullCutsceneId: 'cs_ending',
    chapter: 3,
    icon: '🚪',
  },
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

  // Daily reward state (initialized on first render via checkLoginStreak)
  dailyReward: null,
  legendaryOrder: null,
  showDailyRewardModal: false,
  setShowDailyRewardModal: (v: boolean) => set({ showDailyRewardModal: v }),
  setDailyReward: (dr: DailyReward) => set({ dailyReward: dr }),

  claimDailyReward: () => {
    const state = get();
    const dr = state.dailyReward;
    if (!dr || dr.claimedToday) return { coins: 0, refresher: false };

    const today = todayString();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = dr.lastLoginDate === yesterday ? dr.currentStreak + 1 : 1;
    const dayIndex = Math.min(newStreak - 1, 6); // 0-6 index
    const coins = DAILY_REWARD_TABLE[dayIndex] ?? 500;
    const isDay7 = newStreak === 7;
    const newRefresher = isDay7 ? dr.legendaryRefreshers + 1 : dr.legendaryRefreshers;

    const newDr: DailyReward = {
      lastLoginDate: today,
      currentStreak: newStreak,
      claimedToday: true,
      legendaryRefreshers: newRefresher,
    };

    set({
      dailyReward: newDr,
      coins: state.coins + coins,
      showDailyRewardModal: false,
    });

    localStorage.setItem('dailyReward', JSON.stringify(newDr));

    return { coins, refresher: isDay7 };
  },

  checkAndSpawnLegendaryOrder: () => {
    const state = get();
    if (state.legendaryOrder && !state.legendaryOrder.completed && Date.now() < state.legendaryOrder.expiresAt) return;
    if (Math.random() > 0.5) return;

    const template = LEGENDARY_ORDER_TEMPLATES[
      Math.floor(Math.random() * LEGENDARY_ORDER_TEMPLATES.length)
    ];
    const order: LegendaryOrder = {
      ...template,
      id: `legendary_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      completed: false,
    };
    set({ legendaryOrder: order });
  },

  fulfillLegendaryOrder: (orderId: string) => {
    const state = get();
    const order = state.legendaryOrder;
    if (!order || order.id !== orderId || order.completed) {
      return { success: false, message: 'No legendary order found' };
    }

    for (const req of order.requirements) {
      let count = 0;
      for (const item of state.board) {
        if (item && item.type === req.type && item.level === req.level) count++;
      }
      if (count < req.count) {
        return { success: false, message: 'Missing items' };
      }
    }

    const currentEnergy = state.calculateCurrentEnergy();
    if (currentEnergy < order.energyCost) {
      return { success: false, message: 'Not enough energy' };
    }

    const newBoard = [...state.board];
    const consumed = new Set<number>();
    for (const req of order.requirements) {
      let need = req.count;
      for (let i = 0; i < 36 && need > 0; i++) {
        if (newBoard[i] && newBoard[i]!.type === req.type && newBoard[i]!.level === req.level && !consumed.has(i)) {
          newBoard[i] = null;
          consumed.add(i);
          need--;
        }
      }
    }

    set({
      board: newBoard,
      energy: currentEnergy - order.energyCost,
      energyLastUpdate: Date.now(),
      coins: state.coins + order.rewardCoins,
      legendaryOrder: { ...order, completed: true },
    });

    if (order.doubleEvidence && Math.random() < 0.8) {
      const types: ('key' | 'photo' | 'crystal')[] = ['key', 'photo', 'crystal'];
      const type = types[Math.floor(Math.random() * types.length)];
      const roomsNeedingEvidence = state.rooms.filter(r => !r.unlocked);
      if (roomsNeedingEvidence.length > 0) {
        const room = roomsNeedingEvidence[Math.floor(Math.random() * roomsNeedingEvidence.length)];
        const newEv = {
          id: `${type}_${room.id}_${Date.now()}`,
          type, roomId: room.id,
          teaserText: room.teaserText, revealText: room.revealText,
          teaserShown: false, revealShown: false, obtained: true,
        };
        set(s => ({ evidence: [...s.evidence, newEv], latestEvidence: newEv }));
      }
    }

    return { success: true, message: `+${order.rewardCoins} coins!` };
  },

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
    let newRooms = [...state.rooms];
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
          const newEv = {
            id: evidenceId,
            type,
            roomId: room.id,
            teaserText: room.teaserText,
            revealText: room.revealText,
            teaserShown: false,
            revealShown: false,
            obtained: true,
          };
          newEvidence.push(newEv);
          newStoryProgress = Math.min(100, state.storyProgress + 5);
          message += ` | 🔍 Evidence found for "${room.name}"!`;

          // Check if room just got unlocked (after adding this evidence)
          const newCount = newEvidence.filter(e => e.roomId === room.id).length;
          let unlockedRoom: Room | null = null;
          if (newCount >= room.requiredEvidenceCount && !room.unlocked) {
            message += ` | 🚪 "${room.name}" UNLOCKED!`;
            // Mark the room as unlocked in newRooms (we'll compute newRooms inline below)
            newRooms = newRooms.map(r =>
              r.id === room.id ? { ...r, unlocked: true } : r
            );
            unlockedRoom = { ...room, unlocked: true };
          }

          // Set latestEvidence / latestUnlockedRoom for the UI to consume
          set({
            board: newBoard,
            orders: newOrders,
            coins: newCoins,
            evidence: newEvidence,
            rooms: newRooms,
            storyProgress: newStoryProgress,
            latestEvidence: newEv,
            latestUnlockedRoom: unlockedRoom,
          });
          return { success: true, message };
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
    let unlockedRoom: Room | null = null;
    const newRooms = state.rooms.map(room => {
      if (room.unlocked) return room;
      const count = state.evidence.filter(e => e.roomId === room.id).length;
      if (count >= room.requiredEvidenceCount) {
        changed = true;
        unlockedRoom = { ...room, unlocked: true };
        return unlockedRoom;
      }
      return room;
    });
    if (changed) set({ rooms: newRooms, latestUnlockedRoom: unlockedRoom });
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

  latestEvidence: null,
  latestUnlockedRoom: null,

  clearLatestEvidence: () => set({ latestEvidence: null }),

  clearLatestUnlockedRoom: () => set({ latestUnlockedRoom: null }),

  sellItem: (slotIndex: number) => {
    const state = get();
    const item = state.board[slotIndex];
    if (!item) return { success: false, coinsEarned: 0 };

    // Price by level
    const prices: Record<number, number> = { 1: 5, 2: 15, 3: 50, 4: 200 };
    const coinsEarned = prices[item.level] ?? 5;

    const newBoard = [...state.board];
    newBoard[slotIndex] = null;

    set({
      board: newBoard,
      coins: state.coins + coinsEarned,
    });

    return { success: true, coinsEarned };
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
