import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'
const browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const errors=[]
try {
 for(const [name,width,height,reduced] of [['desktop',1440,900,false],['mobile',390,844,false],['reduced',390,844,true]]) {
  const page=await browser.newPage(); await page.setViewport({width,height});
  page.on('pageerror',e=>errors.push(e.message))
  if(reduced) await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}])
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:4173',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#loader')).display==='none');
  await page.screenshot({path:`/tmp/verion-${name}-hero.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflow`)
  for(const progress of reduced?[0]:[0,.5,.9]) {
   await page.evaluate(p=>{const s=document.querySelector('.tempo');window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p)},progress)
   await new Promise(r=>setTimeout(r,1300));
   await page.screenshot({path:`/tmp/verion-${name}-${progress}.png`});
   if(!reduced) {
    const visible=await page.$$eval('.tempo__chapter',els=>els.map(e=>Number(getComputedStyle(e).opacity)))
    assert(visible.filter(x=>x>.95).length===1,`chapter visibility ${name} ${progress}: ${visible}`)
   }
  }
  if(reduced) assert.equal(await page.$eval('.tempo',e=>e.classList.contains('tempo--animated')),false)
  await page.click('[data-menu-open]'); await new Promise(r=>setTimeout(r,500));
  assert.equal(await page.$eval('#menu',e=>e.getAttribute('aria-hidden')),'false')
  await page.keyboard.press('Escape');
  await page.close(); console.log(`${name}: overflow, chapters, menu passed`)
 }
 assert.deepEqual(errors,[]);console.log('No runtime errors')
} finally { await browser.close() }
