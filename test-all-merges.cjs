const { chromium } = require('playwright');

(async () => {
  console.log('E2E: L3→L4 merge test\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/tmp/helium.AppImage',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--headless=new']
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Test all level merges: L1+L1, L2+L2, L3+L3
    for (let round = 0; round < 30; round++) {
      const items = await page.$$('.merge-item:not(.floating)');
      if (items.length < 2) { await page.waitForTimeout(500); continue; }

      const itemData = [];
      for (const item of items) {
        const box = await item.boundingBox();
        const emoji = await item.$('.item-emoji');
        const emojiText = emoji ? await emoji.textContent() : '';
        itemData.push({ item, box, emoji: emojiText });
      }

      // Find same-type pair
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

      if (pair) {
        const [a, b] = pair;
        console.log(`  Round ${round+1}: ${a.emoji}+${b.emoji}`);
        await page.mouse.move(a.box.x + a.box.width / 2, a.box.y + a.box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.move(b.box.x + b.box.width / 2, b.box.y + b.box.height / 2, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(300);
      }

      // Check board visible
      const board = await page.$('.merge-board');
      if (!board || !(await board.isVisible())) {
        console.log(`\nBLACK SCREEN at round ${round+1}!`);
        await browser.close();
        process.exit(1);
      }

      if (errors.some(e => e.includes('emoji'))) {
        console.log(`\nEMOJI ERROR at round ${round+1}!`);
        await browser.close();
        process.exit(1);
      }
    }

    console.log('\nAll merges OK. Errors: ' + errors.length);
    await browser.close();
    process.exit(0);

  } catch (e) {
    console.log('FAILED: ' + e.message.substring(0, 200));
    if (browser) await browser.close();
    process.exit(1);
  }
})();
