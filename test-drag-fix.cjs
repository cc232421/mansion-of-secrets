const { chromium } = require('playwright');

(async () => {
  console.log('========================================');
  console.log('E2E Test: Drag & Merge Fix Verification');
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

    // Load
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const checkState = async (label) => {
      const board = await page.$('.merge-board');
      const items = await page.$$('.merge-item:not(.floating)');
      const bg = await page.evaluate(() => {
        const root = document.querySelector('#root > div');
        return root ? window.getComputedStyle(root).backgroundColor : 'unknown';
      });
      const boardVisible = board ? await board.isVisible() : false;
      console.log(`[${label}] board=${boardVisible} items=${items.length} bg=${bg}`);
      return { boardVisible, items, bg };
    };

    let state = await checkState('Initial');
    if (!state.boardVisible || state.items.length === 0) {
      console.log('FAIL: Initial state broken');
      await browser.close();
      process.exit(1);
    }

    // Do 5 consecutive drags
    for (let i = 0; i < 5; i++) {
      const items = await page.$$('.merge-item:not(.floating)');
      if (items.length === 0) { console.log(`FAIL: No items at drag ${i+1}`); break; }

      const item = items[0];
      const itemBox = await item.boundingBox();
      const ix = itemBox.x + itemBox.width / 2;
      const iy = itemBox.y + itemBox.height / 2;

      // Find empty cell
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

      if (!emptyCell) { console.log(`  Drag ${i+1}: no empty cell`); break; }

      // Perform drag
      await page.mouse.move(ix, iy);
      await page.mouse.down();
      await page.waitForTimeout(50);

      // Check floating item appeared
      const floating = await page.$('.merge-item.floating');
      if (!floating) { console.log(`  Drag ${i+1}: floating item NOT visible!`); }
      else { console.log(`  Drag ${i+1}: floating item visible OK`); }

      // Move to empty cell
      await page.mouse.move(emptyCell.x, emptyCell.y, { steps: 5 });
      await page.waitForTimeout(50);
      await page.mouse.up();
      await page.waitForTimeout(400);

      state = await checkState(`After drag ${i+1}`);
      if (!state.boardVisible) {
        console.log(`\n!!! BLACK SCREEN at drag ${i+1} !!!`);
        await page.screenshot({ path: `/tmp/black-drag-${i+1}.png` });
        await browser.close();
        process.exit(1);
      }
    }

    console.log('\n========================================');
    console.log('RESULT: All 5 drags completed, no black screen');
    console.log('Console errors: ' + errors.length);
    if (errors.length > 0) errors.forEach(e => console.log('  ' + e));
    console.log('========================================');

    await browser.close();
    process.exit(errors.length > 0 ? 1 : 0);

  } catch (e) {
    console.log('TEST FAILED: ' + e.message.substring(0, 300));
    if (browser) await browser.close();
    process.exit(1);
  }
})();
