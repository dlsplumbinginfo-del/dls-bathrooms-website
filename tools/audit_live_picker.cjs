const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const out=path.resolve('tmp/picker-live-audit');fs.mkdirSync(out,{recursive:true});
const TEST_URL='https://dlsbathrooms.co.uk/ideas/customise/?look=';
function diff(a,b){
 if(!a||!b||!a.pix||!b.pix)return null;
 const zones={left:[0,40],middle:[40,80],right:[80,120],all:[0,120]};
 const info={};
 for(const [label,[lo,hi]] of Object.entries(zones)){
  let count=0,changed=0,mag=0;
  for(let y=0;y<90;y++)for(let x=lo;x<hi;x++){
   let idx=(y*120+x)*4,dist=Math.max(Math.abs(a.pix[idx]-b.pix[idx]),Math.abs(a.pix[idx+1]-b.pix[idx+1]),Math.abs(a.pix[idx+2]-b.pix[idx+2]));
   count++;mag+=dist;if(dist>24)changed++;
  }
  info[label]={changedPct:Number((changed/count*100).toFixed(2)),avgChannelDelta:Number((mag/count).toFixed(2))};
 }
 return info;
}
async function screenshot(page,prefix,label){
 const canvas=page.locator('#live-room canvas');
 await canvas.screenshot({path:path.join(out,prefix+'-'+label+'.png')});
 return page.evaluate(()=>{
  const canvas=document.querySelector('#live-room canvas'),tmp=document.createElement('canvas');
  tmp.width=120;tmp.height=90;const cx=tmp.getContext('2d',{willReadFrequently:true});
  cx.drawImage(canvas,0,0,120,90);
  const pix=Array.from(cx.getImageData(0,0,120,90).data);
  const s=window.dlsCustomiser;
  return {pix, state:s?.state, visual:s?.visual, view:document.querySelector('#view-live')?.getAttribute('aria-pressed'),inspiration:document.querySelector('#room-image')?.src,sourceCanvas:[canvas.width,canvas.height],modelCaption:document.querySelector('#preview-note')?.innerText};
 });
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 let errors=[],results=[],fatal=false;
 try{
  for(const look of [1,51,58]){
   for(const device of ['desktop','mobile']){
    const page=await browser.newPage({viewport:device==='mobile'?{width:390,height:844}:{width:1280,height:900},deviceScaleFactor:device==='mobile'?2:1});
    page.on('pageerror',e=>errors.push(device+' '+look+' '+String(e)));
    page.on('console',m=>{if(m.type()==='error')errors.push(device+' '+look+' '+m.text())});
    let response=await page.goto(TEST_URL+look,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#app').waitFor({state:'visible',timeout:30000});
    await page.waitForTimeout(500);
    const browserHealth=await page.evaluate(()=>({canvasCount:document.querySelectorAll('#live-room canvas').length,modelStatus:document.querySelector('#model-loading')?.textContent,errorVisible:!document.querySelector('#error')?.hidden,script:[...document.querySelectorAll('script')].map(x=>x.src),userAgent:navigator.userAgent,webglSupported:!!document.createElement('canvas').getContext('webgl2')}));
    console.log('LIVE_BROWSER_HEALTH '+JSON.stringify({look,device,health:browserHealth,errors,href:page.url(),liveRoomHtml:(await page.locator('#live-room').innerHTML()).slice(0,1400),htmlBeginning:(await page.content()).slice(0,2000),responseHeaders:response.headers()}));
    if(!browserHealth.canvasCount){const snap=await page.screenshot({path:path.join(out,device+'-'+look+'-no-canvas.jpg'),type:'jpeg',quality:32});console.log('PAGE_JPEG '+snap.toString('base64'));throw Error('No 3D canvas; check health output');}
    await page.locator('#live-room canvas').waitFor({state:'visible',timeout:7000});
    await page.waitForTimeout(1500);
    const prefix=device+'-'+look;
    const before=await screenshot(page,prefix,'before');
    const tileId=before.state?.wall==='9f95cd40'?'84b33a4f':'9f95cd40';
    await page.locator('#wall-options [data-wall="'+tileId+'"]').click();
    await page.waitForTimeout(1400);
    const after=await screenshot(page,prefix,'after');
    await page.locator('#finish-options [data-finish="Matte Black"]').click();
    await page.waitForTimeout(500);
    const metal=await screenshot(page,prefix,'metal');
    await page.locator('#view-inspiration').click();
    await page.locator('#wall-options [data-wall="84b33a4f"]').click();
    await page.waitForTimeout(800);
    const switched=await screenshot(page,prefix,'after-static-view');
    const entry={look,device,httpStatus:response.status(),canvasSize:before.sourceCanvas,
      initial:before.state?.wall,chosen:tileId,afterWall:after.state?.wall,
      initialCoverage:before.state?.coverage,finalCoverage:after.state?.coverage,
      originalPhotoBefore:before.inspiration,originalPhotoAfter:after.inspiration,
      activeViewOnChange:after.view,backFromStaticView:switched.view,
      changes:diff(before,after),metalChanges:diff(after,metal),
      wallSurfaces:after.visual?.wallSurfaces,modelCaption:after.modelCaption};
    results.push(entry);
    console.log('LIVE_AUDIT '+JSON.stringify(entry));
    if(!entry.changes||entry.changes.all.changedPct<2)fatal=true;
    await page.close();
   }
  }
  console.log('LIVE_AUDIT_ERRORS '+JSON.stringify(errors));
  console.log('LIVE_AUDIT_COMPLETE '+JSON.stringify({tested:results.length,criticalPixelFailure:fatal,errorCount:errors.length}));
  if(fatal||errors.length)process.exitCode=1;
 }catch(e){console.error('LIVE_AUDIT_FATAL',e);process.exitCode=1;}
 finally{await browser.close();}
})();