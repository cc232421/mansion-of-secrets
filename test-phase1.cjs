const { chromium } = require('playwright');

(async () => {
  console.log('========================================');
  console.log('Phase 1 E2E: Store Integration Test');
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
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 1. Check board and items
    const board = await page.$('.merge-board');
    const items = await page.$$('.merge-item:not(.floating)');
    console.log(`[1] Board: ${board ? 'OK' : 'MISSING'}, Items: ${items.length}`);

    // 2. Check orders panel
    const orderCards = await page.$$('.order-card');
    console.log(`[2] Order cards: ${orderCards.length}`);

    // 3. Check energy display
    const topbar = await page.$('.top-bar, [style*="position: fixed"][style*="top: 0"]');
    console.log(`[3] TopBar: ${topbar ? 'OK' : 'MISSING'}`);

    // 4. Do 10 merges
    for (let i = 0; i < 10; i++) {
      const itemsNow = await page.$$('.merge-item:not(.floating)');
      if (itemsNow.length < 2) { await page.waitForTimeout(500); continue; }

      const itemData = [];
      for (const item of itemsNow) {
        const box = await item.boundingBox();
        const emoji = await item.$('.item-emoji');
        const emojiText = emoji ? await emoji.textContent() : '';
        itemData.push({ item, box, emoji: emojiText });
      }

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
        await page.mouse.move(a.box.x + a.box.width/2, a.box.y + a.box.height/2);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.move(b.box.x + b.box.width/2, b.box.y + b.box.height/2, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(200);
      }
    }

    // 5. Check no black screen
    const boardAfter = await page.$('.merge-board');
    const boardVisible = boardAfter ? await boardAfter.isVisible() : false;
    console.log(`[4] Board after 10 merges: ${boardVisible ? 'OK' : 'BLACK SCREEN!'}`);

    // 6. Check no console errors
    console.log(`[5] Console errors: ${errors.length}`);
    if (errors.length > 0) errors.slice(0,3).forEach(e => console.log('  ' + e.substring(0,100)));

    // 7. Check energy button visible
    const buyBtn = await page.$('button');
    const buyBtnText = buyBtn ? await buyBtn.textContent() : '';
    console.log(`[6] Buy button: ${buyBtnText.includes('Buy') || buyBtnText.includes('Energy') ? 'OK' : 'NOT FOUND'}`);

    console.log('\n========================================');
    console.log('RESULT: ' + (boardVisible && errors.length === 0 ? 'PASS' : 'FAIL'));
    console.log('========================================');

    await browser.close();
    process.exit(boardVisible && errors.length === 0 ? 0 : 1);

  } catch (e) {
    console.log('FAILED: ' + e.message.substring(0,200));
    if (browser) await browser.close();
    process.exit(1);
  }
})();
