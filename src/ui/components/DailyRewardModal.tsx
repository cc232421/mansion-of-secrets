import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

const REWARD_ICONS = ['🎁', '🎀', '🏆', '💎', '👑', '🔥', '🌟'];
const REWARD_COINS = [50, 80, 120, 150, 200, 300, 500];

export function DailyRewardModal() {
  const { dailyReward, claimDailyReward, setShowDailyRewardModal } = useGameStore();
  const [phase, setPhase] = useState<'idle' | 'reveal' | 'done'>('idle');
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showRefresher, setShowRefresher] = useState(false);

  const dayIndex = Math.min((dailyReward?.currentStreak ?? 1) - 1, 6);
  const day = dailyReward?.currentStreak ?? 1;
  const coins = REWARD_COINS[dayIndex] ?? 500;
  const icon = REWARD_ICONS[dayIndex] ?? '🎁';

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setPhase('reveal'), 100);
    const t2 = setTimeout(() => {
      const result = claimDailyReward();
      setEarnedCoins(result.coins);
      setShowRefresher(result.refresher);
      setPhase('done');
    }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [claimDailyReward]);

  const handleClose = () => setShowDailyRewardModal(false);

  return (
    <div className="daily-reward-overlay" onClick={phase === 'done' ? handleClose : undefined}>
      <div className="daily-reward-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="daily-reward-header">
          <div className="daily-reward-title">每日登录奖励</div>
          <div className="daily-reward-subtitle">
            第 <span className="streak-num">{day}</span> 天
          </div>
        </div>

        {/* Reward grid (7 days) */}
        <div className="daily-reward-streak">
          {[1, 2, 3, 4, 5, 6, 7].map(d => {
            const past = d < day || (d === day && dailyReward?.claimedToday);
            const current = d === day;
            return (
              <div
                key={d}
                className={`streak-day ${past ? 'streak-past' : ''} ${current ? 'streak-current' : ''}`}
              >
                <div className="streak-icon">
                  {past ? REWARD_ICONS[d - 1] : d === day ? icon : '🔒'}
                </div>
                <div className="streak-coins">{REWARD_COINS[d - 1]}</div>
                {d === 7 && <div className="streak-badge">🔥</div>}
              </div>
            );
          })}
        </div>

        {/* Reveal area */}
        <div className="daily-reward-reveal">
          {phase === 'idle' && (
            <div className="reward-waiting">
              <div className="reward-chest">🎁</div>
            </div>
          )}

          {phase === 'reveal' && (
            <div className="reward-animating">
              <div className="reward-chest reward-chest-bounce">{icon}</div>
              <div className="reward-label">奖励揭晓中...</div>
            </div>
          )}

          {phase === 'done' && (
            <div className="reward-done">
              <div className="reward-coin-display">
                <span className="coin-emoji">💰</span>
                <span className="coin-amount">+{earnedCoins}</span>
              </div>
              {showRefresher && (
                <div className="refresher-got">
                  🔥 获得 1 张传说刷新券！
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {phase === 'done' && (
          <button className="daily-reward-cta" onClick={handleClose}>
            收取奖励！
          </button>
        )}

        {/* Day 7 special hint */}
        {day < 7 && !dailyReward?.claimedToday && (
          <div className="daily-reward-hint">
            再坚持 {7 - day} 天，领取传说刷新券 🔥
          </div>
        )}
        {day === 7 && dailyReward?.claimedToday && (
          <div className="daily-reward-hint">
            已连续登录 7 天！🔥 刷新券已发放！
          </div>
        )}
      </div>
    </div>
  );
}
