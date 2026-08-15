import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sound } from '../../services/soundService';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStart = () => {
    Sound.click();
    onStart();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a0f0a 0%, #2d1b14 50%, #1a0f0a 100%)',
        color: '#FFF8F0',
        fontFamily: 'Georgia, serif',
        overflow: 'auto',
      }}
    >
      {/* ── Nav bar ── */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(26,15,10,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <LanguageSwitcher />
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
          background: 'radial-gradient(ellipse at center top, rgba(139,41,66,0.3) 0%, transparent 70%)',
        }}
      >
        {/* Decorative top border */}
        <div
          style={{
            width: 60,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
            margin: '0 auto 32px',
          }}
        />

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 'bold',
            color: '#C9A84C',
            letterSpacing: '0.05em',
            textShadow: '0 0 40px rgba(201,168,76,0.4)',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {t('landing.heroTitle')}
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#FFF8F0',
            opacity: 0.7,
            marginTop: 12,
            fontStyle: 'italic',
            letterSpacing: '0.1em',
          }}
        >
          {t('landing.heroSubtitle')}
        </p>

        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#FFF8F0',
            opacity: 0.6,
            marginTop: 16,
            maxWidth: 480,
            margin: '16px auto 0',
            lineHeight: 1.6,
          }}
        >
          {t('landing.tagline')}
        </p>

        {/* Decorative divider */}
        <div
          style={{
            width: 40,
            height: 40,
            margin: '40px auto 0',
            fontSize: 28,
            opacity: 0.4,
          }}
        >
          🏚️
        </div>
      </section>

      {/* ── Story ── */}
      <section
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 16,
            padding: '40px',
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              color: '#C9A84C',
              marginTop: 0,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>📖</span> {t('landing.storyTitle')}
          </h2>

          <p
            style={{
              fontSize: 18,
              color: '#FFF8F0',
              lineHeight: 1.7,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {t('landing.storyIntro')}
          </p>

          <p
            style={{
              fontSize: 16,
              color: '#FFF8F0',
              opacity: 0.75,
              lineHeight: 1.8,
              fontStyle: 'italic',
            }}
          >
            {t('landing.storyDetail')}
          </p>

          {/* Story keywords */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 24,
              justifyContent: 'center',
            }}
          >
            {['Mystery', 'Betrayal', 'Family Secrets', 'Murder?', 'Inheritance', 'The Truth'].map(tag => (
              <span
                key={tag}
                style={{
                  padding: '4px 14px',
                  background: 'rgba(139,41,66,0.4)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 20,
                  fontSize: 13,
                  color: '#C9A84C',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── How to Play ── */}
        <h2
          style={{
            fontSize: 'clamp(22px, 3vw, 32px)',
            color: '#C9A84C',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>🎮</span> {t('landing.gameplayTitle')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 60,
          }}
        >
          {[
            {
              icon: '🔗',
              num: '01',
              title: t('landing.gameplayStep1Title'),
              desc: t('landing.gameplayStep1Desc'),
            },
            {
              icon: '📋',
              num: '02',
              title: t('landing.gameplayStep2Title'),
              desc: t('landing.gameplayStep2Desc'),
            },
            {
              icon: '🔍',
              num: '03',
              title: t('landing.gameplayStep3Title'),
              desc: t('landing.gameplayStep3Desc'),
            },
            {
              icon: '🏚️',
              num: '04',
              title: t('landing.gameplayStep4Title'),
              desc: t('landing.gameplayStep4Desc'),
            },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,248,240,0.04)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 12,
                padding: 24,
                position: 'relative',
              }}
            >
              {/* Step number */}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: 20,
                  background: '#1a0f0a',
                  padding: '0 8px',
                  fontSize: 12,
                  color: '#C9A84C',
                  opacity: 0.6,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {step.num}
              </div>

              <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>

              <h3
                style={{
                  fontSize: 17,
                  color: '#FFF8F0',
                  marginTop: 0,
                  marginBottom: 10,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: '#FFF8F0',
                  opacity: 0.65,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Start Button ── */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleStart}
            style={{
              background: 'linear-gradient(135deg, #8B2942 0%, #C9A84C 100%)',
              border: '2px solid #C9A84C',
              borderRadius: 12,
              padding: '18px 48px',
              fontSize: 20,
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              color: '#FFF8F0',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 24px rgba(139,41,66,0.5), 0 0 40px rgba(201,168,76,0.2)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 8px 32px rgba(139,41,66,0.6), 0 0 60px rgba(201,168,76,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 24px rgba(139,41,66,0.5), 0 0 40px rgba(201,168,76,0.2)';
            }}
          >
            {t('landing.startButton')}
          </button>

          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: '#FFF8F0',
              opacity: 0.35,
            }}
          >
            {t('landing.languageSelect')}: English · 中文 · 日本語 · 한국어
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 60,
            paddingTop: 24,
            borderTop: '1px solid rgba(201,168,76,0.1)',
            opacity: 0.4,
            fontSize: 12,
          }}
        >
          Mansion of Secrets © 2026 · Built with React + TypeScript
        </div>
      </section>
    </div>
  );
}
