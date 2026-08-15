import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, setLanguage } from '../../i18n';
import { Sound } from '../../services/soundService';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code as 'en' | 'zh');
    setOpen(false);
    Sound.click();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); Sound.click(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(201,168,76,0.15)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 8,
          padding: '6px 12px',
          cursor: 'pointer',
          color: '#C9A84C',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
        }}
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.nativeName}</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#2D1B14',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: 8,
            overflow: 'hidden',
            zIndex: 9999,
            minWidth: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 14px',
                background: lang.code === i18n.language ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: 'none',
                cursor: lang.wip ? 'not-allowed' : 'pointer',
                color: lang.wip ? '#888' : (lang.code === i18n.language ? '#FFD700' : '#FFF8F0'),
                fontSize: 14,
                fontFamily: 'Georgia, serif',
                textAlign: 'left',
                opacity: lang.wip ? 0.5 : 1,
              }}
            >
              <span>{lang.flag}</span>
              <span style={{ flex: 1 }}>{lang.nativeName}</span>
              {lang.wip && <span style={{ fontSize: 10 }}>🔧</span>}
              {lang.code === i18n.language && <span style={{ fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
