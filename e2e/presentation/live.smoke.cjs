const { test, expect } = require('../e4/node_modules/@playwright/test');
const origin = new URL(process.env.PRESENTATION_LIVE_URL).origin;
test.beforeEach(async ({ context }) => {
  // No writes or AI/provider calls during publication verification.
  await context.route('**/*', route => {
    const request=route.request(),url=new URL(request.url());
    if(!['GET','HEAD'].includes(request.method())) return route.abort();
    if(/generativelanguage|fooddata|usda/i.test(url.hostname) || /\/api\//.test(url.pathname)) return route.abort();
    return route.continue();
  });
});
test('public presentation, map, hashes, assets and manual navigation',async({page})=>{
  test.setTimeout(90000);
  const external=[];const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(new URL(r.url()).origin!==origin) external.push(r.url());});
  const response=await page.goto('/presentacion');expect(response.status()).toBe(200);
  await expect(page.locator('#inicio-title')).toBeVisible();
  for(const id of ['problema','competencia','diagnostico','requerimientos-funcionales','implementacion-demo','cierre']){
    await page.goto(`/presentacion#${id}`);await expect(page.locator('h1')).toHaveAttribute('id',`${id}-title`);
    await page.locator('.p-scene').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    expect(await page.locator('.p-slide img').evaluateAll(nodes=>nodes.filter(n=>!n.closest('dialog')).every(n=>n.complete && n.naturalWidth>0))).toBeTruthy();
  }
  await page.goto('/presentacion#problema');
  for(const [key,id] of [['ArrowRight','vision-objetivos'],['ArrowLeft','problema'],['Space','vision-objetivos'],['Home','inicio'],['End','cierre']]){
    await page.keyboard.press(key);await expect(page).toHaveURL(new RegExp(`#${id}$`));
  }
  await page.mouse.move(600,400);await page.mouse.wheel(0,-100);await expect(page).toHaveURL(/#implementacion-demo$/);
  await page.getByRole('button',{name:'Presentar',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('button',{name:'Presentar',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(false);
  await page.goto('/presentacion/mapa');await expect(page.locator('.p-map-card')).toHaveCount(21);await expect(page.locator('.p-map-block')).toHaveCount(7);
  await page.locator('.p-map-link').nth(19).click();await expect(page).toHaveURL(/#implementacion-demo$/);
  await page.getByRole('button',{name:'Ver capturas de respaldo'}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  for(let i=0;i<5;i++){
    await expect.poll(()=>dialog.locator('img').evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
    if(i<4) await dialog.getByRole('button',{name:'Captura siguiente'}).click();
  }
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  expect(external).toEqual([]);expect(errors).toEqual([]);
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  for(const id of ['contexto-proceso','propuesta','implementacion-demo','cierre']){
    await page.goto(`/presentacion#${id}`);await expect(page.locator('h1')).toHaveAttribute('id',`${id}-title`);
    expect(await page.locator('.p-scene').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
    expect(await page.locator('.p-slide').evaluate(el=>el.scrollWidth<=el.clientWidth && el.scrollHeight<=el.clientHeight)).toBe(true);
  }
});
test('existing home, login and unauthenticated demo destination',async({page})=>{
  for(const route of ['/','/login']){
    const response=await page.goto(route);expect(response.status()).toBe(200);await expect(page.locator('h1')).toBeVisible();
  }
  await page.goto('/presentacion#implementacion-demo');
  const cta=page.getByRole('link',{name:/Ver Formance en/});await expect(cta).toHaveAttribute('href','/app');
  const promise=page.waitForEvent('popup');await cta.click();const popup=await promise;
  await expect(popup).toHaveURL(/\/login(?:\?|$)/,{timeout:30000});await expect(popup.locator('h1')).toBeVisible();await popup.close();
});
