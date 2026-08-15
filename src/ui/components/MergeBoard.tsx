import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createRandomL1Item, canMerge, getItemConfig, Item, ItemLevel, createItem, MERGE_ITEMS } from '../../data/items';
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
}

export function MergeBoard() {
  const { board, setBoardItems, addCoins } = useGameStore();
  const currentEnergy = useGameStore(s => s.calculateCurrentEnergy());

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

  const boardRef = useRef<HTMLDivElement>(null);

  // Energy check
  useEffect(() => {
    setNoEnergy(currentEnergy === 0);
  }, [currentEnergy]);

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
          const configs = MERGE_ITEMS[newLevel];
          const cfg = configs?.find(c => c.type === drag.item.type);
          const reward = cfg?.mergeReward ?? 300;

          const updates: { index: number; item: Item | null }[] = [
            { index: drag.sourceIndex, item: null },
            { index: targetIndex, item: createItem(newLevel, drag.item.type) },
          ];
          setBoardItems(updates);
          setMergeEffects(prev => [...prev, { col: pos.col, row: pos.row, coins: reward, key: `m_${Date.now()}` }]);
          setTimeout(() => setMergeEffects(prev => prev.slice(1)), 1000);
          addCoins(reward);

          if (newLevel === 4) {
            Sound.legendaryMerge();
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

  return (
    <div className="merge-board-wrapper" ref={containerRef}>
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
              style={{ width: cellSize, height: cellSize }}
            >
              {item && !isDragSource && (
                <div
                  className={`merge-item level-${item.level}`}
                  onPointerDown={(e) => handlePointerDown(e, index)}
                  style={{ width: cellSize, height: cellSize }}
                >
                  <span className="item-emoji" style={{ fontSize: cellSize * 0.55 }}>{getItemConfig(item).emoji}</span>
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
