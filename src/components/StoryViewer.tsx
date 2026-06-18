import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { STORY_CHAPTERS, type StoryChapter } from '../data/stories';
import PageHeader from './PageHeader';

interface Props {
  onBack: () => void;
}

export default function StoryViewer({ onBack }: Props) {
  const characterData = useGameStore((s) => s.characterData);
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const readStories = useGameStore((s) => s.readStories) ?? [];
  const markStoryRead = useGameStore((s) => s.markStoryRead);
  const addCoins = useGameStore((s) => s.addCoins);
  const addRubies = useGameStore((s) => s.addRubies);

  const [activeStory, setActiveStory] = useState<StoryChapter | null>(null);
  const [lineIdx, setLineIdx] = useState(0);

  const owned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0);

  function canView(ch: StoryChapter): boolean {
    const d = characterData[ch.charId];
    return ownedCounts[ch.charId] > 0 && (d?.level ?? 1) >= ch.levelRequired;
  }

  function startStory(ch: StoryChapter) {
    setActiveStory(ch);
    setLineIdx(0);
  }

  function advanceLine() {
    if (!activeStory) return;
    if (lineIdx < activeStory.lines.length - 1) {
      setLineIdx((i) => i + 1);
    } else {
      if (!readStories.includes(activeStory.id)) {
        markStoryRead(activeStory.id);
        addCoins(activeStory.rewardCoins);
        addRubies(activeStory.rewardRubies);
      }
      setActiveStory(null);
      setLineIdx(0);
    }
  }

  const RARITY_TEXT: Record<string, string> = { Common: 'text-slate-400', Rare: 'text-blue-300', Epic: 'text-purple-300', Legendary: 'text-yellow-300' };

  if (activeStory) {
    const line = activeStory.lines[lineIdx];
    const char = CHARACTER_POOL.find((c) => c.id === activeStory.charId);
    const isLast = lineIdx === activeStory.lines.length - 1;
    const alreadyRead = readStories.includes(activeStory.id);

    return (
      <div className="flex h-screen flex-col bg-[#070d1a] text-slate-100">
        {/* VN background */}
        <div className="relative flex-1 flex items-end justify-center overflow-hidden" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(100,80,160,0.15) 0%, #070d1a 70%)',
        }}>
          {char?.image && (
            <img src={char.image} alt="" className="absolute inset-0 h-full w-full object-contain opacity-20"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div className="absolute top-4 left-5 text-xs text-slate-600">
            {activeStory.title} · {lineIdx + 1}/{activeStory.lines.length}
          </div>
          <button
            onClick={() => { setActiveStory(null); setLineIdx(0); }}
            className="absolute top-4 right-5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs text-slate-400 hover:text-white"
          >
            Skip
          </button>
        </div>

        {/* Dialogue box */}
        <div
          className="flex-shrink-0 border-t border-slate-700/40 bg-slate-950/95 px-6 py-5 cursor-pointer"
          onClick={advanceLine}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className={`text-sm font-bold ${line.speaker === 'Narrator' ? 'italic text-slate-500' : 'text-white'}`}>
              {line.speaker}
            </span>
            {line.mood && line.mood !== 'neutral' && (
              <span className="text-xs text-slate-600">
                ({line.mood})
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-base leading-relaxed text-slate-300">
            {line.text}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-700">Click to continue</span>
            {isLast && !alreadyRead && (
              <span className="text-xs text-yellow-400">
                Reward: 🪙 {activeStory.rewardCoins} · 💎 {activeStory.rewardRubies}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Stories" onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {owned.length === 0 ? (
            <div className="text-center text-slate-600 py-20">
              <div className="text-4xl mb-3">📖</div>
              <div className="text-sm">No characters owned yet. Pull to unlock stories.</div>
            </div>
          ) : (
            owned.map((char) => {
              const chapters = STORY_CHAPTERS.filter((ch) => ch.charId === char.id);
              if (chapters.length === 0) return null;
              return (
                <div key={char.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800">
                      {char.image ? (
                        <img src={char.image} alt="" className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-400">{char.name.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{char.name}</div>
                      <div className={`text-[10px] font-semibold ${RARITY_TEXT[char.rarity]}`}>{char.rarity}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-13">
                    {chapters.map((ch) => {
                      const unlocked = canView(ch);
                      const read = readStories.includes(ch.id);
                      const level = characterData[char.id]?.level ?? 1;
                      return (
                        <button
                          key={ch.id}
                          disabled={!unlocked}
                          onClick={() => startStory(ch)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                            unlocked
                              ? read
                                ? 'border-slate-800/40 bg-slate-900/30 hover:bg-slate-800/40'
                                : 'border-yellow-700/40 bg-yellow-950/20 hover:bg-yellow-950/30'
                              : 'border-slate-800/20 bg-slate-900/10 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${read ? 'bg-green-900/30 text-green-400' : unlocked ? 'bg-yellow-950/40 text-yellow-300' : 'bg-slate-800/30 text-slate-600'}`}>
                            {read ? '✓' : '📖'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">{ch.title}</div>
                            <div className="text-[10px] text-slate-500">
                              {unlocked ? (read ? 'Completed' : 'New!') : `Requires Lv.${ch.levelRequired} (current: ${level})`}
                            </div>
                          </div>
                          {!read && unlocked && (
                            <div className="text-[10px] text-yellow-400">
                              🪙 {ch.rewardCoins} · 💎 {ch.rewardRubies}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
