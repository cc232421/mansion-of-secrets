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
// Descriptions are SUSPENSE style — hints at story, not just tasks
export const ORDER_TEMPLATES: OrderTemplate[] = [
  // ── L1 Orders (easy) ───────────────────────────────────────────
  {
    description: '那张被撕碎的全家福，似乎藏着某个人的秘密...',
    requirements: [{ level: 1, type: 'photo', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: '老宅的第三把钥匙，藏在没人想到的地方...',
    requirements: [{ level: 1, type: 'key', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: '壁炉里闪着蓝光——那是水晶碎片的微光...',
    requirements: [{ level: 1, type: 'crystal', count: 3 }],
    rewardCoins: 80,
    energyCost: 5,
  },
  {
    description: '照片和钥匙放在一起时，会发生什么？',
    requirements: [
      { level: 1, type: 'photo', count: 2 },
      { level: 1, type: 'key', count: 2 },
    ],
    rewardCoins: 150,
    energyCost: 10,
  },
  // ── L2 Orders (medium) ─────────────────────────────────────────
  {
    description: '万能钥匙可以打开所有的门——除了最后那扇。',
    requirements: [{ level: 2, type: 'key', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  {
    description: '传家照片上的脸，和我长得一模一样...',
    requirements: [{ level: 2, type: 'photo', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  {
    description: '水晶球开始发光——它感应到了什么？',
    requirements: [{ level: 2, type: 'crystal', count: 2 }],
    rewardCoins: 200,
    energyCost: 15,
  },
  // ── L3 Orders (hard) ───────────────────────────────────────────
  {
    description: '那把能解开一切的钥匙，究竟在谁手里？',
    requirements: [{ level: 3, type: 'key', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  {
    description: '照片里的女人转过头来——她在对我笑。',
    requirements: [{ level: 3, type: 'photo', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  {
    description: '水晶王冠出现了——戴上它的人将看见过去。',
    requirements: [{ level: 3, type: 'crystal', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  // ── L4 Orders (legendary) ─────────────────────────────────────
  {
    description: '皇家王冠只有一个——它记录着血脉的秘密。',
    requirements: [{ level: 4, type: 'key', count: 1 }],
    rewardCoins: 1000,
    energyCost: 40,
  },
  {
    description: '失落的记忆相册——里面的人都是谁？',
    requirements: [{ level: 4, type: 'photo', count: 1 }],
    rewardCoins: 1000,
    energyCost: 40,
  },
  {
    description: '钻石宝库的门缓缓打开——里面是回家的路。',
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
