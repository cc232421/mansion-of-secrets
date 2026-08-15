export type ItemLevel = 1 | 2 | 3;

export type ItemType = 'key' | 'photo' | 'crystal' | 'box' | 'badge' | 'document';

export interface Item {
  id: string;
  level: ItemLevel;
  type: ItemType;
}

export interface MergeItemConfig {
  type: ItemType;
  displayName: string;
  emoji: string;
  color: string;
  glowColor: string;
  //合成奖励
  mergeReward: number;
}

export const MERGE_ITEMS: Record<ItemLevel, MergeItemConfig[]> = {
  1: [
    { type: 'key', displayName: 'Old Key', emoji: '🗝️', color: '#CD7F32', glowColor: '#B87333', mergeReward: 50 },
    { type: 'photo', displayName: 'Broken Photo', emoji: '🖼️', color: '#8B4513', glowColor: '#654321', mergeReward: 50 },
    { type: 'crystal', displayName: 'Cracked Crystal', emoji: '🔮', color: '#87CEEB', glowColor: '#4682B4', mergeReward: 50 },
  ],
  2: [
    { type: 'key', displayName: 'Golden Key', emoji: '🔑', color: '#FFD700', glowColor: '#FFA500', mergeReward: 150 },
    { type: 'photo', displayName: 'Restored Photo', emoji: '🖼️', color: '#DAA520', glowColor: '#B8860B', mergeReward: 150 },
    { type: 'crystal', displayName: 'Crystal Ball', emoji: '🔮', color: '#4169E1', glowColor: '#6495ED', mergeReward: 150 },
  ],
  3: [
    { type: 'box', displayName: 'Heirloom Chest', emoji: '💎', color: '#8B0000', glowColor: '#DC143C', mergeReward: 300 },
    { type: 'badge', displayName: 'Family Crest', emoji: '🏅', color: '#B8860B', glowColor: '#DAA520', mergeReward: 300 },
    { type: 'document', displayName: 'Secret Document', emoji: '📜', color: '#D2691E', glowColor: '#F4A460', mergeReward: 300 },
  ],
};

// Generate a unique item ID
let itemIdCounter = 0;
export function generateItemId(): string {
  return `item_${Date.now()}_${++itemIdCounter}`;
}

// Create a random L1 item
export function createRandomL1Item(): Item {
  const configs = MERGE_ITEMS[1];
  const config = configs[Math.floor(Math.random() * configs.length)];
  return {
    id: generateItemId(),
    level: 1,
    type: config.type,
  };
}

// Create an item of specific level and type
export function createItem(level: ItemLevel, type: ItemType): Item {
  return {
    id: generateItemId(),
    level,
    type,
  };
}

// Get config for an item
export function getItemConfig(item: Item): MergeItemConfig {
  return MERGE_ITEMS[item.level].find(c => c.type === item.type)!;
}

// Check if two items can merge
export function canMerge(a: Item | null | undefined, b: Item | null | undefined): boolean {
  if (!a || !b) return false;
  if (a.level >= 3 || b.level >= 3) return false;
  return a.type === b.type && a.level === b.level;
}

// Overload for grid access (Item | null)
export function canMergeItems(a: Item | null, b: Item | null): boolean {
  return canMerge(a, b);
}
