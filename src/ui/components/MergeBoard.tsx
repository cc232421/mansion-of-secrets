import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createRandomL1Item, canMerge, getItemConfig, Item, ItemLevel, createItem } from '../../data/items';
import './MergeBoard.css';

// Board constants
const CELL_SIZE = 72;
const CELL_GAP = 4;
const CELL_TOTAL = CELL_SIZE + CELL_GAP; // 76px per cell
const COLS = 6;
const ROWS = 6;

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
}

export function MergeBoard() {
  const { board, setBoardItems, addCoins, energy } = useGameStore();
  const currentEnergy = useGameStore(s => s.calculateCurrentEnergy());

  // Current drag state
  const [drag, setDrag] = useState<DragState | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [highlightCell, setHighlightCell] = useState<{ col: number; row: number } | null>(null);
  const [mergeEffects, setMergeEffects] = useState<MergeEffect[]>([]);
  const [noEnergy, setNoEnergy] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  // ─── Energy check ───────────────────────────────────────────────
  useEffect(() => {
    const e = currentEnergy;
    setNoEnergy(e === 0);
  }, [currentEnergy]);

  // ─── Auto-spawn items ──────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      // Find empty slot
      const emptyIndices: number[] = [];
      for (let i = 0; i < 36; i++) {
        if (!board[i]) emptyIndices.push(i);
      }
      if (emptyIndices.length === 0) return;
      const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      setBoardItems([{ index: idx, item: createRandomL1Item() }]);
    }, 3000);
    return () => clearInterval(interval);
  }, [board, setBoardItems]);

  // ─── Client → grid cell ────────────────────────────────────────
  const clientToCell = useCallback((clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const col = Math.floor(relX / CELL_TOTAL);
    const row = Math.floor(relY / CELL_TOTAL);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) return { col, row, index: row * COLS + col };
    return null;
  }, []);

  // ─── Pointer Down ──────────────────────────────────────────────
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
  };

  // ─── Pointer Move ───────────────────────────────────────────────
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

  // ─── Pointer Up ─────────────────────────────────────────────────
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
          const reward = newLevel === 2 ? 50 : newLevel === 3 ? 150 : 300;

          const updates: { index: number; item: Item | null }[] = [
            { index: drag.sourceIndex, item: null },
            { index: targetIndex, item: createItem(newLevel, drag.item.type) },
          ];
          setBoardItems(updates);
          setMergeEffects(prev => [...prev, { col: pos.col, row: pos.row, coins: reward, key: `m_${Date.now()}` }]);
          setTimeout(() => setMergeEffects(prev => prev.slice(1)), 1000);
          addCoins(reward);
        } else if (!targetItem && targetIndex !== drag.sourceIndex) {
          // ✅ MOVE
          const updates: { index: number; item: Item | null }[] = [
            { index: drag.sourceIndex, item: null },
            { index: targetIndex, item: drag.item },
          ];
          setBoardItems(updates);
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

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className={`merge-board-wrapper ${noEnergy ? 'no-energy' : ''}`}>
      {/* No energy overlay */}
      {noEnergy && (
        <div className="energy-overlay">
          <p>⚡ Out of Energy!</p>
          <p className="text-sm mt-1 opacity-70">Buy more in Orders panel</p>
        </div>
      )}

      {/* Floating dragged item */}
      {drag && (
        <div
          className="merge-item floating"
          style={{
            position: 'fixed',
            left: mouseX - CELL_SIZE / 2,
            top: mouseY - CELL_SIZE / 2,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <span className="item-emoji">{getItemConfig(drag.item).emoji}</span>
        </div>
      )}

      {/* Board grid */}
      <div
        ref={boardRef}
        className="merge-board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
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
              className={`merge-cell ${isHighlight ? 'merge-cell-highlight' : ''}`}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            >
              {item && !isDragSource && (
                <div
                  className={`merge-item level-${item.level}`}
                  onPointerDown={(e) => handlePointerDown(e, index)}
                >
                  <span className="item-emoji">{getItemConfig(item).emoji}</span>
                  {item.level >= 3 && <span className="item-star">★</span>}
                </div>
              )}
              {effect && (
                <div className="merge-coin-effect" key={effect.key}>
                  +{effect.coins}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
