const { test, expect } = require('../e4/node_modules/@playwright/test');
const path = require('node:path');
const scenes = [
  { id:'inicio', file:'01-cover' },
  { id:'equipo', file:'02-team' },
  { id:'problema', file:'03-problem' },
  { id:'vision-objetivos', file:'04-vision-objectives' },
  { id:'alcance-limites', file:'05-scope-boundaries' },
  { id:'no-contempla', file:'06-not-in-scope' },
  { id:'contexto-proceso', file:'07-context-current-process' },
  { id:'tic', file:'08-tic' },
  { id:'competencia', file:'09-competition' },
  { id:'stakeholders', file:'10-stakeholders' },
  { id:'modelo-negocio', file:'11-business-model' },
  { id:'sintesis-elicitacion', file:'12-elicitation-result' },
  { id:'relevamiento-organizacional', file:'13-organizational-review' },
  { id:'as-is', file:'14-as-is' },
  { id:'diagnostico', file:'15-diagnosis' },
  { id:'propuesta', file:'16-solution' },
  { id:'reglas-solucion', file:'17-solution-rules' },
  { id:'requerimientos-funcionales', file:'18-functional-requirements' },
  { id:'requisitos-modelado', file:'19-non-functional-modeling' },
  { id:'implementacion-demo', file:'20-implementation-demo' },
  { id:'cierre', file:'21-closing' },
];
const timeText = /(?:\b\d+:\d{2}\b|Acumulado|Total estimado|Duraci[o\u00f3]n|cron[o\u00f3]metro)/i;

test.beforeEach(async ({ page }) => {
  const external = [];
  page.on('request', request => {
    if (!['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname)) external.push(request.url());
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['127.0.0.1', 'localhost'].includes(url.hostname) ? route.continue() : route.abort();
  });
  page.__externalRequests = external;
});
test.afterEach(async ({ page }) => { expect(page.__externalRequests).toEqual([]); });

test('twenty-one enabled scenes, academic blocks, stable links and no visible times', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/presentacion/mapa');
  const cards = page.locator('.p-map-card');
  await expect(cards).toHaveCount(21);
  const blocks = page.locator('.p-map-block');
  await expect(blocks).toHaveCount(7);
  for (const [index, count] of [2,4,6,3,4,1,1].entries()) {
    await expect(blocks.nth(index).locator('.p-map-card')).toHaveCount(count);
    await expect(blocks.nth(index).locator('.p-map-block-heading h2')).toContainText(String(index + 1).padStart(2,'0'));
  }
  for (const [index, scene] of scenes.entries()) {
    await expect(cards.nth(index).locator('.p-map-link')).toHaveAttribute('href', `/presentacion#${scene.id}`);
    await expect(cards.nth(index).locator('h3')).toContainText(String(index + 1).padStart(2,'0'));
    await expect(cards.nth(index)).toContainText(index < 6 || index >= 19 ? 'Hern\u00e1n' : index < 12 ? 'Nahuel' : index < 15 ? 'Diego' : 'Mat\u00edas');
    await expect(cards.nth(index)).toContainText(scene.id);
    await expect(cards.nth(index)).toContainText(index === 0 || index === 20 ? 'dark' : 'light');
  }
  await expect(page.locator('.p-map')).not.toContainText(timeText);
  await cards.nth(1).click(); await expect(page).toHaveURL(/#equipo$/);
  for (const [index, scene] of scenes.entries()) {
    await page.goto(`/presentacion?debug=1#${scene.id}`);
    await expect(page.locator('.p-slide')).toHaveAttribute('aria-labelledby', `${scene.id}-title`);
    await expect(page.locator('h1')).toHaveAttribute('id', `${scene.id}-title`);
    const debug = page.locator('.p-debug');
    await expect(debug).toContainText(`${index+1}/21`);
    await expect(debug).toContainText(scene.id);
    await expect(debug).toContainText(index < 6 || index >= 19 ? 'Hern\u00e1n' : index < 12 ? 'Nahuel' : index < 15 ? 'Diego' : 'Mat\u00edas');
    await expect(debug).toContainText(index === 0 || index === 20 ? 'dark' : 'light');
    await expect(page.locator('.p-shell')).not.toContainText(timeText);
    await page.reload(); await expect(page.locator('h1')).toHaveAttribute('id', `${scene.id}-title`);
  }
  await page.goto('/presentacion'); await expect(page).toHaveURL(/#inicio$/);
  for (const scene of scenes.slice(1)) {
    await page.getByRole('button', { name:'Siguiente', exact:true }).click();
    await expect(page).toHaveURL(new RegExp(`#${scene.id}$`));
    await expect(page.locator('.p-debug')).toHaveCount(0);
    await expect(page.locator('.p-shell')).not.toContainText(timeText);
  }
  await expect(page.getByRole('button', { name:'Siguiente', exact:true })).toBeDisabled();
});

test('keyboard, history, fullscreen fallback and public metadata', async ({ page }) => {
  await page.goto('/presentacion'); await expect(page).toHaveURL(/#inicio$/);
  await expect(page.getByRole('button', { name:'Presentar', exact:true })).toBeVisible();
  await expect(page.locator('.p-debug')).toHaveCount(0);
  await page.locator('h1').click();
  for (const [key, id] of [['ArrowRight','equipo'],[' ','problema'],['PageUp','equipo'],['PageDown','problema'],['Home','inicio'],['End','cierre'],['ArrowLeft','implementacion-demo']]) {
    await page.keyboard.press(key); await expect(page).toHaveURL(new RegExp(`#${id}$`));
  }
  await page.goBack(); await expect(page).toHaveURL(/#cierre$/);
  await page.goForward(); await expect(page).toHaveURL(/#implementacion-demo$/);
  await page.getByRole('button', { name:'Anterior', exact:true }).click(); await expect(page).toHaveURL(/#requisitos-modelado$/);
  await page.getByRole('button', { name:'Ocultar progreso' }).click(); await expect(page.locator('.p-progress')).toHaveCount(0);
  await page.evaluate(() => Object.defineProperty(document.querySelector('.p-shell'), 'requestFullscreen', { value:undefined, configurable:true }));
  await page.getByRole('button', { name:'Presentar', exact:true }).click(); await expect(page.getByRole('status')).toContainText('no disponible');
  await page.goto('/presentacion#desconocida'); await expect(page).toHaveURL(/#inicio$/);
  await page.goto('/presentacion#inicio');
  await page.evaluate(() => Object.defineProperty(document.querySelector('.p-shell'), 'requestFullscreen', { value:() => Promise.reject(new Error('Unavailable')), configurable:true }));
  await page.getByRole('button', { name:'Presentar', exact:true }).click(); await expect(page.getByRole('status')).toContainText('No se pudo');
});

for (const size of [{width:1920,height:1080},{width:1440,height:900},{width:1366,height:768},{width:390,height:844}]) {
  test(`twenty-one scenes fit ${size.width}×${size.height}${size.width === 1920 ? ' and generate previews' : ''}`, async ({ page }) => {
    await page.setViewportSize(size);
    for (const scene of scenes) {
      await page.goto(`/presentacion#${scene.id}`);
      await expect(page.locator('h1')).toHaveAttribute('id', `${scene.id}-title`);
      await page.evaluate(() => document.fonts.ready);
      const bounds = await page.locator('.p-slide').evaluate(el => ({scroll:el.scrollHeight,height:el.clientHeight,width:el.scrollWidth,client:el.clientWidth}));
      expect(bounds.scroll, scene.id).toBeLessThanOrEqual(bounds.height);
      expect(bounds.width, scene.id).toBeLessThanOrEqual(bounds.client);
      // Check visible text and cards, not only the clipped outer slide.
      const content = await page.locator('.p-slide').evaluate(el => Array.from(el.querySelectorAll('h1,h2,p,li,dt,dd,.p-elicit-eyebrow,.p-summary-result,.p-team-member,.p-block-ending,.p-cover-bottom,.p-domains')).map(e => {
        const r = e.getBoundingClientRect(); return {text:e.textContent, x:r.x,y:r.y,right:r.right,bottom:r.bottom};
      }).filter(r => r.right > r.x && r.bottom > r.y));
      for (const box of content) {
        expect(box.x, `${scene.id}: ${box.text}`).toBeGreaterThanOrEqual(0);
        expect(box.y, `${scene.id}: ${box.text}`).toBeGreaterThanOrEqual(0);
        expect(box.right, `${scene.id}: ${box.text}`).toBeLessThanOrEqual(size.width);
        expect(box.bottom, `${scene.id}: ${box.text}`).toBeLessThanOrEqual(size.height-60);
      }
      if (size.width === 1920) await page.screenshot({path:path.resolve(__dirname, `../../docs/presentation/previews/${scene.file}.png`),animations:'disabled'});
    }
  });
}

test('manual wheel gestures and elapsed metadata never advance automatically', async ({ page }) => {
  await page.goto('/presentacion#inicio');
  await expect(page.locator('h1')).toHaveAttribute('id', 'inicio-title');
  await page.clock.install();
  // Exceed the complete deck estimate without any presenter action.
  await page.clock.fastForward(10 * 60 * 1000);
  await expect(page).toHaveURL(/#inicio$/);
  await page.mouse.move(600, 400);
  await page.mouse.wheel(0, 120);
  await expect(page).toHaveURL(/#equipo$/);
  const wheel = deltaY => page.locator('.p-scene').dispatchEvent('wheel', { deltaY, bubbles:true, cancelable:true });
  for (let i = 0; i < 6; i++) await wheel(40);
  await expect(page).toHaveURL(/#equipo$/);
  // Inertia after 500 ms extends the lock; a sustained gesture stays one step.
  await page.clock.fastForward(500); await wheel(30);
  await page.clock.fastForward(500); await wheel(20);
  await expect(page).toHaveURL(/#equipo$/);
  await page.clock.fastForward(700); await wheel(120);
  await expect(page).toHaveURL(/#problema$/);
  await page.clock.fastForward(700); await wheel(-120);
  await expect(page).toHaveURL(/#equipo$/);
  await page.clock.fastForward(700);
  await page.locator('.p-scene').dispatchEvent('wheel', { deltaY:120,ctrlKey:true,bubbles:true,cancelable:true });
  await expect(page).toHaveURL(/#equipo$/);
  await page.getByRole('button', { name:'Siguiente',exact:true }).dispatchEvent('wheel', {deltaY:120,bubbles:true,cancelable:true});
  await expect(page).toHaveURL(/#equipo$/);
  // Small trackpad deltas accumulate until an intentional movement is detected.
  await wheel(8); await wheel(8); await expect(page).toHaveURL(/#equipo$/);
  await wheel(8); await expect(page).toHaveURL(/#problema$/);
  await page.clock.fastForward(10 * 60 * 1000);
  await expect(page).toHaveURL(/#problema$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.setViewportSize({width:800,height:600});
  await page.goto('/presentacion/mapa');
  await page.mouse.move(500, 400); await page.mouse.wheel(0, 600);
  await expect(page).toHaveURL(/\/presentacion\/mapa$/);
  await expect.poll(() => page.locator('.p-map').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
});

test.describe('touch navigation', () => {
  test.use({ hasTouch:true, viewport:{width:390,height:844} });
  test('horizontal and vertical swipes, taps and cancelled multi-touch', async ({ page }) => {
    await page.goto('/presentacion#equipo');
    await expect(page.locator('h1')).toHaveAttribute('id', 'equipo-title');
    const client = await page.context().newCDPSession(page);
    async function swipe(x1,y1,x2,y2) {
      await client.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:x1,y:y1}]});
      await client.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:x2,y:y2}]});
      await client.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    }
    await page.touchscreen.tap(180,300); await expect(page).toHaveURL(/#equipo$/);
    await swipe(300,400,100,400); await expect(page).toHaveURL(/#problema$/);
    await swipe(100,400,300,400); await expect(page).toHaveURL(/#equipo$/);
    await swipe(200,500,200,300); await expect(page).toHaveURL(/#problema$/);
    await swipe(200,300,200,500); await expect(page).toHaveURL(/#equipo$/);
    await swipe(200,400,210,410); await expect(page).toHaveURL(/#equipo$/);
    await client.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:100,y:400},{x:300,y:400}]});
    await client.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await expect(page).toHaveURL(/#equipo$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.getByRole('button', {name:'Siguiente',exact:true}).tap();
    await expect(page).toHaveURL(/#problema$/);
    await client.detach();
  });
});

test.describe('motion system', () => {
  test.use({ reducedMotion:'no-preference' });

  test('all scenes animate on entry and settle without changing content or hash', async ({ page }) => {
    test.setTimeout(60000);
    for (const scene of scenes) {
      await page.goto(`/presentacion#${scene.id}`);
      await expect(page.locator('h1')).toHaveAttribute('id', `${scene.id}-title`);
      const definitions = await page.locator('.p-scene').evaluate(el => {
        const heading = el.querySelector('h1');
        return { scene:getComputedStyle(el).animationName, heading:getComputedStyle(heading).animationName,
          animations:el.getAnimations({subtree:true}).length };
      });
      expect(definitions.scene).toBe('p-scene-arrive');
      expect(definitions.heading).toBe('p-content-rise');
      expect(definitions.animations).toBeGreaterThan(2);
      // Finish finite entrance animations to verify the final state of every node.
      await page.locator('.p-scene').evaluate(el => el.getAnimations({subtree:true}).forEach(animation => animation.finish()));
      await expect(page).toHaveURL(new RegExp(`#${scene.id}$`));
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    }
    await page.goto('/presentacion#vision-objetivos');
    await expect(page.locator('#vision-objetivos-title')).toBeVisible();
    // Let one full sequence finish naturally, without clicks or timer-driven navigation.
    await page.locator('.p-scene').evaluate(el => Promise.all(el.getAnimations({subtree:true}).map(a => a.finished.catch(() => {}))));
    await expect(page).toHaveURL(/#vision-objetivos$/);
    const finalState = await page.locator('.p-unified').evaluate(el => { const style=getComputedStyle(el); return {opacity:style.opacity,identity:new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform).isIdentity}; });
    expect(finalState).toEqual({opacity:'1',identity:true});
    const delays = await page.locator('.p-domain').evaluateAll(nodes => nodes.map(el => parseFloat(getComputedStyle(el).animationDelay)));
    expect(delays[0]).toBeLessThan(delays[1]); expect(delays[1]).toBeLessThan(delays[2]);
    await expect(page.locator('.p-shell')).not.toContainText(timeText);
  });

  test('native crossfade, rapid manual inputs, CSS fallback and static map', async ({ page }) => {
    await page.goto('/presentacion#problema');
    await expect(page.locator('#problema-title')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#vision-objetivos-title')).toBeVisible();
    await expect(page).toHaveURL(/#vision-objetivos$/);
    // Navigation remains available while snapshots or content are still animating.
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#no-contempla-title')).toBeVisible();
    await page.keyboard.press('Home'); await expect(page.locator('#inicio-title')).toBeVisible();
    await page.keyboard.press('End'); await expect(page.locator('#cierre-title')).toBeVisible();
    await page.evaluate(() => Object.defineProperty(document,'startViewTransition',{value:undefined,configurable:true}));
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#implementacion-demo-title')).toBeVisible();
    await page.goto('/presentacion/mapa');
    expect(await page.locator('.p-map').evaluate(el => el.getAnimations({subtree:true}).length)).toBe(0);
  });
});

test('reduced motion exposes all content immediately, including SVG and pseudo connections', async ({ page }) => {
  for (const id of ['inicio','vision-objetivos','alcance-limites','competencia','sintesis-elicitacion']) {
    await page.goto(`/presentacion#${id}`);
    await expect(page.locator('h1')).toHaveAttribute('id',`${id}-title`);
    expect(await page.locator('.p-scene').evaluate(el => el.getAnimations({subtree:true}).length)).toBe(0);
    const styles = await page.locator('h1').evaluate(el => ({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}));
    expect(styles).toEqual({opacity:'1',transform:'none'});
  }
  await page.goto('/presentacion#vision-objetivos');
  await expect(page.locator('.p-unified')).toBeVisible();
  expect(await page.locator('.p-domain path').first().evaluate(el => getComputedStyle(el).strokeDashoffset)).toBe('0px');
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('#problema-title')).toBeVisible();
});

test('merged content preserves objectives, boundaries and new design conclusions', async ({page}) => {
  await page.goto('/presentacion#vision-objetivos');
  await expect(page.locator('.p-vision-objectives')).toContainText('Objetivo del proyecto');
  await expect(page.locator('.p-vision-objectives')).toContainText('Objetivo del sistema');
  await expect(page.locator('.p-vision-objectives')).toContainText('Registrar');
  await expect(page.locator('.p-vision-objectives')).toContainText('Analizar');
  await page.goto('/presentacion#alcance-limites');
  await expect(page.locator('.p-scope-flow>li')).toHaveCount(6);
  await expect(page.locator('.p-scope-boundaries')).toContainText('DESDE');
  await expect(page.locator('.p-scope-boundaries')).toContainText('HASTA');
  await page.goto('/presentacion#contexto-proceso');
  await expect(page.locator('.p-context-person')).toContainText('actividad física estructurada');
  await expect(page.locator('.p-current-process .p-card')).toHaveCount(3);
  await expect(page.locator('.p-current-process')).toContainText('Comparación manual');
  await page.goto('/presentacion#sintesis-elicitacion');
  for(const label of ['Centralización','Simplicidad','Integración controlada']) await expect(page.locator('.p-summary-findings')).toContainText(label);
  await expect(page.locator('h1')).not.toContainText('El problema no era registrar');
});

test('legacy hashes resolve to merged equivalents without duplicate scenes', async ({page}) => {
  for(const [before,after] of [['formance','vision-objetivos'],['objetivo-proyecto','vision-objetivos'],['objetivo-sistema','vision-objetivos'],['alcance','alcance-limites'],['limites','alcance-limites'],['contexto','contexto-proceso'],['proceso-actual','contexto-proceso']]) {
    await page.goto(`/presentacion#${before}`);
    await expect(page).toHaveURL(new RegExp(`#${after}$`));
    await expect(page.locator('h1')).toHaveAttribute('id',`${after}-title`);
  }
});

test('demo opens only by click; offline backup stays inside scene 20', async ({ page, context }) => {
  await context.route('**/app', route => route.fulfill({contentType:'text/html',body:'<h1>Demo destination</h1>'}));
  await page.goto('/presentacion#implementacion-demo');
  const cta = page.getByRole('link',{name:/Ver Formance en/});
  await expect(cta).toHaveAttribute('href','/app');
  await expect(cta).toHaveAttribute('target','_blank');
  expect(context.pages()).toHaveLength(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const popupPromise = page.waitForEvent('popup');
  await cta.click(); const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/app$/); await popup.close();
  const open = page.getByRole('button',{name:'Ver capturas de respaldo'});
  await open.click(); const gallery = page.getByRole('dialog');
  await expect(gallery).toBeVisible();
  for(let i=0;i<4;i++) {
    await expect(gallery.locator('img')).toBeVisible();
    expect(await gallery.locator('img').evaluate(img=>img.complete && img.naturalWidth===1440)).toBeTruthy();
    await gallery.dispatchEvent('wheel',{deltaY:100,bubbles:true,cancelable:true});
    await gallery.locator('strong').click(); await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/#implementacion-demo$/);
    if(i<3) await gallery.getByRole('button',{name:'Captura siguiente'}).click();
  }
  await page.keyboard.press('Escape'); await expect(gallery).not.toBeVisible();
  await expect(open).toBeFocused();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await expect(page).toHaveURL(/#cierre$/);
});
