import React, { useState, useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { saveGame } from './services/saveService';
import { Sound } from './services/soundService';
import { TopBar } from './ui/components/TopBar';
import { MergeBoard } from './ui/components/MergeBoard';
import { OrdersPanel } from './ui/components/OrdersPanel';
import { StoryPanel } from './ui/components/StoryPanel';
import { CutsceneModal } from './ui/components/CutsceneModal';
import { CHAPTERS } from './data/chapters';
import { startEnergyTimer } from './stores/gameStore';

function App() {
  const [showCutscene, setShowCutscene] = useState(false);
  const [activeView, setActiveView] = useState<'merge' | 'rooms'>('merge');
  const { storyProgress, currentChapter } = useGameStore();

  // Start energy auto-regen timer
  useEffect(() => {
    startEnergyTimer();
  }, []);
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

  return (
    <div className="w-full h-full relative" style={{ background: '#1a0f0a' }}>
      <TopBar />

      {/* Main content */}
      <div className="flex h-full pt-[60px]">
        {/* Left panel - Story / Family Secrets */}
        <div className="w-64 p-4 shrink-0 hidden md:block">
          <StoryPanel />
        </div>

        {/* Center - Game area */}
        <div className="flex-1 relative" style={{ minHeight: '520px' }}>
          {activeView === 'merge' ? (
            <MergeBoard />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-4xl mb-4">🏚️</p>
                <p className="font-display text-2xl text-[#C9A84C]">Renovate Your Mansion</p>
                <p className="mt-2 text-[#FFF8F0]/60">
                  Complete orders to unlock rooms
                </p>
                <div className="mt-6 space-y-3">
                  {currentChapterData?.rooms?.map((room: string) => (
                    <div key={room} className="order-card text-left">
                      <p className="text-[#FFF8F0] font-semibold">{room}</p>
                      <p className="text-2xl mt-1">🔒</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View toggle */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3"
            style={{ zIndex: 50 }}
          >
            <button
              className={`btn-primary ${activeView === 'merge' ? '' : 'opacity-60'}`}
              onClick={() => { setActiveView('merge'); Sound.click(); }}
            >
              🧩 Merge Board
            </button>
            <button
              className={`btn-primary ${activeView === 'rooms' ? '' : 'opacity-60'}`}
              onClick={() => { setActiveView('rooms'); Sound.click(); }}
            >
              🏠 Rooms
            </button>
          </div>
        </div>

        {/* Right panel - Orders */}
        <div className="w-72 p-4 shrink-0 hidden lg:block">
          <OrdersPanel />
        </div>
      </div>

      {/* Story progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1a0f0a] to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[#C9A84C] font-semibold">
                {currentChapterData?.title || 'Chapter 1'}
              </span>
              <span className="text-sm text-[#FFF8F0]/60">{storyProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${storyProgress}%` }} />
            </div>
          </div>
          <button
            className={`btn-gold`}
            onClick={() => { setShowCutscene(true); Sound.click(); }}
          >
            Continue Story
          </button>
        </div>
      </div>

      {/* Cutscene modal */}
      {showCutscene && (
        <CutsceneModal onClose={() => setShowCutscene(false)} />
      )}
    </div>
  );
}

export default App;
