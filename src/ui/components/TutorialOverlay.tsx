import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

const STEPS = [
  {
    target: 'merge-board',
    icon: '🔗',
    title: '合成物品',
    desc: '拖动物品到相邻物品上，就能合成更高级的物品！L3+L3可以融合成L4传说物品～',
    hint: '试试把两个相同物品拖到一起',
  },
  {
    target: 'orders',
    icon: '📋',
    title: '完成订单',
    desc: '右侧面版显示当前订单。凑齐所需物品，点击完成订单获得金币奖励！',
    hint: '完成订单是金币的主要来源',
  },
  {
    target: 'story',
    icon: '🔮',
    title: '探索剧情',
    desc: '收集足够证据就能解锁新房间，逐步揭开这所宅邸的秘密...',
    hint: '集齐3个证据碎片即可解锁一个房间',
  },
];

export function TutorialOverlay() {
  const { setHasSeenTutorial } = useGameStore();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setHasSeenTutorial();
    }
  };

  const handleSkip = () => setHasSeenTutorial();

  const current = STEPS[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-step-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`tutorial-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="tutorial-icon">{current.icon}</div>
        <div className="tutorial-title">{current.title}</div>
        <div className="tutorial-desc">{current.desc}</div>
        <div className="tutorial-hint">💡 {current.hint}</div>

        <div className="tutorial-actions">
          <button className="tutorial-skip" onClick={handleSkip}>跳过引导</button>
          <button className="tutorial-next" onClick={handleNext}>
            {step < STEPS.length - 1 ? '下一步 →' : '开始游戏！'}
          </button>
        </div>
      </div>
    </div>
  );
}
