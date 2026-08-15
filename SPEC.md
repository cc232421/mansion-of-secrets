# Mansion of Secrets — 产品规格文档 (SPEC.md)

> **版本：** v1.0 — MVP for Demo  
**日期：** 2026-08-15  
**状态：** 开发中  

---

## 1. 产品一句话定位

> 打开浏览器即可玩的美国家庭狗血豪宅修复 Merge 游戏。轻玩法（鼠标拖拽合成）+ 强叙事（出轨、背叛、遗产悬疑），专为美国 35-55 岁女性设计。

**成功对标：** Gossip Harbor（日入 50 万美元级）+ Merge Mansion（故事 + 修复标杆）

---

## 2. MVP 范围（首个可演示版本）

**目的：** 3-4 周内交付可玩的垂直切片，验证核心循环 + 前 3 天剧情。

### 包含内容（MVP）
- [x] 6x6 Merge 棋盘（拖拽合成，2合1）
- [x] 3 种物品等级（L1-L3）
- [x] 订单系统（每日 4 个订单）
- [x] 金币经济
- [x] 能量系统（上限 120）
- [x] 首 3 天剧情（The Betrayal 第一幕）
- [x] 家族秘密面板（基础版）
- [x] 本地存档（IndexedDB）
- [x] 桌面横屏优先 UI

### 排除内容（后续迭代）
- [ ] 房间装修系统
- [ ] 云存档 / Firebase
- [ ] 广告变现
- [ ] IAP / Stripe
- [ ] 订阅系统
- [ ] 后续 27 天剧情
- [ ] 多人 / 排行榜
- [ ] 移动端适配

---

## 3. 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 游戏引擎 | **Phaser 3.80+** | 成熟 2D 游戏引擎，社区资源丰富 |
| UI 框架 | **React 18 + TypeScript** | 棋盘外 UI（订单、剧情弹窗、商店） |
| 构建工具 | **Vite 5** | 快速 HMR，开发体验好 |
| 样式 | **Tailwind CSS 3** | 快速响应式，桌面横屏优先 |
| 游戏状态 | **Phaser FSM** | 状态机管理游戏阶段 |
| 存档 | **IndexedDB（idb-keyval）** | 本地存档，无需后端 |
| 动画 | **Phaser Tween** | 物品合成动画、特效 |
| 音效 | **Howler.js** | 轻量音频，支持 Web Audio |
| 部署 | **Netlify** | 静态托管，CI/CD 自动部署 |

**不使用：** Electron（首版纯 Web），Firebase（云存档后续加入）

---

## 4. 视觉规格

### 4.1 美术风格

| 项目 | 规格 |
|------|------|
| **整体风格** | 温暖家庭剧色调，手绘质感 UI，边框装饰感强 |
| **色彩方案** | 主色：Deep Burgundy `#8B2942`；辅色：Antique Gold `#C9A84C`；背景：`#FFF8F0`（暖白）；文字：`#2D1B14` |
| **字体** | 标题：`Playfair Display`（Google Fonts）；正文：`Lora`（Google Fonts）；UI数字：`Libre Baskerville` |
| **棋盘底色** | 深色木纹 `#3D2914`，格子底 `#F5E6D3` |
| **物品风格** | 扁平 + 轻阴影，图标清晰辨识，圆角 8px |

### 4.2 UI 布局（1920x1080 横屏基准）

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]   ⚡ 120/120   🪙 500   [设置] [账号]         ← 顶部栏  │
├────────────┬───────────────────────────────────────┬─────────────┤
│            │                                       │             │
│  家族秘密   │         主棋盘 (Merge 6x6)            │  订单面板   │
│  面板      │                                       │  + 任务      │
│  (可折叠)  │         拖拽合成区域                   │  快捷提示   │
│            │                                       │             │
│  家族树     │                                       │  [订单1]   │
│  时间线     │                                       │  [订单2]   │
│  证据缩略图 │                                       │  [订单3]   │
│            │                                       │  [订单4]   │
├────────────┴───────────────────────────────────────┴─────────────┤
│  ████████████░░░░░░░░░ 剧情进度 68%          [继续故事 ▶]     │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 物品设计（L1-L3）

| 等级 | 物品 | 图标 | 颜色 |
|------|------|------|------|
| L1 | 旧钥匙 | 🔑 钥匙 | 铜色 |
| L1 | 破损照片 | 🖼️ 相框 | 褐色 |
| L1 | 碎玻璃 | 🔮 玻璃 | 透明蓝 |
| L2 | 金钥匙 | 🔑✨ 闪金 | 金色 |
| L2 | 修复照片 | 🖼️✨ | 金框 |
| L2 | 水晶球 | 🔮✨ | 蓝光 |
| L3 | 传家宝盒 | 💎 珠宝盒 | 红宝石色 |
| L3 | 家族徽章 | 🏅 徽章 | 金黑 |
| L3 | 秘密文件 | 📜 羊皮纸 | 旧金色 |

---

## 5. 游戏系统规格

### 5.1 Merge 棋盘

```javascript
// 棋盘配置
BOARD_CONFIG = {
  cols: 6,
  rows: 6,
  cellSize: 80,      // px
  cellGap: 4,        // px
  spawnDelay: 3000,  // ms — 每 3 秒从底部生成新物品
  maxItems: 36,       // 6x6
}
```

**操作规则：**
- 鼠标拖拽物品到另一物品 → 相同等级 → 合成升一级
- 鼠标拖拽物品到空格 → 移动
- 右键点击物品 → 快速移至最近空格
- 棋盘满时无法生成新物品（提示清理）

**合成规则：**
- L1 + L1 → L2（50 金币奖励）
- L2 + L2 → L3（150 金币奖励）
- L3 为顶级，不可继续合成

### 5.2 能量系统

```javascript
ENERGY_CONFIG = {
  max: 120,
  regenRate: 1,           // 点
  regenTime: 2.5 * 60,    // 秒（2.5 分钟恢复 1 点）
  maxRecovery: 5 * 60 * 60, // 秒（满恢复约 5 小时）
  adReward: 30,           // 看广告 +30（未来）
  dailyAdLimit: 8,
}
```

### 5.3 订单系统

```javascript
ORDER_CONFIG = {
  dailyCount: 4,          // 每日刷新
  refreshTime: '00:00 UTC',
  examples: [
    { require: 'L1x3', reward: 50, energy: 5 },
    { require: 'L2x2', reward: 120, energy: 10 },
    { require: 'L3x1', reward: 300, energy: 20 },
    { require: 'L1x5+L2x2', reward: 250, energy: 30 },
  ],
}
```

**执行流程：** 拖拽物品到订单栏 → 自动检测是否满足需求 → 满足则弹出完成动画 → 金币 + 剧情进度 +

### 5.4 金币经济

| 来源 | 数量 |
|------|------|
| 初始 | 500 |
| 合成 L1→L2 | +50 |
| 合成 L2→L3 | +150 |
| 完成订单 | +50 ~ +300 |
| 每日登录 | +100 |

### 5.5 存档数据模型

```typescript
interface GameSave {
  version: string;           // '1.0.0'
  lastSaved: string;         // ISO timestamp
  // 经济
  coins: number;
  energy: number;
  energyLastUpdate: number;  // timestamp for energy regen calc
  // 棋盘
  board: (Item | null)[];    // 36 slots, row-major
  // 订单
  orders: Order[];
  orderRefreshAt: string;    // UTC date
  // 剧情
  storyProgress: number;     // 0-100
  currentChapter: number;    // 1-5
  seenCutscenes: string[];   // cutscene IDs
  // 证据收集
  evidence: Evidence[];
  // 家族树
  familyTree: FamilyMember[];
}

interface Item {
  id: string;
  level: 1 | 2 | 3;
  type: 'key' | 'photo' | 'crystal' | 'box' | 'badge' | 'document';
}

interface Order {
  id: string;
  requirements: { level: number; count: number }[];
  reward: number;
  energyCost: number;
  completed: boolean;
}

interface Evidence {
  id: string;
  name: string;
  description: string;
  chapter: number;
  imageUrl: string;
  collected: boolean;
}
```

---

## 6. 剧情系统规格

### 6.1 第一章：The Betrayal（第 1-3 天）

**故事摘要：** Emily Harper 推门撞见丈夫 Brad 与妹妹 Claire 在主卧亲密，被赶出豪宅，发现父亲坠楼身亡，留下遗嘱疑点重重……

**第一幕分镜（首日内容）：**

| 序号 | 场景 | 角色 | 对话 | 触发条件 |
|------|------|------|------|---------|
| CS_01 | 豪宅大门 | Emily | "我回来了，亲爱的……" | 开局自动 |
| CS_02 | 主卧门口 | Emily | "Brad？这……这是什么？" | 推门触发 |
| CS_03 | 主卧 | Brad | "你听到了，Emily。离婚吧。" | 上一条后自动 |
| CS_04 | 客厅 | Claire | "姐姐，这是个意外……" | 上一条后自动 |
| CS_05 | 门外 | Emily | "我会拿回属于我的一切。" | 离开主卧触发 |
| CS_06 | 门廊 | Emily | "父亲！" | 发现父亲倒地 |
| CS_07 | 宅邸外 | 警探 | "Harper 先生坠楼，排除他杀。" | 第一章结局 |

**剧情弹窗规格：**
- 全屏半透明遮罩（`rgba(0,0,0,0.85)`）
- 左侧：角色立绘（300x500）
- 中央：对话框（大字体 24px Lora）
- 右侧：证据展示（如有）
- 底部：[跳过 ⏭] [自动播放 ▶] [继续 💬]
- 音效：角色专属 BGM 片段（3-5 秒循环）

---

## 7. 性能规格

| 指标 | 目标 |
|------|------|
| 首屏加载 | < 3 秒 |
| 帧率（桌面） | 60 fps |
| 帧率（移动） | 30 fps |
| 存档大小 | < 500 KB |
| 离线支持 | 基础玩法可用 |

---

## 8. 项目结构

```
mansion-of-secrets/
├── public/
│   ├── index.html
│   └── assets/
│       ├── images/       # 物品图标、角色立绘
│       ├── audio/        # BGM、音效
│       └── fonts/        # 本地字体（如需要）
├── src/
│   ├── main.tsx          # React 入口
│   ├── App.tsx           # 根组件
│   ├── game/
│   │   ├── Game.ts       # Phaser 游戏主类
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MergeBoardScene.ts   # 棋盘场景
│   │   │   └── CutsceneScene.ts     # 剧情场景
│   │   ├── objects/
│   │   │   ├── MergeItem.ts         # 可拖拽物品
│   │   │   └── MergeCell.ts         # 格子
│   │   ├── systems/
│   │   │   ├── MergeSystem.ts       # 合成逻辑
│   │   │   ├── BoardGenerator.ts    # 棋盘生成
│   │   │   └── DragManager.ts       # 拖拽管理
│   │   └── config/
│   │       └── boardConfig.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── TopBar.tsx           # 顶栏（能量/金币）
│   │   │   ├── SidePanel.tsx        # 家族秘密面板
│   │   │   ├── OrderPanel.tsx       # 订单面板
│   │   │   ├── CutsceneOverlay.tsx   # 剧情弹窗
│   │   │   └── FamilyTree.tsx       # 家族树
│   │   └── hooks/
│   │       └── useGameSave.ts
│   ├── data/
│   │   ├── chapters.ts              # 剧情数据
│   │   ├── items.ts                 # 物品定义
│   │   └── orders.ts                 # 订单配置
│   ├── stores/
│   │   └── gameStore.ts             # Zustand 状态管理
│   ├── services/
│   │   └── saveService.ts           # IndexedDB 存档
│   └── styles/
│       └── globals.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── SPEC.md
```

---

## 9. 依赖清单

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "phaser": "^3.80.0",
    "zustand": "^4.5.0",
    "idb-keyval": "^6.2.0",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 10. 开发里程碑

### Week 1：核心框架 + 棋盘
- [ ] Vite + React + Phaser 项目搭建
- [ ] 6x6 棋盘渲染
- [ ] 物品拖拽与合成逻辑
- [ ] L1-L3 物品系统
- [ ] 合成动画

### Week 2：经济 + 存档
- [ ] 能量系统（消耗/恢复）
- [ ] 订单系统
- [ ] 金币经济
- [ ] IndexedDB 本地存档

### Week 3：剧情系统
- [ ] 剧情弹窗 UI
- [ ] 第一章第一幕（7 个 Cutscene）
- [ ] 家族秘密面板
- [ ] 证据收集

### Week 4：整合 + 部署
- [ ] UI 与 Phaser 集成
- [ ] 首 3 天完整可玩
- [ ] Netlify 部署
- [ ] SEO 落地页

---

## 11. SEO 关键词（美国英语）

**主关键词：**
- mansion merge game
- family secrets merge
- drama merge puzzle browser
- house restoration merge story

**长尾词：**
- play mansion of secrets online free
- emily harper mansion game
- soap opera merge puzzle no download
- free online merge story for women

---

## 12. 风险与应对

| 风险 | 应对 |
|------|------|
| 剧情尺度审查 | 保持"暗示+对话"美式肥皂剧尺度，不露骨 |
| 性能（移动端） | Phaser 渲染优化，30fps 目标 |
| 资源加载慢 | Vite code splitting，懒加载非首屏资源 |
| 仿 Gossip Harbor 争议 | 强调"纯 Web 即时玩 + 更狠美国家庭狗血"，差异化 |

---

*本文档为开发参考，所有数值可在原型阶段微调。*
