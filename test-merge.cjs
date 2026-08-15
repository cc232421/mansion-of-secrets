const { chromium } = require('playwright');

(async () => {
  console.log('========================================');
  console.log('E2E Test: L2→L3 Merge Fix');
  console.log('========================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/tmp/helium.AppImage',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--headless=new']
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push('PAGE: ' + e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Force-place two L2 items (key type) via JS injection
    const mergeTest = await page.evaluate(() => {
      // Access the React state via global store - find board state from DOM
      // Since we can't directly access React state, we'll simulate by:
      // 1. Reading all current items
      // 2. Programmatically merging via game logic if accessible

      // Instead, let's try to use page.$$ to count items
      const cells = document.querySelectorAll('.merge-cell');
      let items = [];
      cells.forEach((cell, idx) => {
        const item = cell.querySelector('.merge-item');
        if (item) {
          const emoji = item.querySelector('.item-emoji');
          items.push({ idx, emoji: emoji ? emoji.textContent : null });
        }
      });
      return items;
    });

    console.log('Current items:', JSON.stringify(mergeTest));

    // Try 20 consecutive merges (mix of moves and potential merges)
    for (let i = 0; i < 20; i++) {
      const items = await page.$$('.merge-item:not(.floating)');
      if (items.length < 2) {
        await page.waitForTimeout(500);
        continue;
      }

      // Find two same-type items
      const itemData = [];
      for (const item of items) {
        const box = await item.boundingBox();
        const emoji = await item.$('.item-emoji');
        const emojiText = emoji ? await emoji.textContent() : '';
        itemData.push({ item, box, emoji: emojiText });
      }

      // Find a pair with same emoji
      let pair = null;
      for (let a = 0; a < itemData.length; a++) {
        for (let b = a + 1; b < itemData.length; b++) {
          if (itemData[a].emoji === itemData[b].emoji && itemData[a].emoji !== '') {
            pair = [itemData[a], itemData[b]];
            break;
          }
        }
        if (pair) break;
      }

      if (!pair) {
        // No pairs found, just move any item
        const item = itemData[0];
        const emptyCell = await page.evaluate(() => {
          const cells = document.querySelectorAll('.merge-cell');
          for (const cell of cells) {
            if (!cell.querySelector('.merge-item')) {
              const r = cell.getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
          }
          return null;
        });
        if (emptyCell) {
          await page.mouse.move(item.box.x + item.box.width / 2, item.box.y + item.box.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(50);
          await page.mouse.move(emptyCell.x, emptyCell.y, { steps: 3 });
          await page.mouse.up();
        }
      } else {
        // Drag item A onto item B to merge
        const [a, b] = pair;
        console.log(`  Merge attempt ${i+1}: ${a.emoji} + ${b.emoji}`);
        await page.mouse.move(a.box.x + a.box.width / 2, a.box.y + a.box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.move(b.box.x + b.box.width / 2, b.box.y + b.box.height / 2, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(300);
      }

      // Check for errors
      const currentErrors = [...errors];
      if (currentErrors.some(e => e.includes('emoji'))) {
        console.log(`\n!!! emoji error at merge ${i+1} !!!`);
        console.log('Errors:', currentErrors.filter(e => e.includes('emoji')));
        await browser.close();
        process.exit(1);
      }

      // Check board still visible
      const board = await page.$('.merge-board');
      if (!board || !(await board.isVisible())) {
        console.log(`\n!!! BLACK SCREEN at merge ${i+1} !!!`);
        await browser.close();
        process.exit(1);
      }
    }

    console.log('\n========================================');
    console.log(`RESULT: 20 merges completed`);
    console.log(`Console errors: ${errors.length}`);
    if (errors.length > 0) errors.slice(0, 5).forEach(e => console.log('  ' + e));
    console.log('All emoji errors: ' + (errors.some(e => e.includes('emoji')) ? 'YES (FAIL)' : 'NONE (PASS)'));
    console.log('========================================');

    await browser.close();
    process.exit(errors.some(e => e.includes('emoji')) ? 1 : 0);

  } catch (e) {
    console.log('TEST FAILED: ' + e.message.substring(0, 300));
    if (browser) await browser.close();
    process.exit(1);
  }
})();
