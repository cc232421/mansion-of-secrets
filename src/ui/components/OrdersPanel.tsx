import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { Sound } from '../../services/soundService';

export function OrdersPanel() {
  const { t } = useTranslation();
  const { orders, board, fulfillOrder, coins, buyEnergy, legendaryOrder, fulfillLegendaryOrder } = useGameStore();
  const currentEnergy = useGameStore(s => s.calculateCurrentEnergy());
  const [message, setMessage] = useState<string | null>(null);

  // Countdown ticker for legendary order
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!legendaryOrder || legendaryOrder.completed) { setCountdown(''); return; }
    const update = () => {
      const left = legendaryOrder.expiresAt - Date.now();
      if (left <= 0) { setCountdown('已过期'); return; }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      setCountdown(`${h}小时${m}分`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [legendaryOrder]);

  const displayOrders = orders.length > 0 ? orders : [];

  // Calculate current board inventory
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
      setMessage(t('orders.orderComplete'));
      Sound.orderComplete();
      Sound.coin();
      if (result.message && result.message.includes('Evidence')) {
        setTimeout(() => setMessage(result.message || t('orders.orderComplete')), 2200);
      }
    } else {
      setMessage(`❌ ${result.message}`);
      Sound.error();
    }
    setTimeout(() => setMessage(null), 2000);
  };

  // Legendary order helpers
  const canLegendaryFulfill = () => {
    if (!legendaryOrder || legendaryOrder.completed) return false;
    if (currentEnergy < legendaryOrder.energyCost) return false;
    for (const req of legendaryOrder.requirements) {
      const key = `L${req.level}_${req.type}`;
      if ((inventory[key] || 0) < req.count) return false;
    }
    return true;
  };

  const handleLegendaryFulfill = () => {
    if (!legendaryOrder) return;
    const result = fulfillLegendaryOrder(legendaryOrder.id);
    if (result.success) {
      setMessage(`🔥 传说订单完成！+${legendaryOrder.rewardCoins} 🪙`);
      Sound.orderComplete();
      Sound.coin();
    } else {
      setMessage(`❌ ${result.message}`);
      Sound.error();
    }
    setTimeout(() => setMessage(null), 2500);
  };

  const handleBuyEnergy = () => {
    if (buyEnergy()) {
      setMessage(t('buySuccess') || '⚡ +30 Energy restored!');
      Sound.coin();
    } else {
      setMessage(t('orders.notEnoughCoins') || '❌ Not enough coins or already full');
      Sound.error();
    }
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-display text-xl text-[#C9A84C] mb-3 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
        📋 {t('orders.title')}
      </h2>

      {/* Legendary Order */}
      {legendaryOrder && !legendaryOrder.completed && (
        <div className="legendary-order-section">
          <div className="legendary-order-badge">
            <div className="legendary-order-header">
              <span className="legendary-order-title">🔥 传说订单</span>
              {countdown && <span className="legendary-countdown">⏱ {countdown}</span>}
            </div>
            <p className="text-[#FFF8F0]/80 text-sm mb-2" style={{ fontStyle: 'italic' }}>
              「{legendaryOrder.descriptionZh}」
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {legendaryOrder.requirements.map((req, i) => {
                const key = `L${req.level}_${req.type}`;
                const have = inventory[key] || 0;
                const enough = have >= req.count;
                return (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: enough ? 'rgba(76,175,80,0.3)' : 'rgba(201,168,76,0.2)', color: enough ? '#81C784' : '#C9A84C' }}
                  >
                    {have}/{req.count}× L{req.level} {req.type}
                  </span>
                );
              })}
            </div>
            {legendaryOrder.doubleEvidence && (
              <div className="text-xs text-[#FF6B35] mb-1">✨ 双倍证据掉落</div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#FFD700] text-sm font-semibold">+{legendaryOrder.rewardCoins} 🪙</span>
              <span className="text-xs text-[#FFB6C1]">⚡{legendaryOrder.energyCost}</span>
            </div>
          </div>
          <button
            className="w-full py-2 rounded text-sm font-bold transition-all mb-3"
            style={{
              background: canLegendaryFulfill() ? 'linear-gradient(135deg, #8B2942, #C9A84C)' : 'rgba(139,41,66,0.3)',
              color: canLegendaryFulfill() ? '#FFD700' : 'rgba(255,215,0,0.4)',
              cursor: canLegendaryFulfill() ? 'pointer' : 'not-allowed',
              border: '1px solid rgba(201,168,76,0.4)',
            }}
            onClick={handleLegendaryFulfill}
            disabled={!canLegendaryFulfill()}
          >
            {canLegendaryFulfill() ? '🔥 接受传说订单' : '🔒 条件不足'}
          </button>
        </div>
      )}

      {/* Message toast */}
      {message && (
        <div className="text-sm text-center py-1 px-2 rounded mb-2 bg-[#2D1B14] text-[#FFF8F0] border border-[#C9A84C]/30">
          {message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {displayOrders.length === 0 ? (
          <div className="text-[#FFF8F0]/40 text-sm text-center py-4">
            {t('orders.noOrders') || 'No active orders. Play to unlock!'}
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
                    {canDo ? `✅ ${t('orders.complete')}` : `🔒 ${t('orders.locked')}`}
                  </button>
                )}
                {order.completed && (
                  <div className="w-full mt-2 py-1.5 rounded text-sm text-center text-[#81C784]">
                    ✓ {t('orders.completed')}
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
          {t('orders.buyEnergy')} ({t('orders.buyEnergyCost')})
        </button>
      </div>
    </div>
  );
}
