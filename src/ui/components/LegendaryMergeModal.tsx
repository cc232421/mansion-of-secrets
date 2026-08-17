import React, { useEffect, useState } from 'react';
import { getItemConfig, Item } from '../../data/items';

interface LegendaryMergeModalProps {
  item: Item;
  onClose: () => void;
}

export function LegendaryMergeModal({ item, onClose }: LegendaryMergeModalProps) {
  const config = getItemConfig(item);
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'done'>('flash');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 400);
    const t2 = setTimeout(() => setPhase('done'), 2200);
    const t3 = setTimeout(() => onClose(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  return (
    <div className="legendary-overlay" onClick={() => onClose()}>
      {/* Phase 1: Flash */}
      {phase === 'flash' && (
        <div className="legendary-flash-bg" />
      )}

      {/* Phase 2: Reveal */}
      {phase === 'reveal' && (
        <div className="legendary-reveal">
          <div className="legendary-reveal-inner">
            <p className="legendary-label">✦ 传说物品 ✦</p>
            <div className="legendary-item-display">
              <span className="legendary-emoji" style={{ fontSize: 80 }}>
                {config.emoji}
              </span>
            </div>
            <p className="legendary-name">{config.displayName}</p>
            <p className="legendary-sub">传说级 · L4 · {item.type === 'key' ? '钥匙' : item.type === 'photo' ? '照片' : '水晶'}</p>
          </div>
        </div>
      )}

      {/* Click to dismiss hint */}
      {phase === 'done' && (
        <div className="legendary-done-hint">
          <p>点击任意处继续</p>
        </div>
      )}
    </div>
  );
}
