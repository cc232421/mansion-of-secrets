import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { CHAPTERS } from '../../data/chapters';

export function StoryPanel() {
  const { t } = useTranslation();
  const { storyProgress, currentChapter, seenCutscenes, evidence } = useGameStore();

  const currentChapterData = CHAPTERS[currentChapter - 1]?.[0];
  const currentChapterObj = { title: currentChapterData?.title || 'Chapter 1' };

  return (
    <div className="h-full flex flex-col">
      <h2
        className="font-display text-xl text-[#C9A84C] mb-3 flex items-center gap-2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        🔍 Family Secrets
      </h2>

      {/* Chapter progress */}
      <div className="mb-4">
        <p className="text-sm text-[#FFF8F0]/60 mb-1">Chapter {currentChapter}</p>
        <p className="text-[#FFF8F0] font-semibold">
                {currentChapterObj.title}
              </p>
        <div className="progress-bar mt-2">
          <div className="progress-fill" style={{ width: `${storyProgress}%` }} />
        </div>
      </div>

      {/* Characters */}
      <div className="mb-4">
        <p className="text-xs text-[#FFF8F0]/40 uppercase tracking-wider mb-2">Characters</p>
        <div className="space-y-2">
          {[
            { name: 'Emily', role: 'Protagonist', emoji: '👩', color: '#8B2942' },
            { name: 'Brad', role: 'Husband', emoji: '👨', color: '#4A5568' },
            { name: 'Claire', role: 'Sister', emoji: '👩‍🦰', color: '#9F7AEA' },
          ].map(char => (
            <div key={char.name} className="flex items-center gap-2">
              <span style={{ fontSize: 20 }}>{char.emoji}</span>
              <div>
                <p className="text-sm text-[#FFF8F0]">{char.name}</p>
                <p className="text-xs" style={{ color: char.color }}>{char.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence collected */}
      <div className="flex-1">
        <p className="text-xs text-[#FFF8F0]/40 uppercase tracking-wider mb-2">
          {t('story.evidenceCollected', { current: evidence.length, total: 3 })}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {evidence.length > 0 ? (
            evidence.filter(e => e.obtained).slice(0, 6).map(ev => (
              <div
                key={ev.id}
                className="aspect-square rounded flex items-center justify-center text-2xl"
                style={{ background: 'rgba(139,41,66,0.3)', border: '1px solid #8B2942' }}
                title={`${ev.type} evidence`}
              >
                {ev.type === 'key' ? '🗝️' : ev.type === 'photo' ? '🖼️' : '🔮'}
              </div>
            ))
          ) : (
            Array(6)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded flex items-center justify-center text-xl opacity-20"
                  style={{ background: 'rgba(201,168,76,0.1)' }}
                >
                  ❓
                </div>
              ))
          )}
        </div>
      </div>

      {/* Hint */}
      <div
        className="mt-3 p-3 rounded-lg text-xs"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <p className="text-[#C9A84C]">
          💡 Merge items to complete orders and uncover new secrets...
        </p>
      </div>
    </div>
  );
}
