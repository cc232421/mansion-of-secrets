import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createRandomL1Item, canMerge, getItemConfig, Item, ItemLevel, createItem } from '../../data/items';
import './MergeBoard.css';

// Constants
const CELL_SIZE = 72;
const CELL_GAP = 4;
const CELL_TOTAL = CELL_SIZE + CELL_GAP; // 76
const COLS = 6;
const ROWS = 6;

interface DragInfo {
  itemId: string;
  item: Item;
  sourceCol: number;
  sourceRow: number;
  clientX: number;
  clientY: number;
}

interface FloatItem {
  id: string;
  item: Item;
  clientX: number;
  clientY: number;
}

interface MergeEffect {
  col: number;
  row: number;
  coins: number;
  key: string;
}

export function MergeBoard() {
  const { addCoins } = useGameStore();

  // 2D grid: grid[row][col]
  const [grid, setGrid] = useState<(Item | null)[][]>(() => {
    const g: (Item | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (let i = 0; i < 8; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      g[row][col] = createRandomL1Item();
    }
    return g;
  });

  // Currently floating item (being dragged)
  const [floatItem, setFloatItem] = useState<FloatItem | null>(null);

  // Highlight cell when hovering with drag
  const [highlightCell, setHighlightCell] = useState<{ col: number; row: number } | null>(null);

  // Merge effect animations
  const [mergeEffects, setMergeEffects] = useState<MergeEffect[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<DragInfo | null>(null);

  // Auto-spawn items
  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(prev => {
        const empty: { col: number; row: number }[] = [];
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (!prev[r][c]) empty.push({ col: c, row: r });
        if (empty.length === 0) return prev;
        const target = empty[Math.floor(Math.random() * empty.length)];
        const newGrid = prev.map(r => [...r]);
        newGrid[target.row][target.col] = createRandomL1Item();
        return newGrid;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Convert client coords → grid cell
  const clientToGrid = useCallback((clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const col = Math.floor(relX / CELL_TOTAL);
    const row = Math.floor(relY / CELL_TOTAL);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) return { col, row };
    return null;
  }, []);

  // Pointer Down on item
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, col: number, row: number) => {
    const item = grid[row][col];
    if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfoRef.current = {
      itemId: item.id,
      item,
      sourceCol: col,
      sourceRow: row,
      clientX: e.clientX,
      clientY: e.clientY,
    };
    setFloatItem({ id: item.id, item, clientX: e.clientX, clientY: e.clientY });
    // Remove from grid immediately
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = null;
      return newGrid;
    });
  };

  // Global pointer move (for floating item)
  useEffect(() => {
    if (!floatItem) return;

    const handleMove = (e: PointerEvent) => {
      setFloatItem(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null);
      const pos = clientToGrid(e.clientX, e.clientY);
      setHighlightCell(pos);
    };

    const handleUp = (e: PointerEvent) => {
      if (!dragInfoRef.current) return;
      const pos = clientToGrid(e.clientX, e.clientY);

      if (pos) {
        const targetItem = grid[pos.row][pos.col];

        if (targetItem && canMerge(floatItem!.item, targetItem)) {
          // ✅ MERGE
          const newLevel = (floatItem!.item.level + 1) as ItemLevel;
          const reward = newLevel === 2 ? 50 : 150;

          setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[pos.row][pos.col] = createItem(newLevel, floatItem!.item.type);
            return newGrid;
          });

          setMergeEffects(prev => [...prev, { col: pos.col, row: pos.row, coins: reward, key: `merge_${Date.now()}` }]);
          setTimeout(() => setMergeEffects(prev => prev.slice(1)), 1000);
          addCoins(reward);
        } else if (!targetItem) {
          // ✅ MOVE to empty
          setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[pos.row][pos.col] = floatItem!.item;
            return newGrid;
          });
        } else {
          // ❌ Return to source
          setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[dragInfoRef.current!.sourceRow][dragInfoRef.current!.sourceCol] = floatItem!.item;
            return newGrid;
          });
        }
      } else {
        // Dropped outside — return to source
        setGrid(prev => {
          const newGrid = prev.map(r => [...r]);
          newGrid[dragInfoRef.current!.sourceRow][dragInfoRef.current!.sourceCol] = floatItem!.item;
          return newGrid;
        });
      }

      dragInfoRef.current = null;
      setFloatItem(null);
      setHighlightCell(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [floatItem, grid, clientToGrid, addCoins]);

  return (
    <div className="merge-board-wrapper">
      {/* Floating dragged item */}
      {floatItem && (
        <div
          className="merge-item floating"
          style={{
            position: 'fixed',
            left: floatItem.clientX - 36,
            top: floatItem.clientY - 36,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <span className="item-emoji">{getItemConfig(floatItem.item).emoji}</span>
        </div>
      )}

      {/* The board grid */}
      <div
        ref={boardRef}
        className="merge-board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((item, colIdx) => {
            const isHighlight = highlightCell?.col === colIdx && highlightCell?.row === rowIdx;
            const effect = mergeEffects.find(e => e.col === colIdx && e.row === rowIdx);
            return (
              <div
                key={`${colIdx}-${rowIdx}`}
                className={`merge-cell ${isHighlight ? 'merge-cell-highlight' : ''}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              >
                {item && (
                  <div
                    className={`merge-item level-${item.level}`}
                    onPointerDown={(e) => handlePointerDown(e, colIdx, rowIdx)}
                  >
                    <span className="item-emoji">{getItemConfig(item).emoji}</span>
                    {item.level === 3 && <span className="item-star">★</span>}
                  </div>
                )}
                {effect && (
                  <div className="merge-coin-effect" key={effect.key}>
                    +{effect.coins}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
