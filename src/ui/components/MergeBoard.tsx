import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createRandomL1Item, canMerge, getItemConfig, Item, ItemLevel } from '../../data/items';
import { COLORS } from '../../game/config/boardConfig';

const CELL_SIZE = 80;
const CELL_GAP = 4;
const COLS = 6;
const ROWS = 6;

interface BoardItem {
  id: string;
  item: Item;
  col: number;
  row: number;
}

export function MergeBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemsRef = useRef<BoardItem[]>([]);
  const dragRef = useRef<{ item: BoardItem; offsetX: number; offsetY: number } | null>(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const { coins, addCoins, spendEnergy, energy } = useGameStore();

  // Initialize board
  useEffect(() => {
    const initial: BoardItem[] = [];
    for (let i = 0; i < 8; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      initial.push({ id: `init_${i}`, item: createRandomL1Item(), col, row });
    }
    itemsRef.current = initial;
    forceUpdate();
  }, []);

  const getCellCenter = useCallback((col: number, row: number) => {
    const boardWidth = COLS * (CELL_SIZE + CELL_GAP);
    const boardHeight = ROWS * (CELL_SIZE + CELL_GAP);
    const offsetX = (window.innerWidth - boardWidth) / 2;
    const offsetY = (window.innerHeight - boardHeight) / 2 + 60;
    return {
      x: offsetX + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
      y: offsetY + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
    };
  }, []);

  const getCellFromPos = useCallback((x: number, y: number) => {
    const boardWidth = COLS * (CELL_SIZE + CELL_GAP);
    const boardHeight = ROWS * (CELL_SIZE + CELL_GAP);
    const offsetX = (window.innerWidth - boardWidth) / 2;
    const offsetY = (window.innerHeight - boardHeight) / 2 + 60;
    const col = Math.floor((x - offsetX) / (CELL_SIZE + CELL_GAP));
    const row = Math.floor((y - offsetY) / (CELL_SIZE + CELL_GAP));
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) return { col, row };
    return null;
  }, []);

  const findEmptyCell = useCallback(() => {
    const occupied = new Set(itemsRef.current.map(i => `${i.col}-${i.row}`));
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!occupied.has(`${col}-${row}`)) return { col, row };
      }
    }
    return null;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    // Board background
    const boardWidth = COLS * (CELL_SIZE + CELL_GAP);
    const boardHeight = ROWS * (CELL_SIZE + CELL_GAP);
    const offsetX = (width - boardWidth) / 2;
    const offsetY = (height - boardHeight) / 2 + 60;

    // Draw wood background
    ctx.fillStyle = COLORS.wood;
    ctx.beginPath();
    ctx.roundRect(offsetX - 15, offsetY - 15, boardWidth + 30, boardHeight + 30, 12);
    ctx.fill();

    // Draw cells
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = offsetX + col * (CELL_SIZE + CELL_GAP);
        const y = offsetY + row * (CELL_SIZE + CELL_GAP);
        ctx.fillStyle = COLORS.boardCell;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, CELL_SIZE - CELL_GAP, CELL_SIZE - CELL_GAP, 8);
        ctx.fill();
      }
    }

    // Draw items
    for (const boardItem of itemsRef.current) {
      const { x, y } = getCellCenter(boardItem.col, boardItem.row);
      const config = getItemConfig(boardItem.item);
      const radius = 32;

      // Glow
      ctx.save();
      ctx.shadowColor = config.glowColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Border
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Emoji
      ctx.font = `${boardItem.item.level === 3 ? 36 : boardItem.item.level === 2 ? 30 : 24}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.emoji, x, y);

      // Star for L3
      if (boardItem.item.level === 3) {
        ctx.fillStyle = COLORS.gold;
        ctx.font = '14px serif';
        ctx.fillText('★', x + radius - 8, y - radius + 8);
      }
    }
  }, [getCellCenter]);

  useEffect(() => {
    draw();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked item
      for (let i = itemsRef.current.length - 1; i >= 0; i--) {
        const boardItem = itemsRef.current[i];
        const { x: cx, y: cy } = getCellCenter(boardItem.col, boardItem.row);
        const dist = Math.hypot(x - cx, y - cy);
        if (dist < 35) {
          dragRef.current = { item: boardItem, offsetX: x - cx, offsetY: y - cy };
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { col, row } = getCellFromPos(x - dragRef.current.offsetX, y - dragRef.current.offsetY) || {};
      if (col !== undefined && row !== undefined) {
        dragRef.current.item.col = col;
        dragRef.current.item.row = row;
        draw();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { item } = dragRef.current;
      dragRef.current = null;

      // Check for merge
      const target = itemsRef.current.find(
        other =>
          other.id !== item.id &&
          other.col === item.col &&
          other.row === item.row &&
          canMerge(item.item, other.item)
      );

      if (target) {
        // Merge!
        const newLevel = (item.item.level + 1) as ItemLevel;
        const reward = newLevel === 2 ? 50 : 150;
        addCoins(reward);

        // Remove both, create new merged item
        itemsRef.current = itemsRef.current.filter(i => i.id !== item.id && i.id !== target.id);
        itemsRef.current.push({
          id: `merged_${Date.now()}`,
          item: { ...item.item, level: newLevel, id: `item_${Date.now()}` },
          col: item.col,
          row: item.row,
        });

        forceUpdate();
        draw();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draw, getCellCenter, getCellFromPos, addCoins]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ display: 'block', cursor: dragRef.current ? 'grabbing' : 'grab' }}
    />
  );
}
