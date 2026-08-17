import React, { useEffect, useState } from 'react';
import { Evidence } from '../../stores/gameStore';

interface EvidenceTeaserToastProps {
  evidence: Evidence;
  roomName: string;
  onClose: () => void;
}

export function EvidenceTeaserToast({ evidence, roomName, onClose }: EvidenceTeaserToastProps) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'done'>('typing');

  const fullText = evidence.revealShown ? evidence.revealText : evidence.teaserText;

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setPhase('done');
      }
    }, 50); // 50ms per character
    return () => clearInterval(interval);
  }, [fullText]);

  // Auto-dismiss after 2.5s from start
  useEffect(() => {
    const t = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  const typeIcon = evidence.type === 'key' ? '🗝️' : evidence.type === 'photo' ? '🖼️' : '🔮';
  const isReveal = evidence.revealShown;

  return (
    <div
      className="evidence-toast"
      onClick={() => onClose()}
    >
      {/* Header */}
      <div className="evidence-toast-header">
        <span className="evidence-toast-icon">{typeIcon}</span>
        <span className="evidence-toast-label">
          {isReveal ? '🔑 关键线索' : '🔍 线索'} · {roomName}
        </span>
      </div>

      {/* Text with typewriter */}
      <p className="evidence-toast-text">
        {text}
        {phase === 'typing' && <span className="evidence-toast-cursor">|</span>}
      </p>

      {/* Progress bar */}
      <div className="evidence-toast-progress">
        <div className="evidence-toast-progress-fill" />
      </div>
    </div>
  );
}
