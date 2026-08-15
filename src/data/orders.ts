export interface Requirement {
  level: 1 | 2 | 3 | 4;
  type: string;
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

// Pre-defined order templates
export const ORDER_TEMPLATES: OrderTemplate[] = [
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
    description: 'Assemble the heirloom box',
    requirements: [
      { level: 2, type: 'key', count: 2 },
      { level: 1, type: 'photo', count: 1 },
    ],
    rewardCoins: 200,
    energyCost: 15,
  },
  {
    description: 'Complete the family crest',
    requirements: [{ level: 2, type: 'badge', count: 2 }],
    rewardCoins: 250,
    energyCost: 20,
  },
  {
    description: 'Decode the secret document',
    requirements: [
      { level: 2, type: 'document', count: 1 },
      { level: 1, type: 'crystal', count: 2 },
    ],
    rewardCoins: 300,
    energyCost: 25,
  },
  {
    description: 'Unlock the mystery',
    requirements: [{ level: 3, type: 'box', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
  },
  {
    description: 'Reveal the truth',
    requirements: [{ level: 3, type: 'document', count: 1 }],
    rewardCoins: 500,
    energyCost: 30,
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
