import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { createRandomL1Item, canMerge, getItemConfig, Item, ItemLevel, createItem, MERGE_ITEMS, isFusion } from '../../data/items';
import { Sound } from '../../services/soundService';
import './MergeBoard.css';

const CELL_GAP = 4; // px gap between cells
const COLS = 6;
const ROWS = 6;
const BOARD_PADDING = 12; // px padding inside board
const MIN_CELL_SIZE = 44; // minimum cell size on smallest phones

interface DragState {
  item: Item;
  sourceIndex: number;
  currentCol: number;
  currentRow: number;
}

interface MergeEffect {
  col: number;
  row: number;
  coins: number;
  key: string;
  isFusion?: boolean;
  isLegendary?: boolean;
}

interface MergeBoardProps {
  onLegendaryMerge?: (item: Item) => void;
}

export function MergeBoard({ onLegendaryMerge }: MergeBoardProps) {
  const { t } = useTranslation();
  const { board, setBoardItems, addCoins, sellItem, arrangeBoard } = useGameStore();
  const currentEnergy = useGameStore(s => s.calculateCurrentEnergy());
  const energyTier = Math.floor((currentEnergy / 120) * 5); // 0-4
  const isLowEnergy = energyTier === 0;
  const isHighEnergy = energyTier === 4;
  const [arranging, setArranging] = useState(false);

  // Responsive cell size — calculated from container width
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MIN_CELL_SIZE);

  // Calculate cell size from container width
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const available = container.clientWidth - BOARD_PADDING * 2;
      const raw = (available - CELL_GAP * (COLS - 1)) / COLS;
      setCellSize(Math.max(MIN_CELL_SIZE, Math.floor(raw)));
    };

    update(); // Initial calculation

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const cellTotal = cellSize + CELL_GAP;

  // Current drag state
  const [drag, setDrag] = useState<DragState | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [highlightCell, setHighlightCell] = useState<{ col: number; row: number } | null>(null);
  const [mergeEffects, setMergeEffects] = useState<MergeEffect[]>([]);
  const [noEnergy, setNoEnergy] = useState(false);
  const [sellMode, setSellMode] = useState(false);
  const [sellEffect, setSellEffect] = useState<{ index: number; coins: number; key: string } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Energy check
  useEffect(() => {
    setNoEnergy(currentEnergy === 0);
  }, [currentEnergy]);

  // ESC to exit sell mode
  useEffect(() => {
    if (!sellMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSellMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sellMode]);

  // Auto-spawn items every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const emptyIndices: number[] = [];
      for (let i = 0; i < 36; i++) {
        if (!board[i]) emptyIndices.push(i);
      }
      if (emptyIndices.length === 0) return;
      const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      setBoardItems([{ index: idx, item: createRandomL1Item() }]);
      Sound.spawn();
    }, 3000);
    return () => clearInterval(interval);
  }, [board, setBoardItems]);

  // Client → grid cell
  const clientToCell = useCallback((clientX: number, clientY: number) => {
    const br = boardRef.current;
    if (!br) return null;
    const rect = br.getBoundingClientRect();
    const relX = clientX - rect.left - BOARD_PADDING;
    const relY = clientY - rect.top - BOARD_PADDING;
    const col = Math.floor(relX / cellTotal);
    const row = Math.floor(relY / cellTotal);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      return { col, row, index: row * COLS + col };
    }
    return null;
  }, [cellTotal]);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (noEnergy) return;
    const item = board[index];
    if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    setMouseX(e.clientX);
    setMouseY(e.clientY);
    setDrag({ item, sourceIndex: index, currentCol: col, currentRow: row });
    Sound.pickup();
  };

  // Pointer Move
  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: PointerEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
      const pos = clientToCell(e.clientX, e.clientY);
      if (pos) {
        setHighlightCell(pos);
        setDrag(prev => prev ? { ...prev, currentCol: pos.col, currentRow: pos.row } : null);
      } else {
        setHighlightCell(null);
      }
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [drag, clientToCell]);

  // Pointer Up
  useEffect(() => {
    if (!drag) return;
    const handleUp = (e: PointerEvent) => {
      const pos = clientToCell(e.clientX, e.clientY);

      if (pos) {
        const targetIndex = pos.row * COLS + pos.col;
        const targetItem = board[targetIndex];

        if (targetItem && canMerge(drag.item, targetItem) && targetIndex !== drag.sourceIndex) {
          // ✅ MERGE
          const newLevel = (drag.item.level + 1) as ItemLevel;
          const isFusionMerge = isFusion(drag.item, targetItem);

          // Determine result type:
          // - Standard merge: same type as source item
          // - Fusion (L3 + different L3): 50% same-type, 50% random type
          let resultType = drag.item.type;
          if (isFusionMerge && newLevel === 4) {
            const allTypes: ('key' | 'photo' | 'crystal')[] = ['key', 'photo', 'crystal'];
            const sameTypeChance = Math.random() < 0.5;
            if (!sameTypeChance) {
              const otherTypes = allTypes.filter(t => t !== drag.item.type);
              resultType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
            }
          }

          const configs = MERGE_ITEMS[newLevel];
          const cfg = configs?.find(c => c.type === resultType);
          const reward = cfg?.mergeReward ?? (newLevel === 4 ? 500 : newLevel === 3 ? 300 : 150);

          const newItem = createItem(newLevel, resultType);

          const updates: { index: number; item: Item | null }[] = [
            { index: drag.sourceIndex, item: null },
            { index: targetIndex, item: newItem },
          ];
          setBoardItems(updates);
          setMergeEffects(prev => [...prev, {
            col: pos.col, row: pos.row, coins: reward,
            key: `m_${Date.now()}`, isFusion: isFusionMerge,
            isLegendary: newLevel === 4,
          }]);
          setTimeout(() => setMergeEffects(prev => prev.slice(1)), 1200);
          addCoins(reward);

          if (newLevel === 4) {
            Sound.legendaryMerge();
            onLegendaryMerge?.(newItem);
          } else {
            Sound.merge(newLevel);
          }
        } else if (!targetItem && targetIndex !== drag.sourceIndex) {
          // ✅ MOVE
          const updates: { index: number; item: Item | null }[] = [
            { index: drag.sourceIndex, item: null },
            { index: targetIndex, item: drag.item },
          ];
          setBoardItems(updates);
          Sound.drop();
        }
      }
      // Dropped outside → item stays at source

      setDrag(null);
      setHighlightCell(null);
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, board, clientToCell, setBoardItems, addCoins]);

  const totalBoardW = BOARD_PADDING * 2 + cellSize * COLS + CELL_GAP * (COLS - 1);
  const totalBoardH = BOARD_PADDING * 2 + cellSize * ROWS + CELL_GAP * (ROWS - 1);

  const handleArrange = () => {
    if (arranging) return;
    setArranging(true);
    const result = arrangeBoard();
    if (!result.success) {
      Sound.error();
    } else {
      Sound.merge(1);
    }
    setTimeout(() => setArranging(false), 400);
  };

  return (
    <div
      className={`merge-board-wrapper ${isLowEnergy ? 'low-energy' : ''} ${isHighEnergy ? 'high-energy' : ''}`}
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      {/* Arrange button */}
      <button
        className={`arrange-btn ${arranging ? 'arranging' : ''}`}
        onClick={handleArrange}
        title="整理棋盘（10金币）"
      >
        🧹 整理
      </button>

      {/* Sell button */}
      <button
        className={`sell-btn ${sellMode ? 'sell-btn-active' : ''}`}
        onClick={() => setSellMode(m => !m)}
        title="出售物品"
      >
        💰 {sellMode ? '完成出售' : '出售物品'}
      </button>

      {/* No energy overlay */}
      {noEnergy && (
        <div className="energy-overlay">
          <p>⚡ {t('menu.outOfEnergy')}</p>
          <p className="text-sm mt-1 opacity-70">{t('menu.buyMore')}</p>
        </div>
      )}

      {/* Sell mode overlay — dims board */}
      {sellMode && (
        <div className="sell-mode-overlay">
          <div className="sell-mode-hint">点击物品出售 · ESC退出</div>
        </div>
      )}

      {/* Floating dragged item */}
      {drag && (
        <div
          className="merge-item floating"
          style={{
            position: 'fixed',
            left: mouseX - cellSize / 2,
            top: mouseY - cellSize / 2,
            zIndex: 9999,
            pointerEvents: 'none',
            width: cellSize,
            height: cellSize,
          }}
        >
          <span className="item-emoji" style={{ fontSize: cellSize * 0.55 }}>{getItemConfig(drag.item).emoji}</span>
        </div>
      )}

      {/* Board grid */}
      <div
        ref={boardRef}
        className="merge-board"
        style={{
          width: totalBoardW,
          height: totalBoardH,
          padding: BOARD_PADDING,
          gap: `${CELL_GAP}px`,
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
          display: 'grid',
        }}
      >
        {board.map((item, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);
          const isHighlight = highlightCell?.col === col && highlightCell?.row === row;
          const isDragSource = drag?.sourceIndex === index;
          const effect = mergeEffects.find(e => e.col === col && e.row === row);

          return (
            <div
              key={index}
              className={`merge-cell ${isHighlight ? 'merge-cell-highlight' : ''} ${effect?.isLegendary ? 'legendary-flash' : ''}`}
              style={{ width: cellSize, height: cellSize }}
            >
              {item && !isDragSource && (
                <div
                  className={`merge-item level-${item.level}${sellMode ? ' sell-mode-item' : ''}`}
                  onPointerDown={(e) => {
                    if (sellMode) {
                      e.stopPropagation();
                      return;
                    }
                    handlePointerDown(e, index);
                  }}
                  onClick={() => {
                    if (!sellMode || !item) return;
                    const { success, coinsEarned } = sellItem(index);
                    if (success) {
                      Sound.coin();
                      setSellEffect({ index, coins: coinsEarned, key: `sell_${Date.now()}` });
                      setTimeout(() => setSellEffect(null), 1200);
                    }
                  }}
                  style={{ width: cellSize, height: cellSize }}
                  title={sellMode ? `出售 +${({ 1: 5, 2: 15, 3: 50, 4: 200 }[item.level] ?? 5)} 金币` : undefined}
                >
                  <span className="item-emoji" style={{ fontSize: cellSize * 0.55 }}>{getItemConfig(item).emoji}</span>
                  {item.level === 3 && <span className="item-star">★</span>}
                  {item.level >= 4 && <span className="item-star item-star-lg">★★★</span>}
                  {sellMode && (
                    <span className="sell-price-badge">
                      +{({ 1: 5, 2: 15, 3: 50, 4: 200 }[item.level] ?? 5)}
                    </span>
                  )}
                </div>
              )}
              {effect && (
                <div className={`merge-coin-effect ${effect.isLegendary ? 'legendary' : ''}`} key={effect.key}>
                  {effect.isLegendary
                    ? `★ +${effect.coins} ★`
                    : effect.isFusion
                      ? '⚡ 融合！'
                      : `+${effect.coins}`}
                </div>
              )}
              {sellEffect && sellEffect.index === index && (
                <div className="sell-coin-effect" key={sellEffect.key}>
                  💰 +{sellEffect.coins}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
