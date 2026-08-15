import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { ORDER_TEMPLATES, type OrderTemplate } from '../../data/orders';

export function OrdersPanel() {
  const { orders } = useGameStore();

  return (
    <div className="h-full flex flex-col">
      <h2
        className="font-display text-xl text-[#C9A84C] mb-3 flex items-center gap-2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        📋 Orders
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {ORDER_TEMPLATES.map((order: OrderTemplate, idx: number) => (
          <div key={idx} className="order-card">
            <p className="text-[#FFF8F0] text-sm mb-2">{order.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {order.requirements.map((req, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}
                >
                  {req.count}× L{req.level} {req.type}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FFD700] text-sm font-semibold">
                +{order.rewardCoins} 🪙
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(139,41,66,0.3)', color: '#FFB6C1' }}
              >
                -{order.energyCost} ⚡
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#C9A84C]/20">
        <p className="text-xs text-[#FFF8F0]/40 text-center">
          New orders refresh daily at midnight
        </p>
      </div>
    </div>
  );
}
