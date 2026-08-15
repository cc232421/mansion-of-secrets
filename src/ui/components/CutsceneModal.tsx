import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CHAPTERS, type Cutscene } from '../../data/chapters';
import { useGameStore } from '../../stores/gameStore';

interface CutsceneModalProps {
  onClose: () => void;
}

const SPEAKER_COLORS: Record<string, string> = {
  Emily: '#8B2942',
  Brad: '#4A5568',
  Claire: '#9F7AEA',
  Detective: '#2B6CB0',
  Narrator: '#C9A84C',
};

export function CutsceneModal({ onClose }: CutsceneModalProps) {
  const { t } = useTranslation();
  const [chapterIdx, setChapterIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const { advanceStory, markCutsceneSeen } = useGameStore();

  const chapter = CHAPTERS[chapterIdx]?.[0] as Cutscene | undefined;
  const cutscene = chapter;
  const line = cutscene?.lines[lineIdx];

  const handleNext = () => {
    if (!cutscene) return;

    if (lineIdx < cutscene.lines.length - 1) {
      setLineIdx(lineIdx + 1);
    } else if (chapterIdx < CHAPTERS.length - 1) {
      setChapterIdx(chapterIdx + 1);
      setLineIdx(0);
    } else {
      // End of all cutscenes
      advanceStory(10);
      markCutsceneSeen(cutscene.id);
      localStorage.setItem('lastCutscene', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    if (cutscene) {
      advanceStory(5);
      markCutsceneSeen(cutscene.id);
      localStorage.setItem('lastCutscene', 'true');
    }
    onClose();
  };

  if (!cutscene || !line) return null;

  return (
    <div className="cutscene-overlay" onClick={handleNext}>
      {/* Dark background with fade */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(26,15,10,0.95) 0%, rgba(0,0,0,0.98) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-8">
        {/* Chapter title */}
        <div className="text-center mb-8">
          <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-2">
            Chapter {chapter.chapter}
          </p>
          <h2
            className="font-display text-3xl text-[#FFF8F0]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {chapter.title}
          </h2>
        </div>

        {/* Speaker name */}
        <div className="mb-4">
          <span
            className="inline-block px-4 py-2 rounded-lg text-lg font-semibold text-[#FFF8F0]"
            style={{
              background: SPEAKER_COLORS[line.speaker] || '#8B2942',
              fontFamily: 'Georgia, serif',
            }}
          >
            {line.speaker}
          </span>
        </div>

        {/* Dialogue */}
        <div
          className="bg-[rgba(45,27,20,0.95)] border-2 border-[#C9A84C]/40 rounded-xl p-6 mb-8"
          style={{ minHeight: 120 }}
        >
          <p
            className="text-xl leading-relaxed text-[#FFF8F0]"
            style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}
          >
            {line.text}
          </p>
        </div>

        {/* Continue indicator */}
        <div className="text-center mb-6">
          <p className="text-[#C9A84C]/60 text-sm animate-pulse">
            {t('cutscene.tapToContinue')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button className="btn-primary text-sm" onClick={handleSkip}>
            {t('cutscene.skip')}
          </button>
          <button
            className={`btn-primary text-sm ${isAutoPlay ? 'ring-2 ring-[#C9A84C]' : ''}`}
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? '⏸ ' + t('cutscene.auto') : '▶ ' + t('cutscene.auto')}
          </button>
          <button className="btn-gold text-sm" onClick={handleNext}>
            {t('cutscene.next')} →
          </button>
        </div>
      </div>
    </div>
  );
}
