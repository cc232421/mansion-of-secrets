import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Sound } from '../../services/soundService';
import { LanguageSwitcher } from './LanguageSwitcher';

const MAX_ENERGY = 120;

export function TopBar() {
  const { coins, calculateCurrentEnergy } = useGameStore();
  const currentEnergy = calculateCurrentEnergy();
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    if (muted) {
      Sound.setMasterVolume(0.7);
    } else {
      Sound.setMasterVolume(0);
    }
    setMuted(!muted);
    Sound.click();
  };

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Detect mobile viewport
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? 52 : 60,
        background: 'linear-gradient(180deg, #2D1B14 0%, #3D2914 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 24px',
        gap: isMobile ? 8 : 16,
        zIndex: 100,
        borderBottom: '2px solid #C9A84C',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: isMobile ? 22 : 28 }}>🏰</span>
        {!isMobile && (
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 18,
              color: '#FFF8F0',
              fontWeight: 'bold',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}
          >
            Mansion of Secrets
          </span>
        )}
        {isMobile && (
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 13,
              color: '#C9A84C',
              fontWeight: 'bold',
              letterSpacing: 0.5,
            }}
          >
            MOS
          </span>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Energy */}
      <EnergyDisplay currentEnergy={currentEnergy} maxEnergy={MAX_ENERGY} isMobile={isMobile} />

      {/* Coins */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 4 : 8,
          background: 'rgba(255,215,0,0.12)',
          padding: isMobile ? '5px 10px' : '8px 14px',
          borderRadius: 16,
          border: '1px solid rgba(255,215,0,0.5)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: isMobile ? 16 : 20 }}>🪙</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: isMobile ? 13 : 16,
            color: '#FFD700',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {coins >= 1000 ? `${(coins / 1000).toFixed(1)}k` : coins}
        </span>
      </div>

      {/* Sound toggle — always visible on mobile */}
      <button
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: isMobile ? 20 : 24,
          cursor: 'pointer',
          padding: isMobile ? 4 : 8,
          flexShrink: 0,
        }}
        onClick={toggleMute}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Menu button — hamburger on mobile, inline on desktop */}
      {isMobile ? (
        // Mobile: hamburger menu button
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => { setMenuOpen(!menuOpen); Sound.click(); }}
            style={{
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 18,
              color: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ☰
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                background: '#2D1B14',
                border: '1px solid rgba(201,168,76,0.5)',
                borderRadius: 12,
                padding: 8,
                minWidth: 200,
                zIndex: 9999,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              {/* Language */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                <div style={{ fontSize: 11, color: '#C9A84C', opacity: 0.7, marginBottom: 6, fontFamily: 'Georgia, serif' }}>
                  🌐 LANGUAGE
                </div>
                <LanguageSwitcher />
              </div>

              {/* Story progress */}
              <MobileStoryProgress />

              {/* Help */}
              <button
                onClick={() => { setMenuOpen(false); Sound.click(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFF8F0',
                  fontSize: 14,
                  fontFamily: 'Georgia, serif',
                  borderRadius: 6,
                }}
              >
                <span>❓</span>
                <span>Help & How to Play</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Desktop: inline language switcher
        <LanguageSwitcher />
      )}
    </div>
  );
}

// Mobile story progress summary
function MobileStoryProgress() {
  const { storyProgress } = useGameStore();
  return (
    <div
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div style={{ fontSize: 11, color: '#C9A84C', opacity: 0.7, marginBottom: 6, fontFamily: 'Georgia, serif' }}>
        📖 STORY PROGRESS
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <div
            style={{
              width: `${storyProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8B2942, #C9A84C)',
              borderRadius: 3,
              transition: 'width 0.3s',
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
          {storyProgress}%
        </span>
      </div>
    </div>
  );
}

// ── Energy 5-Tier Display ─────────────────────────────────────────────────────

type EnergyTier = 0 | 1 | 2 | 3 | 4;

interface EnergyTierInfo {
  tier: EnergyTier;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

function getEnergyTier(pct: number): EnergyTierInfo {
  if (pct <= 0.16)  return { tier: 0, label: '能量耗尽',  color: '#EF4444', bgColor: 'rgba(239,68,68,0.15)',   icon: '💀' };
  if (pct <= 0.36)  return { tier: 1, label: '能量不足',  color: '#F97316', bgColor: 'rgba(249,115,22,0.15)',  icon: '⚠️' };
  if (pct <= 0.66)  return { tier: 2, label: '能量一般',  color: '#FBBF24', bgColor: 'rgba(251,191,36,0.15)',  icon: '💛' };
  if (pct <= 0.91)  return { tier: 3, label: '能量充足',  color: '#34D399', bgColor: 'rgba(52,211,153,0.15)',  icon: '💚' };
                   return { tier: 4, label: '能量充沛',  color: '#FFD700', bgColor: 'rgba(255,215,0,0.15)',    icon: '⚡' };
}

function EnergyDisplay({ currentEnergy, maxEnergy, isMobile }: {
  currentEnergy: number;
  maxEnergy: number;
  isMobile: boolean;
}) {
  const pct = currentEnergy / maxEnergy;
  const tier = getEnergyTier(pct);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 4 : 8,
        background: tier.bgColor,
        padding: isMobile ? '5px 10px' : '8px 14px',
        borderRadius: 16,
        border: `1px solid ${tier.color}40`,
        flexShrink: 0,
        transition: 'background 0.5s, border-color 0.5s',
        flexDirection: 'column',
        minWidth: isMobile ? 80 : 110,
      }}
    >
      {/* Top row: icon + number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, width: '100%' }}>
        <span style={{ fontSize: isMobile ? 16 : 20 }}>{tier.icon}</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: isMobile ? 13 : 16,
            color: tier.color,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            transition: 'color 0.5s',
          }}
        >
          {currentEnergy}/{maxEnergy}
        </span>
      </div>

      {/* Bottom row: bar + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        {/* 5-segment bar */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: isMobile ? 3 : 4,
                borderRadius: 2,
                background: i < tier.tier
                  ? tier.color
                  : i === tier.tier
                    ? `${tier.color}60`
                    : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s',
                boxShadow: i < tier.tier ? `0 0 4px ${tier.color}` : 'none',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: isMobile ? 9 : 10,
            color: tier.color,
            fontWeight: 600,
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            transition: 'color 0.5s',
          }}
        >
          {tier.label}
        </span>
      </div>
    </div>
  );
}
