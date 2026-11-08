const { test, expect } = require('../e4/node_modules/@playwright/test');
const path = require('node:path');
const scenes = [
  { id:'inicio', file:'01-cover', speaker:'Hernán' },
  { id:'equipo', file:'02-team', speaker:'Hernán' },
  { id:'problema', file:'03-problem', speaker:'Hernán' },
  { id:'mercado', file:'04-market', speaker:'Nahuel' },
  { id:'posicionamiento', file:'05-positioning', speaker:'Nahuel' },
  { id:'propuesta', file:'06-solution', speaker:'Diego' },
  { id:'experiencia', file:'07-experience', speaker:'Matías' },
  { id:'demo', file:'08-demo-transition', speaker:'Matías → Hernán' },
  { id:'cierre', file:'09-closing', speaker:'Hernán' },
];
const forbidden = /elicitación|relevamiento|diagnóstico|AS-IS|TO-BE|RF01|RNF|CU01|stakeholders|modelo de negocio|requerimientos|casos de uso|UML|Next\.js|React|TypeScript|Express|Firebase|USDA|Gemini/i;
const timer = /\b\d{1,2}:\d{2}\b|cronómetro|tiempo restante|temporizador/i;
test.beforeEach(async ({ context, page }) => {
  const external = []; const errors = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || /\/api\//.test(url.pathname)) { external.push(url.href); return route.abort(); }
    return route.continue();
  });
  page.on('pageerror', error => errors.push(error.message));
  page.__external = external; page.__errors = errors;
});
test.afterEach(async ({ page }) => { expect(page.__external).toEqual([]); expect(page.__errors).toEqual([]); });

test('map separates nine principal slides, speakers, notes and six academic topics', async ({ page }) => {
  await page.goto('/presentacion/mapa');
  const cards = page.locator('.p-map-card');
  await expect(cards).toHaveCount(9); await expect(page.locator('.p-map-block')).toHaveCount(5);
  for (const [i, scene] of scenes.entries()) {
    await expect(cards.nth(i).locator('.p-map-link')).toHaveAttribute('href', `/presentacion#${scene.id}`);
    await expect(cards.nth(i).locator('h3')).toContainText(String(i + 1).padStart(2,'0'));
    await expect(cards.nth(i)).toContainText(scene.speaker);
  }
  await expect(page.locator('.p-backup-map-link')).toHaveCount(6);
  await expect(page.locator('.p-map-main')).not.toContainText('RNF');
  expect(await page.locator('.p-map').innerText()).not.toMatch(timer);
  expect(await page.locator('.p-map').evaluate(el => el.getAnimations({subtree:true}).length)).toBe(0);
  await cards.nth(7).locator('.p-map-notes summary').click();
  await expect(cards.nth(7).locator('.p-map-notes')).toContainText('FLOW 1');
  await expect(cards.nth(7).locator('.p-map-notes')).toContainText('Resumen del mes');
  await cards.nth(1).locator('.p-map-link').click(); await expect(page).toHaveURL(/#equipo$/);
});

test('all principal hashes load their scene, public count and product wording', async ({ page }) => {
  for (const [i, scene] of scenes.entries()) {
    await page.goto(`/presentacion?debug=1#${scene.id}`);
    await expect(page.locator('h1')).toHaveAttribute('id', `${scene.id}-title`);
    await expect(page.locator('.p-slide')).toHaveAttribute('aria-labelledby', `${scene.id}-title`);
    await expect(page.locator('.p-progress')).toHaveText(`${String(i + 1).padStart(2,'0')} / 09`);
    await expect(page.locator('.p-debug')).toContainText(`${i + 1}/9`);
    await expect(page.locator('.p-slide')).not.toContainText(forbidden);
    await expect(page.locator('.p-shell')).not.toContainText(timer);
  }
  await expect(page.locator('.p-shell')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.p-pitch-answer')).toContainText('transformamos registros aislados');
  await expect(page.locator('.p-pitch-thanks')).toContainText('¿Preguntas?');
  await page.goto('/presentacion#posicionamiento');
  for (const text of ['Para vos y para quien te acompaña', 'Tu entrenador o nutricionista', 'no reemplaza a nadie']) await expect(page.locator('.p-slide')).toContainText(text);
  await expect(page.locator('.p-slide')).not.toContainText('Formance no');
  await page.goto('/presentacion#experiencia');
  for (const text of ['Tu semana,', 'Muy buena semana', 'Proteína en objetivo 6 de 7 días', 'FOCO PARA LA PRÓXIMA SEMANA']) await expect(page.locator('.p-slide')).toContainText(text);
});

test('keyboard, history, controls and fullscreen keep their existing behavior', async ({ page }) => {
  await page.goto('/presentacion'); await expect(page).toHaveURL(/#inicio$/);
  await expect(page.locator('.p-debug')).toHaveCount(0);
  for (const [key,id] of [['ArrowRight','equipo'],['Space','problema'],['PageUp','equipo'],['PageDown','problema'],['Home','inicio'],['End','cierre'],['ArrowLeft','demo']]) {
    await page.keyboard.press(key); await expect(page).toHaveURL(new RegExp(`#${id}$`));
  }
  await page.goBack(); await expect(page).toHaveURL(/#cierre$/);
  await page.goForward(); await expect(page).toHaveURL(/#demo$/);
  await page.getByRole('button',{name:'Anterior',exact:true}).click(); await expect(page).toHaveURL(/#experiencia$/);
  await page.getByRole('button',{name:'Ocultar progreso'}).click(); await expect(page.locator('.p-progress')).toHaveCount(0);
  await page.getByRole('button',{name:'Mostrar progreso'}).click(); await expect(page.locator('.p-progress')).toHaveText('07 / 09');
  await page.getByRole('button',{name:'Presentar',exact:true}).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('button',{name:'Presentar',exact:true}).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.goto('/presentacion#desconocida'); await expect(page).toHaveURL(/#inicio$/);
});

test('fullscreen failures remain recoverable without changing scene', async ({ page }) => {
  await page.goto('/presentacion#inicio');
  await page.evaluate(() => Object.defineProperty(document.querySelector('.p-shell'), 'requestFullscreen', { value:undefined, configurable:true }));
  await page.getByRole('button',{name:'Presentar',exact:true}).click(); await expect(page.getByRole('status')).toContainText('no disponible');
  await page.evaluate(() => Object.defineProperty(document.querySelector('.p-shell'), 'requestFullscreen', { value:() => Promise.reject(Error('Unavailable')), configurable:true }));
  await page.getByRole('button',{name:'Presentar',exact:true}).click(); await expect(page.getByRole('status')).toContainText('No se pudo');
  await expect(page).toHaveURL(/#inicio$/);
});

for (const size of [{width:1920,height:1080},{width:1440,height:900},{width:1366,height:768},{width:390,height:844}]) {
  test(`nine scenes fit ${size.width}×${size.height}${size.width === 1920 ? ' and generate principal previews' : ''}`, async ({ page }) => {
    await page.setViewportSize(size);
    for (const scene of scenes) {
      await page.goto(`/presentacion#${scene.id}`); await expect(page.locator('h1')).toHaveAttribute('id',`${scene.id}-title`);
      await page.evaluate(() => document.fonts.ready);
      const bounds = await page.locator('.p-slide').evaluate(el => ({scroll:el.scrollHeight,height:el.clientHeight,width:el.scrollWidth,client:el.clientWidth}));
      expect(bounds.scroll,scene.id).toBeLessThanOrEqual(bounds.height); expect(bounds.width,scene.id).toBeLessThanOrEqual(bounds.client);
      const content = await page.locator('.p-slide').evaluate(el => Array.from(el.querySelectorAll('h1,h2,p,li,figcaption,.p-team-member,.p-cover-bottom,.p-domains,.p-pitch-care,.p-pitch-summary,.p-pitch-rules,.p-pitch-footnote,.p-pitch-closing-copy,.p-pitch-product')).filter(n => !n.closest('dialog')).map(e => {
        const r=e.getBoundingClientRect(); return {text:e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom};
      }).filter(r=>r.right>r.x && r.bottom>r.y));
      for(const box of content) {
        expect(box.x,`${scene.id}: ${box.text}`).toBeGreaterThanOrEqual(0); expect(box.y,`${scene.id}: ${box.text}`).toBeGreaterThanOrEqual(0);
        expect(box.right,`${scene.id}: ${box.text}`).toBeLessThanOrEqual(size.width); expect(box.bottom,`${scene.id}: ${box.text}`).toBeLessThanOrEqual(size.height - 60);
      }
      expect(await page.locator('.p-slide img').evaluateAll(nodes => nodes.filter(n=>!n.closest('dialog')).every(n=>n.complete && n.naturalWidth>0))).toBe(true);
      if (size.width === 1920) await page.screenshot({path:path.resolve(__dirname,`../../docs/presentation/previews/${scene.file}.png`),animations:'disabled'});
    }
  });
}

test('wheel gestures stay manual and inertia cannot skip slides', async ({ page }) => {
  await page.goto('/presentacion#inicio'); await expect(page.locator('#inicio-title')).toBeVisible();
  await page.clock.install(); await page.clock.fastForward(30 * 60 * 1000); await expect(page).toHaveURL(/#inicio$/);
  const wheel = deltaY => page.locator('.p-scene').dispatchEvent('wheel',{deltaY,bubbles:true,cancelable:true});
  await wheel(120); await expect(page).toHaveURL(/#equipo$/);
  for(let i=0;i<6;i++) await wheel(40); await expect(page).toHaveURL(/#equipo$/);
  await page.clock.fastForward(500); await wheel(20); await page.clock.fastForward(500); await wheel(20); await expect(page).toHaveURL(/#equipo$/);
  await page.clock.fastForward(700); await wheel(120); await expect(page).toHaveURL(/#problema$/);
  await page.clock.fastForward(700); await wheel(-120); await expect(page).toHaveURL(/#equipo$/);
  await page.goto('/presentacion#demo'); await expect(page.locator('#demo-title')).toBeVisible();
  await page.clock.fastForward(30 * 60 * 1000); await expect(page).toHaveURL(/#demo$/);
});

test('swipe navigates on mobile, taps and interactive controls do not', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/presentacion#inicio');
  await expect(page.locator('#inicio-title')).toBeVisible();
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:true});
  const swipe = async (start,end) => {
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y:400}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:end,y:400}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await swipe(300,80);
  await expect(page).toHaveURL(/#equipo$/);
  await swipe(80,300);
  await expect(page).toHaveURL(/#inicio$/);
  await swipe(100,105);
  await expect(page).toHaveURL(/#inicio$/); await client.detach();
});

test('demo CTA opens only on click and the five real fallback captures never navigate the deck', async ({ page,context }) => {
  await context.route('**/app', route => route.fulfill({contentType:'text/html',body:'<h1>Demo destination</h1>'}));
  await page.goto('/presentacion#demo'); const cta=page.getByRole('link',{name:/Ver Formance en/});
  await expect(cta).toHaveAttribute('href','/app'); await expect(cta).toHaveAttribute('target','_blank'); expect(context.pages()).toHaveLength(1);
  await expect(page.locator('.p-pitch-product img')).toHaveCount(5);
  const popupPromise=page.waitForEvent('popup'); await cta.click(); const popup=await popupPromise; await expect(popup).toHaveURL(/\/app$/); await popup.close();
  const open=page.getByRole('button',{name:'Ver capturas de respaldo'}); await open.click(); const gallery=page.getByRole('dialog'); await expect(gallery).toBeVisible();
  for(let i=0;i<5;i++) {
    await expect.poll(()=>gallery.locator('img').evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
    await gallery.dispatchEvent('wheel',{deltaY:120,bubbles:true,cancelable:true});
    await gallery.locator('strong').click(); await page.keyboard.press('ArrowRight'); await expect(page).toHaveURL(/#demo$/);
    if(i<4) await gallery.getByRole('button',{name:'Captura siguiente'}).click();
  }
  await page.keyboard.press('Escape'); await expect(gallery).not.toBeVisible(); await expect(open).toBeFocused();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click(); await expect(page).toHaveURL(/#cierre$/); await expect(page.locator('.p-progress')).toHaveText('09 / 09');
});

test('six academic topics load separately and never alter the public counter', async ({ page }) => {
  await page.goto('/presentacion/backup'); await expect(page.locator('.p-backup-topic')).toHaveCount(6); await expect(page.locator('.p-progress')).toHaveCount(0);
  for(const id of ['stack','arquitectura','requerimientos-funcionales','casos-de-uso','requisitos-modelado','as-is']) {
    await page.locator(`.p-backup-nav a[href="#${id}"]`).click(); await expect(page).toHaveURL(new RegExp(`#${id}$`)); await expect(page.locator(`section[id="${id}"]`)).toBeInViewport();
  }
  await page.setViewportSize({width:390,height:844});
  expect(await page.locator('.p-backup').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.getByRole('link',{name:'Volver al cierre →'}).click(); await expect(page).toHaveURL(/#cierre$/); await expect(page.locator('.p-progress')).toHaveText('09 / 09');
});

test('old main hashes resolve to new product equivalents', async ({ page }) => {
  for(const [before,after] of [['formance','propuesta'],['vision-objetivos','propuesta'],['competencia','mercado'],['alcance-limites','propuesta'],['no-contempla','posicionamiento'],['contexto-proceso','problema'],['proceso-actual','problema'],['implementacion-demo','demo']]) {
    await page.goto(`/presentacion#${before}`); await expect(page).toHaveURL(new RegExp(`#${after}$`)); await expect(page.locator('h1')).toHaveAttribute('id',`${after}-title`);
  }
});

test('reduced motion exposes the complete pitch immediately without animation', async ({ page }) => {
  for(const scene of scenes) {
    await page.goto(`/presentacion#${scene.id}`); await expect(page.locator('h1')).toHaveAttribute('id',`${scene.id}-title`);
    expect(await page.locator('.p-scene').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
    const concealed=await page.locator('.p-slide').evaluate(el=>Array.from(el.querySelectorAll('h1,h2,p,.p-card,.p-motion-reveal,.p-cta')).filter(n=>!n.closest('dialog') && n.getBoundingClientRect().width>0).filter(n=>getComputedStyle(n).opacity!=='1' || getComputedStyle(n).transform!=='none').map(n=>n.textContent));
    expect(concealed,scene.id).toEqual([]);
  }
});

test.describe('Motion 5 product storytelling', () => {
  test.use({reducedMotion:'no-preference'});
  test('narrative sequences are staggered, finite, visible at rest and never advance', async ({ page }) => {
    test.setTimeout(90000);
    for(const scene of scenes) {
      await page.goto(`/presentacion#${scene.id}`); await expect(page.locator('h1')).toHaveAttribute('id',`${scene.id}-title`);
      const animations=await page.locator('.p-scene').evaluate(async el=>{const all=el.getAnimations({subtree:true}); const result={count:all.length,finite:all.every(a=>a.effect.getTiming().iterations===1)}; await Promise.all(all.map(a=>a.finished.catch(()=>{}))); return result;});
      expect(animations.finite,scene.id).toBe(true); expect(animations.count,scene.id).toBeGreaterThan(2);
      await expect(page).toHaveURL(new RegExp(`#${scene.id}$`));
      const concealed=await page.locator('.p-slide').evaluate(el=>Array.from(el.querySelectorAll('h1,h2,p,.p-card,.p-motion-reveal,.p-cta')).filter(n=>!n.closest('dialog') && n.getBoundingClientRect().width>0).filter(n=>getComputedStyle(n).opacity!=='1' || getComputedStyle(n).clipPath!=='none').map(n=>n.textContent));
      expect(concealed,scene.id).toEqual([]);
    }
    await page.goto('/presentacion#propuesta');
    const delay=locator=>locator.evaluate(el=>parseFloat(getComputedStyle(el).animationDelay));
    expect(await delay(page.locator('.p-pitch-summary'))).toBeGreaterThan(await delay(page.locator('.p-unified')));
    await page.goto('/presentacion#experiencia');
    const delays=await page.locator('.wg-card').evaluateAll(nodes=>nodes.map(el=>parseFloat(getComputedStyle(el).animationDelay)));
    expect(delays[1]).toBeGreaterThan(delays[0]); expect(delays[2]).toBeGreaterThan(delays[1]);
    expect(await delay(page.locator('.wg-focus'))).toBeGreaterThan(await delay(page.locator('.wg-wins li').last()));
    await page.goto('/presentacion#cierre'); await expect(page.locator('#cierre-title')).toBeVisible();
    expect(await delay(page.locator('.p-pitch-closing-copy'))).toBeGreaterThan(await delay(page.locator('.p-pitch-closing-pillars>p').last()));
    expect(await delay(page.locator('.p-pitch-thanks'))).toBeGreaterThan(await delay(page.locator('.p-pitch-closing-copy')));
  });
  test('native direction, rapid navigation and CSS fallback remain usable', async ({ page }) => {
    await page.goto('/presentacion#problema'); await expect(page.locator('#problema-title')).toBeVisible(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#mercado-title')).toBeVisible(); await expect(page.locator('html')).toHaveAttribute('data-presentation-direction','forward');
    await page.keyboard.press('ArrowLeft'); await expect(page.locator('#problema-title')).toBeVisible(); await expect(page.locator('html')).toHaveAttribute('data-presentation-direction','backward');
    for(const key of ['ArrowRight','ArrowRight','ArrowLeft','End','Home','End']) await page.keyboard.press(key);
    await expect(page.locator('#cierre-title')).toBeVisible();
    await page.evaluate(()=>Object.defineProperty(document,'startViewTransition',{value:undefined,configurable:true}));
    await page.keyboard.press('ArrowLeft'); await expect(page.locator('#demo-title')).toBeVisible();
    await page.locator('.p-scene').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
    await expect(page).toHaveURL(/#demo$/);
  });
});
