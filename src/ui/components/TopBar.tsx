import React from 'react';
import { useGameStore } from '../../stores/gameStore';

export function TopBar() {
  const { coins, energy, calculateCurrentEnergy } = useGameStore();
  const currentEnergy = calculateCurrentEnergy();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(180deg, #2D1B14 0%, #3D2914 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 24,
        zIndex: 100,
        borderBottom: '2px solid #C9A84C',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 28 }}>🏰</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 20,
            color: '#FFF8F0',
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        >
          Mansion of Secrets
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Energy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(201,168,76,0.15)',
          padding: '8px 16px',
          borderRadius: 20,
          border: '1px solid #C9A84C',
        }}
      >
        <span style={{ fontSize: 22 }}>⚡</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 18,
            color: '#C9A84C',
            fontWeight: 'bold',
            minWidth: 80,
          }}
        >
          {currentEnergy} / 120
        </span>
      </div>

      {/* Coins */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,215,0,0.15)',
          padding: '8px 16px',
          borderRadius: 20,
          border: '1px solid #FFD700',
        }}
      >
        <span style={{ fontSize: 22 }}>🪙</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 18,
            color: '#FFD700',
            fontWeight: 'bold',
          }}
        >
          {coins.toLocaleString()}
        </span>
      </div>

      {/* Settings */}
      <button
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          padding: 8,
        }}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}
