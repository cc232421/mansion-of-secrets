import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getItemConfig } from '../../data/items';
import { Sound } from '../../services/soundService';

export function OrdersPanel() {
  const { orders, board, energy, fulfillOrder, coins, buyEnergy } = useGameStore();
  const currentEnergy = useGameStore(s => s.calculateCurrentEnergy());
  const [message, setMessage] = useState<string | null>(null);

  // 如果没有订单，随机生成
  const displayOrders = orders.length > 0 ? orders : [];

  // 计算当前棋盘物品统计
  const getBoardInventory = () => {
    const inv: Record<string, number> = {};
    for (const item of board) {
      if (item) {
        const key = `L${item.level}_${item.type}`;
        inv[key] = (inv[key] || 0) + 1;
      }
    }
    return inv;
  };

  const inventory = getBoardInventory();

  const canFulfill = (order: typeof orders[0]) => {
    if (order.completed) return false;
    if (currentEnergy < order.energyCost) return false;
    for (const req of order.requirements) {
      const key = `L${req.level}_${req.type}`;
      if ((inventory[key] || 0) < req.count) return false;
    }
    return true;
  };

  const handleFulfill = (orderId: string) => {
    const result = fulfillOrder(orderId);
    if (result.success) {
      setMessage('✅ Order completed!');
      Sound.orderComplete();
      Sound.coin();
      // Show evidence drop message if applicable
      if (result.message && result.message.includes('Evidence')) {
        setTimeout(() => setMessage(result.message || '✅'), 2200);
      }
    } else {
      setMessage(`❌ ${result.message}`);
      Sound.error();
    }
    setTimeout(() => setMessage(null), result.success ? 2000 : 2000);
  };

  const handleBuyEnergy = () => {
    if (buyEnergy()) {
      setMessage('⚡ +30 Energy restored!');
      Sound.coin();
    } else {
      setMessage('❌ Not enough coins or already full');
      Sound.error();
    }
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-display text-xl text-[#C9A84C] mb-3 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
        📋 Orders
      </h2>

      {/* Message toast */}
      {message && (
        <div className="text-sm text-center py-1 px-2 rounded mb-2 bg-[#2D1B14] text-[#FFF8F0] border border-[#C9A84C]/30">
          {message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {displayOrders.length === 0 ? (
          <div className="text-[#FFF8F0]/40 text-sm text-center py-4">
            No active orders. Play to unlock!
          </div>
        ) : (
          displayOrders.map((order) => {
            const canDo = canFulfill(order);
            const energyOk = currentEnergy >= order.energyCost;

            return (
              <div
                key={order.id}
                className="order-card"
                style={{ opacity: order.completed ? 0.5 : 1 }}
              >
                <p className="text-[#FFF8F0] text-sm mb-2">{order.description}</p>

                {/* Requirements */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {order.requirements.map((req, i) => {
                    const key = `L${req.level}_${req.type}`;
                    const have = inventory[key] || 0;
                    const enough = have >= req.count;
                    return (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: enough ? 'rgba(76,175,80,0.3)' : 'rgba(201,168,76,0.2)',
                          color: enough ? '#81C784' : '#C9A84C',
                        }}
                      >
                        {have}/{req.count}× L{req.level} {req.type}
                      </span>
                    );
                  })}
                </div>

                {/* Reward + Energy */}
                <div className="flex justify-between items-center">
                  <span className="text-[#FFD700] text-sm font-semibold">
                    +{order.rewardCoins} 🪙
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: energyOk ? 'rgba(139,41,66,0.3)' : 'rgba(255,0,0,0.3)',
                      color: energyOk ? '#FFB6C1' : '#FF6B6B',
                    }}
                  >
                    ⚡{order.energyCost}
                  </span>
                </div>

                {/* Complete button */}
                {!order.completed && (
                  <button
                    className="w-full mt-2 py-1.5 rounded text-sm font-semibold transition-all"
                    style={{
                      background: canDo ? '#C9A84C' : 'rgba(201,168,76,0.2)',
                      color: canDo ? '#2D1B14' : 'rgba(201,168,76,0.4)',
                      cursor: canDo ? 'pointer' : 'not-allowed',
                    }}
                    onClick={() => handleFulfill(order.id)}
                    disabled={!canDo}
                  >
                    {canDo ? '✅ Complete Order' : '🔒 Locked'}
                  </button>
                )}
                {order.completed && (
                  <div className="w-full mt-2 py-1.5 rounded text-sm text-center text-[#81C784]">
                    ✓ Completed
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Energy buy section */}
      <div className="mt-3 pt-3 border-t border-[#C9A84C]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#FFF8F0]/60">⚡ {currentEnergy}/120</span>
          <span className="text-xs text-[#FFF8F0]/40">🪙 {coins}</span>
        </div>
        <button
          className="w-full py-2 rounded text-sm font-bold transition-all hover:brightness-110"
          style={{
            background: coins >= 100 && currentEnergy < 120 ? '#4CAF50' : 'rgba(76,175,80,0.3)',
            color: coins >= 100 && currentEnergy < 120 ? '#fff' : 'rgba(255,255,255,0.4)',
            cursor: coins >= 100 && currentEnergy < 120 ? 'pointer' : 'not-allowed',
          }}
          onClick={handleBuyEnergy}
          disabled={coins < 100 || currentEnergy >= 120}
        >
          ⚡ Buy Energy (100 🪙 → +30 ⚡)
        </button>
      </div>
    </div>
  );
}
