# Mansion of Secrets — 重构方案 v2.0

> **版本：** v2.0  
**日期：** 2026-08-15  
**作者：** 网页游戏专家审计  
**状态：** 待实施

---

## 一、当前代码问题诊断（严苛审计）

### 🔴 P0 — 游戏无法运行（致命问题）

#### 问题 1：Canvas 坐标系统完全错位

**文件：** `src/ui/components/MergeBoard.tsx`

**根因：** `getCellFromPos` 和 `getCellCenter` 使用 `window.innerWidth` / `window.innerHeight` 计算棋盘偏移，但 canvas 有自己的 `getBoundingClientRect()` 坐标系，两者不匹配。

```typescript
// ❌ 错误代码
const getCellCenter = useCallback((col: number, row: number) => {
  const boardWidth = COLS * (CELL_SIZE + CELL_GAP);
  const boardHeight = ROWS * (CELL_SIZE + CELL_GAP);
  const offsetX = (window.innerWidth - boardWidth) / 2;   // ← 致命错误
  const offsetY = (window.innerHeight - boardHeight) / 2 + 60;
  return { x: offsetX + ..., y: offsetY + ... };
}, []);
```

当浏览器窗口 ≠ 视口（浏览器有工具栏、地址栏），`window.innerWidth` 小于视觉宽度，导致：
- 物品点击时找错格子
- 拖拽释放后物品跳到错误位置
- 物品根本拖不动

**修复方案：** 统一使用 `canvas.getBoundingClientRect()` 计算所有坐标。

---

#### 问题 2：Drag 坐标叠加错误

**根因：** `handleMouseMove` 中已经用 `getCellFromPos` 计算了目标格，但在 drag 时物品位置是用鼠标 raw 坐标更新的，不是网格对齐的。

```typescript
// ❌ 错误代码
dragRef.current.item.col = col;   // ← 拖拽中直接赋值，鼠标漂移就乱跳
dragRef.current.item.row = row;
```

拖拽中修改 `col/row` 导致物品在网格间跳跃，而不是平滑跟随鼠标。

**修复方案：** 拖拽中只记录鼠标偏移量，释放时才做网格对齐。

---

#### 问题 3：Canvas Resize 问题

**根因：** `canvas.width = window.innerWidth` 只在初始化时设置一次，窗口 resize 后 canvas 尺寸不变，但 `getCellCenter` 仍然用新的 `window.innerWidth` 计算，导致棋盘错位。

**修复方案：** 使用 `ResizeObserver` 监听 canvas 容器尺寸变化，重新计算棋盘位置。

---

### 🟡 P1 — 游戏能跑但体验差（严重问题）

#### 问题 4：useEffect 无限循环重绘

```typescript
useEffect(() => {
  draw();   // ← 每次 state 变化都触发，效率极低
});
```

应该只在物品数据变化时重绘，而不是每次渲染都重绘。

---

#### 问题 5：Canvas 不响应式

Canvas 没有设置 `position: absolute; top: 0; left: 0`，可能被其他 DOM 元素遮挡或覆盖。

---

#### 问题 6：缺少触摸支持

只有 `mousedown/mousemove/mouseup`，没有 `touchstart/touchmove/touchend`，手机无法玩。

---

#### 问题 7：物品重叠处理缺失

当两个物品拖到一起时，没有视觉反馈（高亮、缩放等）提示玩家可以合并。

---

## 二、重构方案（网页游戏专家推荐）

### 方案选择：渐进式重构（推荐）

**不推荐纯 Vanilla JS 方案：** 纯 HTML+JS 虽然零依赖，但丢失了 React 的组件化和状态管理优势，项目复杂度上去后难以维护。

**推荐方案：React + DOM Grid + 修复拖拽**

保留 React 架构，用 DOM Grid 替代 Canvas 渲染，修复拖拽逻辑。

| 指标 | 原方案 (Canvas) | 新方案 (DOM Grid) |
|------|----------------|------------------|
| 渲染性能 | ⚠️ 需手动优化 | ✅ CSS 合成 |
| 拖拽实现 | ⚠️ 坐标计算复杂 | ✅ Pointer Events API |
| 触摸支持 | ⚠️ 需额外处理 | ✅ Pointer Events 原生支持 |
| 代码量 | ~400行 | ~250行 |
| 调试难度 | 高（Canvas黑盒） | 低（DOM可inspect） |
| 首屏体积 | 165KB | ~120KB |

---

## 三、详细重构步骤

### 步骤 1：重写 MergeBoard — 使用 DOM Grid + Pointer Events

```
核心改动：
- <canvas> → <div class="board">
- 每格 = <div class="cell" data-col="x" data-row="y">
- 物品 = <div class="item item-level-X item-type-Y">
- 拖拽 = Pointer Events API (PointerCapture)
```

**新建文件：** `src/ui/components/MergeBoardDOM.tsx`

#### 核心代码架构

```tsx
// ==========================================
// 合并格子系统 — 真正的网格对齐
// ==========================================

interface BoardState {
  grid: (Item | null)[][];  // 6x6 二维数组
  selected: { col: number; row: number } | null;
  dragged: { col: number; row: number } | null;
}

// ==========================================
// Pointer Events 拖拽 — 解决坐标错位
// ==========================================

function MergeBoardDOM() {
  const [grid, setGrid] = useState<(Item | null)[][]>(createEmptyGrid());
  const [dragState, setDragState] = useState<DragState>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // ✅ 修复1：用 getBoundingClientRect 计算棋盘位置
  const getBoardRect = () => boardRef.current!.getBoundingClientRect();

  // ✅ 修复2：鼠标位置 → 格子坐标（精确计算）
  const clientToGrid = (clientX: number, clientY: number) => {
    const rect = getBoardRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const col = Math.floor(relX / CELL_TOTAL);
    const row = Math.floor(relY / CELL_TOTAL);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) return { col, row };
    return null;
  };

  // ✅ 修复3：Pointer Events 同时支持鼠标+触摸
  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = clientToGrid(e.clientX, e.clientY);
    if (pos && grid[pos.row][pos.col]) {
      setDragState({ startPos: pos, currentPos: pos });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const pos = clientToGrid(e.clientX, e.clientY);
    if (pos) setDragState(prev => ({ ...prev!, currentPos: pos }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;
    const target = dragState.currentPos;
    const source = dragState.startPos;
    if (target && canMerge(grid[source.row][source.col], grid[target.row][target.col])) {
      // 执行合并
      performMerge(source, target);
    } else if (target && !grid[target.row][target.col]) {
      // 移动到空格
      moveItem(source, target);
    }
    setDragState(null);
  };

  return (
    <div ref={boardRef} className="board">
      {grid.map((row, rowIdx) =>
        row.map((item, colIdx) => (
          <div
            key={`${colIdx}-${rowIdx}`}
            className={`cell ${dragState?.currentPos.col === colIdx && dragState?.currentPos.row === rowIdx ? 'cell-highlight' : ''}`}
            data-col={colIdx}
            data-row={rowIdx}
          >
            {item && (
              <ItemComponent
                item={item}
                isDragging={dragState?.startPos.col === colIdx && dragState?.startPos.row === rowIdx}
                style={dragState?.startPos.col === colIdx && dragState?.startPos.row === rowIdx
                  ? getFloatingStyle(dragState.currentPos)
                  : undefined}
                onPointerDown={handlePointerDown}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

#### CSS Grid 棋盘样式

```css
.board {
  display: grid;
  grid-template-columns: repeat(6, 80px);
  grid-template-rows: repeat(6, 80px);
  gap: 4px;
  padding: 15px;
  background: var(--color-wood);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  /* ✅ 修复6：确保棋盘在视口中央 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.cell {
  background: var(--color-board-cell);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
  /* ✅ 修复7：合并提示高亮 */
}

.cell-highlight {
  background: rgba(201, 168, 76, 0.3);
  box-shadow: 0 0 8px var(--color-gold);
}

.item {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  cursor: grab;
  user-select: none;
  touch-action: none; /* ✅ 修复6：触摸不缩放页面 */
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.item:active, .item.is-dragging {
  cursor: grabbing;
  transform: scale(1.15);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  z-index: 100;
}
```

---

### 步骤 2：修复 Zustand Store 的合并逻辑

当前 store 的 `mergeItems` 逻辑有问题，需要完善：

```typescript
// ✅ 修复：正确的合并逻辑
mergeItems: (sourceId: string, targetId: string) => {
  const source = state.board.find(i => i?.id === sourceId);
  const target = state.board.find(i => i?.id === targetId);
  if (!source || !target) return;

  // 检查是否可以合并
  if (!canMerge(source, target)) return;

  const newLevel = (source.level + 1) as ItemLevel;
  const reward = newLevel === 2 ? 50 : 150;

  // 执行合并：移除两个，旧位置放新的
  const newBoard = state.board.map(item => {
    if (item?.id === sourceId) return null;
    if (item?.id === targetId) return null;
    return item;
  });

  // 找目标位置放新物品
  const targetIdx = state.board.findIndex(i => i?.id === targetId);
  newBoard[targetIdx] = createItem(source.type, newLevel);

  set({
    board: newBoard,
    coins: state.coins + reward,
  });
},
```

---

### 步骤 3：修复 Items 数据结构

当前 `items.ts` 缺少 `canMerge` 函数的实现：

```typescript
// ✅ 添加合并判断函数
export function canMerge(a: Item | null, b: Item | null): boolean {
  if (!a || !b) return false;
  return a.type === b.type && a.level === b.level && a.level < 3;
}

// ✅ 添加创建物品函数
export function createItem(type: ItemType, level: ItemLevel): Item {
  return { id: `item_${Date.now()}_${Math.random()}`, type, level };
}

// ✅ 添加随机 L1 物品
export function createRandomL1Item(): Item {
  const types: ItemType[] = ['key', 'photo', 'crystal', 'box', 'badge', 'document'];
  const type = types[Math.floor(Math.random() * types.length)];
  return createItem(type, 1);
}
```

---

### 步骤 4：添加 ResizeObserver 响应式适配

```typescript
// ✅ 修复3：窗口 resize 时重新计算
useEffect(() => {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      setBoardSize({ width, height });
    }
  });

  if (boardRef.current) {
    observer.observe(boardRef.current);
  }

  return () => observer.disconnect();
}, []);
```

---

### 步骤 5：添加物品生成定时器

```typescript
// ✅ 添加物品自动生成
useEffect(() => {
  const interval = setInterval(() => {
    setGrid(prev => {
      const empty = findEmptyCell(prev);
      if (!empty) return prev; // 棋盘满了
      const newGrid = prev.map(row => [...row]);
      newGrid[empty.row][empty.col] = createRandomL1Item();
      return newGrid;
    });
  }, 3000);

  return () => clearInterval(interval);
}, []);
```

---

## 四、性能优化方案（网页游戏专家级）

### 优化 1：CSS Containment 隔离重绘

```css
.board { contain: layout style paint; }
.cell { contain: layout style; }
```

防止一个格子变化导致整个棋盘重绘。

### 优化 2：will-change 提示浏览器

```css
.item.is-dragging {
  will-change: transform;
  transform: scale(1.15);
}
```

### 优化 3：requestAnimationFrame 节流

拖拽中的重绘用 `requestAnimationFrame` 节流，不要每帧都 setState：

```typescript
const handlePointerMove = (e: React.PointerEvent) => {
  if (!dragState || !rafIdRef.current) return;
  rafIdRef.current = requestAnimationFrame(() => {
    // 只在 RAF 回调中更新
    updateDragPosition(e);
  });
};
```

### 优化 4：React.memo 避免多余渲染

```typescript
const ItemComponent = React.memo(({ item, isDragging }) => {
  const config = getItemConfig(item);
  return (
    <div className={`item item-${item.type} level-${item.level} ${isDragging ? 'is-dragging' : ''}`}>
      {config.emoji}
    </div>
  );
});
```

---

## 五、完整文件结构（重构后）

```
src/
├── ui/
│   ├── components/
│   │   ├── MergeBoard.tsx      # 【重写】DOM Grid + Pointer Events
│   │   ├── MergeBoardOld.tsx    # 备份旧版（参考用）
│   │   ├── TopBar.tsx
│   │   ├── OrdersPanel.tsx
│   │   ├── StoryPanel.tsx
│   │   └── CutsceneModal.tsx
│   └── styles/
│       ├── board.css           # 【新建】棋盘样式
│       └── animations.css      # 【新建】合并动画
├── data/
│   ├── items.ts                # 【修复】canMerge 等函数
│   ├── orders.ts
│   └── chapters.ts
├── stores/
│   └── gameStore.ts            # 【修复】mergeItems 逻辑
├── services/
│   └── saveService.ts
├── hooks/
│   ├── useGameLoop.ts          # 【新建】游戏主循环 hook
│   ├── useDragDrop.ts          # 【新建】拖拽逻辑 hook
│   └── useResizeObserver.ts    # 【新建】响应式 hook
└── App.tsx

docs/
├── REFACTORING-PLAN.md         # 本文档
├── GAMEPLAY-GUIDE.md
└── ARCHITECTURE.md             # 【新建】架构说明
```

---

## 六、合并动画规格（专家级）

参考 Gossip Harbor 的视觉反馈：

```css
/* ✅ 物品移动动画 */
@keyframes item-swap {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ✅ 合并爆炸动画 */
@keyframes merge-explode {
  0%   { transform: scale(0.5); opacity: 0; }
  30%  { transform: scale(1.3); opacity: 1; }
  60%  { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* ✅ 金币飞出动画 */
@keyframes coin-fly {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
}
```

---

## 七、实施计划

| 阶段 | 任务 | 优先级 | 工作量 |
|------|------|--------|--------|
| **Phase 0** | 修复 items.ts（添加 canMerge/createItem） | P0 | 10min |
| **Phase 0** | 修复 gameStore.ts（mergeItems 逻辑） | P0 | 15min |
| **Phase 1** | 重写 MergeBoard DOM 版本 | P0 | 2h |
| **Phase 1** | 添加 CSS 棋盘样式 + 动画 | P0 | 1h |
| **Phase 2** | 添加 Pointer Events 触摸支持 | P1 | 30min |
| **Phase 2** | 添加合并视觉反馈 | P1 | 30min |
| **Phase 3** | ResizeObserver 响应式适配 | P2 | 15min |
| **Phase 4** | 性能优化（React.memo + RAF） | P2 | 30min |
| **Phase 5** | 测试 + 部署 | P1 | 30min |

**预计总工时：5.5 小时**

---

## 八、验收标准（重构完成判定）

| 验收项 | 测试方法 |
|--------|----------|
| ✅ 物品拖拽流畅，无跳跃 | 用鼠标拖物品移动 10 格，观察是否平滑 |
| ✅ 相同物品合并后变高级 | 拖动两个 L1 到一起，看是否变成 L2 |
| ✅ 合并后金币增加 | 观察 TopBar 金币数字是否增加（+50 或 +150） |
| ✅ 棋盘自动生成新物品 | 等待 3 秒，看空白格子是否出现新物品 |
| ✅ 手机触摸可玩 | Chrome DevTools mobile mode 测试 |
| ✅ 窗口 resize 后棋盘居中 | 拖动窗口边缘，观察棋盘是否保持居中 |
| ✅ 60fps 无卡顿 | Chrome Performance Monitor 验证 |

---

*本方案由网页游戏专家审计制定 v2.0*
