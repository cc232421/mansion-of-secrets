import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from './stores/gameStore';
import { saveGame } from './services/saveService';
import { Sound } from './services/soundService';
import { LandingPage } from './ui/components/LandingPage';
import { TopBar } from './ui/components/TopBar';
import { MergeBoard } from './ui/components/MergeBoard';
import { OrdersPanel } from './ui/components/OrdersPanel';
import { StoryPanel } from './ui/components/StoryPanel';
import { CutsceneModal } from './ui/components/CutsceneModal';
import { LegendaryMergeModal } from './ui/components/LegendaryMergeModal';
import { EvidenceTeaserToast } from './ui/components/EvidenceTeaserToast';
import { RoomUnlockAnimation } from './ui/components/RoomUnlockAnimation';
import { TabBar, Tab } from './ui/components/TabBar';
import { Item } from './data/items';
import { CHAPTERS } from './data/chapters';
import { startEnergyTimer } from './stores/gameStore';

type Layout = 'mobile' | 'tablet' | 'desktop';

function getLayout(): Layout {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function App() {
  const [showCutscene, setShowCutscene] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [legendaryItem, setLegendaryItem] = useState<Item | null>(null);
  const { t } = useTranslation();
  const { storyProgress, currentChapter, latestEvidence, latestUnlockedRoom, rooms, clearLatestEvidence, clearLatestUnlockedRoom } = useGameStore();

  // Track screen size for responsive layout
  const [layout, setLayout] = useState<Layout>('desktop');

  // Mobile: which tab is active
  const [mobileTab, setMobileTab] = useState<Tab>('merge');

  // Listen for resize
  useEffect(() => {
    const update = () => setLayout(getLayout());
    update(); // initial
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  // Start energy auto-regen timer
  useEffect(() => {
    startEnergyTimer();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const state = useGameStore.getState();
      await saveGame(state);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for story trigger
  useEffect(() => {
    const lastCutscene = localStorage.getItem('lastCutscene');
    const shouldTrigger =
      storyProgress >= 5 && storyProgress < 10 && !lastCutscene;
    if (shouldTrigger) {
      setShowCutscene(true);
    }
  }, [storyProgress]);

  const currentChapterData = CHAPTERS[currentChapter - 1]?.[0];

  if (!gameStarted) {
    return <LandingPage onStart={() => setGameStarted(true)} />;
  }

  return (
    <div className="w-full h-full relative" style={{ background: '#1a0f0a' }}>
      <TopBar />

      {/* ── Mobile layout (≤767px) ───────────────────────────────── */}
      {layout === 'mobile' && (
        <MobileLayout
          mobileTab={mobileTab}
          onTabChange={setMobileTab}
          onLegendaryMerge={setLegendaryItem}
        />
      )}

      {/* ── Tablet layout (768px–1023px) ───────────────────────── */}
      {layout === 'tablet' && (
        <TabletLayout
          currentChapterData={currentChapterData}
          storyProgress={storyProgress}
          onContinue={() => setShowCutscene(true)}
          onLegendaryMerge={setLegendaryItem}
        />
      )}

      {/* ── Desktop layout (≥1024px) ─────────────────────────────── */}
      {layout === 'desktop' && (
        <DesktopLayout
          currentChapterData={currentChapterData}
          storyProgress={storyProgress}
          onContinue={() => setShowCutscene(true)}
          onLegendaryMerge={setLegendaryItem}
        />
      )}

      {/* Cutscene modal */}
      {showCutscene && (
        <CutsceneModal onClose={() => setShowCutscene(false)} />
      )}

      {/* Legendary merge modal */}
      {legendaryItem && (
        <LegendaryMergeModal
          item={legendaryItem}
          onClose={() => setLegendaryItem(null)}
        />
      )}

      {/* Evidence teaser toast */}
      <EvidenceToast />

      {/* Room unlock animation */}
      <RoomUnlockToast />
    </div>
  );
}

// ── Mobile Layout ────────────────────────────────────────────────
function MobileLayout({
  mobileTab,
  onTabChange,
  onLegendaryMerge,
}: {
  mobileTab: Tab;
  onTabChange: (t: Tab) => void;
  onLegendaryMerge?: (item: Item) => void;
}) {
  return (
    <>
      <div
        style={{
          height: 'calc(100vh - 52px - 60px)',
          padding: 8,
        }}
      >
        {mobileTab === 'merge' && <MergeBoard onLegendaryMerge={onLegendaryMerge} />}
        {mobileTab === 'orders' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <OrdersPanel />
          </div>
        )}
        {mobileTab === 'story' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <StoryPanel />
          </div>
        )}
      </div>
      <TabBar activeTab={mobileTab} onTabChange={onTabChange} />
    </>
  );
}

// ── Tablet Layout ─────────────────────────────────────────────────
function TabletLayout({
  currentChapterData,
  storyProgress,
  onContinue,
  onLegendaryMerge,
}: {
  currentChapterData: { title?: string } | undefined;
  storyProgress: number;
  onContinue: () => void;
  onLegendaryMerge?: (item: Item) => void;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', height: 'calc(100% - 60px)' }}>
        {/* Center: Merge Board */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <MergeBoard onLegendaryMerge={onLegendaryMerge} />
        </div>
        {/* Right: Orders */}
        <div
          style={{
            width: 280,
            borderLeft: '1px solid rgba(201,168,76,0.15)',
            padding: 12,
            overflow: 'auto',
          }}
        >
          <OrdersPanel />
        </div>
      </div>
      {/* Story progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 16px',
          background: 'linear-gradient(to top, rgba(26,15,10,0.95), transparent)',
          borderTop: '1px solid rgba(201,168,76,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>📖</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600 }}>
                {(currentChapterData as any)?.titleZh || currentChapterData?.title || '第1章'}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,248,240,0.6)' }}>{storyProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${storyProgress}%` }} />
            </div>
          </div>
          <button
            className="btn-gold"
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={onContinue}
          >
            {t('menu.continueStory')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Layout ────────────────────────────────────────────────
function DesktopLayout({
  currentChapterData,
  storyProgress,
  onContinue,
  onLegendaryMerge,
}: {
  currentChapterData: { title?: string } | undefined;
  storyProgress: number;
  onContinue: () => void;
  onLegendaryMerge?: (item: Item) => void;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      {/* Left: Story Panel */}
      <div
        style={{
          width: 256,
          borderRight: '1px solid rgba(201,168,76,0.15)',
          padding: 16,
        }}
      >
        <StoryPanel />
      </div>

      {/* Center: Game area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <MergeBoard onLegendaryMerge={onLegendaryMerge} />
        </div>
        {/* Continue Story */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
        >
          <button
            className="btn-gold"
            onClick={() => { onContinue(); Sound.click(); }}
          >
            {t('menu.continueStory')}
          </button>
        </div>
      </div>

      {/* Right: Orders Panel */}
      <div
        style={{
          width: 288,
          borderLeft: '1px solid rgba(201,168,76,0.15)',
          padding: 16,
        }}
      >
        <OrdersPanel />
      </div>
    </div>
  );
}

// ── Evidence Teaser Toast ─────────────────────────────────────────────
function EvidenceToast() {
  const { latestEvidence, rooms, clearLatestEvidence } = useGameStore();
  if (!latestEvidence) return null;
  const room = rooms.find(r => r.id === latestEvidence.roomId);
  return (
    <EvidenceTeaserToast
      evidence={latestEvidence}
      roomName={room?.name ?? ''}
      onClose={clearLatestEvidence}
    />
  );
}

// ── Room Unlock Animation ─────────────────────────────────────────────
function RoomUnlockToast() {
  const { latestUnlockedRoom, clearLatestUnlockedRoom } = useGameStore();
  if (!latestUnlockedRoom) return null;
  return (
    <RoomUnlockAnimation
      room={latestUnlockedRoom}
      onClose={clearLatestUnlockedRoom}
    />
  );
}

export default App;
