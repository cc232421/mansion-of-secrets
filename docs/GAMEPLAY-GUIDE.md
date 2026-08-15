# 🎮 Mansion of Secrets — Gameplay Guide

> **Version:** 1.0 | **Platform:** Web Browser (PWA) | **Last Updated:** August 2026

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Core Game Loop](#2-core-game-loop)
3. [Merge Board](#3-merge-board)
4. [Orders System](#4-orders-system)
5. [Energy System](#5-energy-system)
6. [Currency](#6-currency)
7. [Story & Cutscenes](#7-story--cutscenes)
8. [Room Renovation](#8-room-renovation)
9. [Family Secrets Panel](#9-family-secrets-panel)
10. [Saving & Progress](#10-saving--progress)
11. [Tips & Strategies](#11-tips--strategies)
12. [FAQ](#12-faq)

---

## 1. Quick Start

### How to Play

1. **Open the game** at [https://symphonious-stardust-c3dfd2.netlify.app](https://symphonious-stardust-c3dfd2.netlify.app)
2. **Watch the intro cutscene** — Emily returns home to find her husband Brad with her sister Claire...
3. **Start merging** — Drag items on the board to combine them
4. **Complete orders** — Fulfill orders to earn coins and unlock story chapters
5. **Continue the story** — Watch cutscenes to uncover the family mystery

### Controls

| Action | How to Do |
|--------|-----------|
| **Move item** | Click and drag item to another cell |
| **Merge items** | Drag item onto an identical item (same type + level) |
| **View orders** | Right panel shows current order requirements |
| **Continue story** | Click "Continue Story" button at bottom |
| **Switch views** | Click "Merge Board" or "Rooms" at bottom center |

---

## 2. Core Game Loop

```
┌─────────────────────────────────────────────────────┐
│                 MAIN GAME LOOP                       │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │  MERGE   │───▶│ COMPLETE │───▶│   UNLOCK    │  │
│  │  ITEMS   │    │  ORDERS  │    │ STORY/ROOMS │  │
│  └──────────┘    └──────────┘    └──────────────┘  │
│       ▲                                    │        │
│       └────────────────────────────────────┘        │
│              (Earn coins & progress)               │
└─────────────────────────────────────────────────────┘
```

### Daily Cycle

1. **Merge** items on the board to create higher-level items
2. **Collect** items from the board to fulfill orders
3. **Complete orders** to earn coins (+50 to +500 per order)
4. **Watch cutscenes** to advance the story and unlock rooms
5. **Renovate rooms** by spending coins on room upgrades

---

## 3. Merge Board

### Board Layout

- **Grid:** 6×6 (36 cells)
- **Item Spawning:** New L1 items appear every 3 seconds
- **Max items:** 36 (board full = no new spawns)

### Item Types & Levels

| Level | Key 🗝️ | Photo 🖼️ | Crystal 🔮 | Box 💎 | Badge 🏅 | Document 📜 |
|-------|--------|----------|-----------|--------|----------|------------|
| **L1** | Old Key | Broken Photo | Cracked Crystal | — | — | — |
| **L2** | Golden Key | Restored Photo | Crystal Ball | — | — | — |
| **L3** | Master Key | Family Portrait | Crystal Orb | Heirloom Chest | Family Crest | Secret Document |

### Merging Rules

```
Rule 1: Same Type + Same Level = Merge
  🗝️ L1 + 🗝️ L1 = 🔑 L2
  🔮 L2 + 🔮 L2 = 🔮 L3

Rule 2: Different Types CANNOT Merge
  🗝️ L1 + 🖼️ L1 = ❌ No merge

Rule 3: L3 Items Cannot Merge Further
  💎 L3 + 💎 L3 = ❌ Max level reached
```

### Merge Rewards

| Result | Coin Reward |
|--------|-------------|
| Merge to L2 | +50 coins |
| Merge to L3 | +150 coins |

### Board Tips

- **Keep space** — Don't let the board fill up completely
- **Plan ahead** — Look for matching pairs before moving items
- **Chain merges** — Place high-level items together for chain reactions
- **Drag to merge** — Drag any item onto an identical item to merge

---

## 4. Orders System

### How Orders Work

Orders require specific items to complete. Fulfill orders to earn coins and progress through the story.

### Order Examples

| Order | Requirements | Reward | Energy Cost |
|-------|-------------|--------|-------------|
| "Restore the family portrait" | 3× L1 Photo | 80 🪙 | 5 ⚡ |
| "Find the golden key" | 3× L1 Key | 80 🪙 | 5 ⚡ |
| "Assemble the heirloom box" | 2× L2 Key + 1× L1 Photo | 200 🪙 | 15 ⚡ |
| "Complete the family crest" | 2× L2 Badge | 250 🪙 | 20 ⚡ |
| "Unlock the mystery" | 1× L3 Box | 500 🪙 | 30 ⚡ |
| "Reveal the truth" | 1× L3 Document | 500 🪙 | 30 ⚡ |

### Completing an Order

1. Look at the **Orders Panel** (right side)
2. Check what items the order needs
3. **Merge items** on the board to create the required items
4. Items automatically count toward orders
5. When requirements are met, the order is **auto-completed**
6. Receive **coins + energy** reward

### Daily Refresh

- Orders refresh daily at midnight (local time)
- Complete as many orders as possible each day
- Prioritize **high-reward orders** for maximum coins

---

## 5. Energy System

### Energy Basics

| Parameter | Value |
|-----------|-------|
| **Max Energy** | 120 |
| **Recovery Rate** | 1 point every 2.5 minutes |
| **Full Recovery Time** | ~5 hours |
| **Watch Ad Reward** | +30 energy (8× daily) |

### Energy Costs

| Action | Energy Cost |
|--------|------------|
| Complete Order (small) | 5 ⚡ |
| Complete Order (medium) | 15-20 ⚡ |
| Complete Order (large) | 25-30 ⚡ |

### Recharging Energy

1. **Wait** — Energy regenerates automatically (1/2.5min)
2. **Watch Ad** — Earn +30 energy (button appears when low)
3. **In-App Purchase** — Buy energy packs in the shop

### Energy Management Tips

- Play in **20-45 minute sessions** to use energy efficiently
- **Start sessions** when energy is full
- Complete **small orders** first to conserve energy
- **Watch ads** when energy is low to continue playing

---

## 6. Currency

### Coins

Coins are the primary currency used to renovate rooms and unlock story content.

| Earning Method | Amount |
|---------------|--------|
| Merge to L2 | +50 🪙 |
| Merge to L3 | +150 🪙 |
| Complete small order | +50-100 🪙 |
| Complete medium order | +150-300 🪙 |
| Complete large order | +400-500 🪙 |
| Daily login bonus | +100 🪙 |

| Spending Method | Cost |
|----------------|------|
| Renovate room (Phase 1) | 800 🪙 |
| Renovate room (Phase 2) | 1,500 🪙 |
| Renovate room (Phase 3) | 2,500 🪙 |

---

## 7. Story & Cutscenes

### The Story So Far

**Emily Harper** returns home to find her husband **Brad** in bed with her own sister **Claire**. In the chaos, Emily's elderly father collapses and passes away under mysterious circumstances. Now Emily must uncover the truth about her family — and discover what really happened that night.

### Chapters

| Chapter | Title | Days | Key Events |
|---------|-------|------|------------|
| 1 | **The Betrayal** | 1-3 | Discovering the affair, father collapses, detective arrives |
| 2 | **The Will** | 4-7 | Father's will is changed, lawyer goes missing |
| 3 | **The Secret Child** | 8-14 | Brad's secret child revealed, Claire's true identity uncovered |
| 4 | **The Twin** | 15-21 | Emily discovers she's not a blood Harper, twin brother appears |
| 5 | **The Fall** | 22-28 | Father was pushed, not fallen — who did it? |
| 6 | **Friday Cliffhanger** | 29-30 | Major twist, preview of next month's story |

### How to Watch Cutscenes

1. Click **"Continue Story"** button at the bottom of the screen
2. Watch dialogue unfold with **typewriter effect**
3. Click anywhere or press **Next** to advance
4. Use **Auto Play** to watch without clicking
5. Use **Skip** to skip to the end

### Story Triggers

- Story advances when you **complete orders**
- Cutscenes trigger at **story progress milestones** (5%, 10%, 30%, 60%, 100%)
- Manual trigger available via **"Continue Story"** button

---

## 8. Room Renovation

### How Renovation Works

As you progress through the story, you unlock rooms to renovate. Each room has 3 renovation phases.

### Room List

| Chapter | Room | Phase 1 Cost | Phase 2 Cost | Phase 3 Cost |
|---------|------|-------------|-------------|-------------|
| 1 | Master Bedroom | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 1 | Living Room | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 2 | Library | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 3 | Kitchen | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 3 | Garden | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 4 | Basement | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 5 | Attic | 800 🪙 | 1,500 🪙 | 2,500 🪙 |
| 5 | Dock | 800 🪙 | 1,500 🪙 | 2,500 🪙 |

### Renovation Rewards

- **Story progress** — Each room phase advances the story
- **New cutscenes** — Renovating triggers exclusive story content
- **Visual satisfaction** — Watch the mansion transform

---

## 9. Family Secrets Panel

### Left Panel Features

The **Family Secrets Panel** (left side of screen) contains:

#### Characters

| Character | Role | Status |
|-----------|------|--------|
| Emily | Protagonist | Main character |
| Brad | Husband | Suspected |
| Claire | Sister | Deceived |
| Father | (Deceased) | Mystery |

#### Evidence Collection

As you progress, you collect **evidence fragments**. Evidence reveals:

- What really happened to Father
- Brad and Claire's true relationship
- The family's hidden secrets
- Future plot revelations

**Evidence Types:**
- 📄 Documents — Contracts, letters, wills
- 📷 Photos — Old photographs, evidence of affairs
- 🔑 Keys — Unlock rooms and secrets
- 💎 Heirlooms — Family treasures with hidden meaning

---

## 10. Saving & Progress

### Auto-Save

The game **automatically saves** every 30 seconds to:
- **IndexedDB** (browser storage)
- **Cloud sync** (future feature)

### Manual Save

Progress is saved automatically. No manual save required.

### Session Continuity

- Close the browser → **Progress saved**
- Reopen the browser → **Continue where you left off**
- Add to **desktop** (PWA) → **App-like experience**

---

## 11. Tips & Strategies

### Beginner Tips

1. **Prioritize merging** — Focus on creating L2 and L3 items
2. **Complete orders daily** — Don't let orders expire
3. **Manage energy** — Play in dedicated sessions for best experience
4. **Watch story cutscenes** — They unlock new content and rooms
5. **Add to home screen** — PWA mode works offline

### Advanced Strategies

#### Efficient Merging

```
Optimal merge pattern:
- Keep 4-5 of each L1 item type
- Group them in one area
- Merge all at once for fast L2 production
```

#### Order Prioritization

| Priority | Reason |
|----------|--------|
| High reward orders | More coins for renovations |
| Low energy cost orders | Conserve energy |
| Multiple small orders | Steady coin flow |

#### Energy Management

```
Session strategy:
1. Start with full 120 energy
2. Complete 4-6 medium orders (5-20 energy each)
3. Watch ads to recharge (+30)
4. Repeat until satisfied
```

### Common Mistakes to Avoid

❌ **Don't** fill the board completely — Always leave room to maneuver
❌ **Don't** ignore the story — New chapters unlock features
❌ **Don't** spend coins early — Save for important renovations
❌ **Don't** close without completing orders — Auto-save may miss progress

---

## 12. FAQ

### Q: Is this game free?
**A:** Yes! The game is completely free to play. Optional purchases available for energy packs and exclusive content.

### Q: Do I need to download anything?
**A:** No! Just open the website in any modern browser. You can optionally "Add to Home Screen" for an app-like experience.

### Q: Is my progress saved?
**A:** Yes! Progress auto-saves to browser storage every 30 seconds.

### Q: Can I play offline?
**A:** The basic game works offline after first load. PWA mode recommended for offline play.

### Q: What happens when energy runs out?
**A:** Energy regenerates over time (1 per 2.5 minutes). You can also watch an ad for +30 energy (8× daily).

### Q: How do I unlock new rooms?
**A:** Complete orders and watch story cutscenes. Rooms unlock at specific story progress milestones.

### Q: Can I change my game language?
**A:** Currently English only. Story content is designed for American soap opera drama style.

### Q: Is there a mobile version?
**A:** The game is responsive and works on mobile browsers. Add to home screen for the best mobile experience.

### Q: How do I report bugs?
**A:** Visit the GitHub repository or contact support through the game settings.

---

## Technical Information

| Item | Details |
|------|---------|
| **Engine** | React 18 + Canvas 2D |
| **Build** | Vite + TypeScript |
| **Styles** | Tailwind CSS |
| **State** | Zustand |
| **Storage** | IndexedDB |
| **Platform** | Netlify (CDN) |
| **Bundle Size** | ~165KB JS (53KB gzip) |
| **Target FPS** | 60fps desktop, 30fps mobile |

---

*© 2026 Mansion of Secrets. All rights reserved.*
*This game is a work of fiction. Any resemblance to actual events or persons is coincidental.*
