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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 4 : 8,
          background: 'rgba(201,168,76,0.15)',
          padding: isMobile ? '5px 10px' : '8px 14px',
          borderRadius: 16,
          border: '1px solid #C9A84C',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: isMobile ? 16 : 20 }}>⚡</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: isMobile ? 13 : 16,
            color: '#C9A84C',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {currentEnergy}/{MAX_ENERGY}
        </span>
      </div>

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
