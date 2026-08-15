import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sound } from '../../services/soundService';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t } = useTranslation();

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
        display: 'flex',
        flexDirection: 'column',
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
          background: 'rgba(26,15,10,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <LanguageSwitcher />
      </nav>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* ── Hero ── */}
        <section
          style={{
            textAlign: 'center',
            padding: '60px 24px 40px',
            background: 'radial-gradient(ellipse at center top, rgba(139,41,66,0.35) 0%, transparent 70%)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 3,
              background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
              margin: '0 auto 28px',
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

          {/* ═══ HERO CTA BUTTON — most prominent! ═══ */}
          <div style={{ marginTop: 40 }}>
            <button
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #8B2942 0%, #C9A84C 100%)',
                border: '2px solid #C9A84C',
                borderRadius: 14,
                padding: '18px 56px',
                fontSize: 22,
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                color: '#FFF8F0',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 24px rgba(139,41,66,0.5), 0 0 60px rgba(201,168,76,0.25)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.03)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 10px 40px rgba(139,41,66,0.65), 0 0 80px rgba(201,168,76,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 24px rgba(139,41,66,0.5), 0 0 60px rgba(201,168,76,0.25)';
              }}
            >
              {t('landing.startButton')}
            </button>
          </div>
        </section>

        {/* ── Story ── */}
        <section
          style={{
            maxWidth: 800,
            margin: '0 auto',
            padding: '0 24px 60px',
          }}
        >
          <div
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 16,
              padding: '36px',
              marginBottom: 36,
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(22px, 3vw, 32px)',
                color: '#C9A84C',
                marginTop: 0,
                marginBottom: 20,
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
                marginBottom: 18,
                fontWeight: 500,
              }}
            >
              {t('landing.storyIntro')}
            </p>

            <p
              style={{
                fontSize: 15,
                color: '#FFF8F0',
                opacity: 0.72,
                lineHeight: 1.8,
                fontStyle: 'italic',
              }}
            >
              {t('landing.storyDetail')}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 22,
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
              marginBottom: 28,
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
              gap: 18,
              marginBottom: 48,
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
                  padding: 22,
                  position: 'relative',
                }}
              >
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

                <div style={{ fontSize: 34, marginBottom: 10 }}>{step.icon}</div>

                <h3
                  style={{
                    fontSize: 16,
                    color: '#FFF8F0',
                    marginTop: 0,
                    marginBottom: 8,
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

          {/* ═══ SECOND CTA — bottom of page ═══ */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #8B2942 0%, #C9A84C 100%)',
                border: '2px solid #C9A84C',
                borderRadius: 14,
                padding: '16px 48px',
                fontSize: 18,
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                color: '#FFF8F0',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 24px rgba(139,41,66,0.5), 0 0 40px rgba(201,168,76,0.2)',
              }}
            >
              {t('landing.startButton')}
            </button>

            <p
              style={{
                marginTop: 14,
                fontSize: 13,
                color: '#FFF8F0',
                opacity: 0.4,
              }}
            >
              {t('landing.languageSelect')}: English · 中文 · 日本語 · 한국어
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: 20,
              borderTop: '1px solid rgba(201,168,76,0.1)',
              opacity: 0.4,
              fontSize: 12,
            }}
          >
            Mansion of Secrets © 2026 · Built with React + TypeScript
          </div>
        </section>
      </div>
    </div>
  );
}
