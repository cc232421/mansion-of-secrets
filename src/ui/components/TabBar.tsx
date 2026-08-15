import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sound } from '../../services/soundService';

export type Tab = 'merge' | 'orders' | 'story';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useTranslation();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'merge', label: 'Merge', icon: '🧩' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'story', label: 'Story', icon: '📖' },
  ];

  const handleTab = (tab: Tab) => {
    Sound.click();
    onTabChange(tab);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(180deg, rgba(45,27,20,0.95) 0%, rgba(26,15,10,0.98) 100%)',
        borderTop: '1px solid rgba(201,168,76,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: isActive ? 1 : 0.5,
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#C9A84C' : '#FFF8F0',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.03em',
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 40,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
