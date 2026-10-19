// Optional: run only against your configured HTTPS staging deployment.
// Install separately: npm install --no-save playwright && npx playwright install chromium
import {chromium} from 'playwright';import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.OPUS_QA_URL?.replace(/\/$/,'');if(!base?.startsWith('https://'))throw new Error('Set OPUS_QA_URL to your HTTPS staging URL.');
const browser=await chromium.launch({headless:true});await mkdir('qa-artifacts',{recursive:true});const report=[];
try{for(const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:844},{width:360,height:800}]){
 const context=await browser.newContext({viewport,hasTouch:viewport.width<800,isMobile:viewport.width<500});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['index','gallery','about','faq','contact']){
  await page.goto(base+'/'+route+'.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>!document.querySelector('#main')?.textContent.includes('Loading the studio…'));
  assert(await page.locator('.brand').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow: '+route+' '+viewport.width);
  if(route==='gallery')assert(await page.locator('.work-card').count()>0,'Seed must be published with image lock still on.');
  if(route==='faq'){assert.equal(await page.locator('.faq-list details').count(),7);await page.locator('.faq-list summary').first().click();await page.waitForTimeout(500);assert(await page.locator('.faq-list details').first().evaluate(e=>e.open));}
  await page.screenshot({path:`qa-artifacts/${viewport.width}-${route}.png`,fullPage:true});report.push({viewport:viewport.width,route,overflow:false});
 }
 await page.goto(base+'/gallery.html',{waitUntil:'networkidle'});await page.locator('[data-lang="tr"]').click();await page.waitForFunction(()=>document.documentElement.lang==='tr');assert((await page.locator('.page-head h1').textContent()).toLowerCase().includes('galeri'));
 assert.deepEqual(errors,[],'Browser JavaScript errors');await context.close();
 }
 const response=await fetch(base+'/api/state');assert.equal(response.status,401,'Unauthenticated admin API');const status=await (await fetch(base+'/api/status')).json();assert.equal(status.imagesHidden,true,'Engineer review must start with photos hidden.');
 await writeFile('qa-artifacts/browser-report.json',JSON.stringify({passed:true,report},null,2));console.log('Browser smoke passed. Screenshots require human visual review. No mail sent, no data changed, no image lock opened.');
}finally{await browser.close();}
