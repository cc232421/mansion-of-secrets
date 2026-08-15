export interface Requirement {
  level: 1 | 2 | 3 | 4;
  type: 'key' | 'photo' | 'crystal';
  count: number;
}

export interface Order {
  id: string;
  description: string;
  requirements: Requirement[];
  rewardCoins: number;
  energyCost: number;
  completed: boolean;
  expired: boolean;
}

let orderIdCounter = 0;

export function generateOrderId(): string {
  return `order_${Date.now()}_${++orderIdCounter}`;
}

export interface OrderTemplate {
  description: string;
  requirements: Requirement[];
  rewardCoins: number;
  energyCost: number;
}

// NOTE: All item types (key/photo/crystal) must exist in MERGE_ITEMS
// badge/box/document were removed — they don't exist in the game
export const ORDER_TEMPLATES: OrderTemplate[] = [
  // ── L1 Orders (easy) ───────────────────────────────────────────
  {
    description: 'Restore the family portrait',
    requirements: [{ level: 1, type: 'photo', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: 'Find the golden key',
    requirements: [{ level: 1, type: 'key', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: 'Gather crystal fragments',
    requirements: [{ level: 1, type: 'crystal', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: 'Assemble the family album',
    requirements: [
      { level: 1, type: 'photo', count: 2 },
      { level: 1, type: 'key', count: 2 },
    ],
    rewardCoins: 150,
    energyCost: 10,
  },
  // ── L2 Orders (medium) ─────────────────────────────────────────
  {
    description: 'Craft the master key',
    requirements: [{ level: 2, type: 'key', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  {
    description: 'Restore the heirloom photo',
    requirements: [{ level: 2, type: 'photo', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  {
    description: 'Charge the crystal orb',
    requirements: [{ level: 2, type: 'crystal', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  // ── L3 Orders (hard) ───────────────────────────────────────────
  {
    description: 'Unlock the mystery',
    requirements: [{ level: 3, type: 'key', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  {
    description: 'Reveal the truth',
    requirements: [{ level: 3, type: 'photo', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  {
    description: 'Discover the crystal crown',
    requirements: [{ level: 3, type: 'crystal', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  // ── L4 Orders (legendary) ─────────────────────────────────────
  {
    description: 'The Royal Crown Collection',
    requirements: [{ level: 4, type: 'key', count: 1 }],
    rewardCoins: 1000,
    energyCost: 40,
  },
  {
    description: 'Album of Lost Memories',
    requirements: [{ level: 4, type: 'photo', count: 1 }],
    rewardCoins: 1000,
    energyCost: 40,
  },
  {
    description: 'Diamond Treasury',
    requirements: [{ level: 4, type: 'crystal', count: 1 }],
    rewardCoins: 1000,
    energyCost: 40,
  },
];

export function createRandomOrder(): Order {
  const template = ORDER_TEMPLATES[Math.floor(Math.random() * ORDER_TEMPLATES.length)];
  return {
    id: generateOrderId(),
    description: template.description,
    requirements: [...template.requirements],
    rewardCoins: template.rewardCoins,
    energyCost: template.energyCost,
    completed: false,
    expired: false,
  };
}

export function createDailyOrders(count: number = 4): Order[] {
  const shuffled = [...ORDER_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(template => ({
    id: generateOrderId(),
    description: template.description,
    requirements: [...template.requirements],
    rewardCoins: template.rewardCoins,
    energyCost: template.energyCost,
    completed: false,
    expired: false,
  }));
}

export interface BoardInventory {
  level: number;
  type: string;
  count: number;
}

// Check if player has enough items to fulfill an order
export function canFulfillOrder(order: Order, inventory: BoardInventory[]): boolean {
  for (const req of order.requirements) {
    const available = inventory.find(i => i.level === req.level && i.type === req.type)?.count || 0;
    if (available < req.count) return false;
  }
  return true;
}
