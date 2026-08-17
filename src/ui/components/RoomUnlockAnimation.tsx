import React, { useEffect, useState } from 'react';
import { Room } from '../../stores/gameStore';

interface RoomUnlockAnimationProps {
  room: Room;
  onClose: () => void;
}

export function RoomUnlockAnimation({ room, onClose }: RoomUnlockAnimationProps) {
  const [phase, setPhase] = useState<'icon' | 'name' | 'cta'>('icon');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 800);
    const t2 = setTimeout(() => setPhase('cta'), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="room-unlock-overlay" onClick={() => onClose()}>
      <div className="room-unlock-card">
        {/* Phase 1: Icon */}
        {phase === 'icon' && (
          <div className="room-unlock-icon-wrap">
            <div className="room-unlock-icon-bg" />
            <span className="room-unlock-icon">{room.icon}</span>
          </div>
        )}

        {/* Phase 2: Name */}
        {phase === 'name' && (
          <div className="room-unlock-name-phase">
            <p className="room-unlock-subtitle">🚪 房间已解锁</p>
            <p className="room-unlock-room-name">{room.icon} {room.name}</p>
            <p className="room-unlock-desc">{room.description}</p>
          </div>
        )}

        {/* Phase 3: CTA */}
        {phase === 'cta' && (
          <div className="room-unlock-cta-phase">
            <p className="room-unlock-room-name-lg">{room.icon} {room.name}</p>
            <p className="room-unlock-hint">点击继续故事</p>
          </div>
        )}
      </div>
    </div>
  );
}
