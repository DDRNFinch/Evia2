(()=>{
"use strict";
const VERSION=106,STORE="evia-selfobs-live-v3",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1";
let DATA=[],dataKey="",dataPromise=null,queued=false;
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function ctx(){return window.EviaCourseContext?.current?.()||null}
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"}
  return""
}
function entries(){const x=read(STORE,[]);return Array.isArray(x)?x:[]}
function learnerOppSet(xs=entries()){return new Set(xs.map(e=>e?.opportunityId).filter(Boolean))}
function learnerCodeSet(xs=entries()){const out=new Set();xs.forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).forEach(c=>out.add(String(c).toUpperCase())));return out}
function rplSet(){const allowed=new Set((ctx()?.codes||[]).map(c=>String(c).toUpperCase())),x=read(RPL_KEY,[]);return new Set((Array.isArray(x)?x:[]).map(c=>String(c).toUpperCase()).filter(c=>!allowed.size||allowed.has(c)))}
function milosSet(){const c=ctx(),route=routeId(c),allowed=new Set((c?.codes||[]).map(x=>String(x).toUpperCase())),map=read(OBS_KEY,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};return new Set(Object.keys(bucket||{}).map(x=>String(x).toUpperCase()).filter(code=>!allowed.size||allowed.has(code)))}
function combinedCodeSet(xs=entries()){const out=learnerCodeSet(xs);rplSet().forEach(c=>out.add(c));milosSet().forEach(c=>out.add(c));return out}
async function ensureData(){
  const c=ctx();if(!c||c.noCourse||!c.dataPrefix)return[];
  const key=`${c.courseId}|${c.pathway||""}|${c.dataPrefix}`;if(DATA.length&&dataKey===key)return DATA;if(dataPromise&&dataKey===key)return dataPromise;dataKey=key;
  dataPromise=(async()=>{try{const parts=await Promise.all([1,2,3].map(async n=>{const t=await fetch(`./app/${c.dataPrefix}-${n}.ts?v=${VERSION}`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});const m=t.match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);if(!m)throw Error("data parse");return JSON.parse(m[1])}));DATA=parts.flat();return DATA}catch(e){console.warn("Evia evidence state could not load course map",e);DATA=[];return[]}finally{dataPromise=null}})();return dataPromise
}
function findCat(id){return DATA.find(c=>String(c.id)===String(id))}
function findJob(id){for(const c of DATA){const j=(c.jobs||[]).find(x=>String(x.id)===String(id));if(j)return j}return null}
function findOpp(id){for(const c of DATA)for(const j of c.jobs||[]){const o=(j.opps||[]).find(x=>String(x.id)===String(id));if(o)return o}return null}
function codesOf(o){return(o?.codes||[]).map(c=>String(c).toUpperCase()).filter(Boolean)}
function allBy(o,set){const codes=codesOf(o);return !!codes.length&&codes.every(c=>set.has(c))}
function oppComplete(o,learnerOpp,rpl,milos){return !!o&&(learnerOpp.has(o.id)||allBy(o,rpl)||allBy(o,milos))}
function jobComplete(j,learnerOpp,rpl,milos){const opps=(j?.opps||[]).filter(o=>codesOf(o).length);return !!opps.length&&opps.every(o=>oppComplete(o,learnerOpp,rpl,milos))}
function catComplete(c,learnerOpp,rpl,milos){const jobs=(c?.jobs||[]).filter(j=>(j.opps||[]).some(o=>codesOf(o).length));return !!jobs.length&&jobs.every(j=>jobComplete(j,learnerOpp,rpl,milos))}
function side(btn){return btn?.querySelector?.(".self-side")||null}
function directYellow(btn){const s=side(btn);if(!s)return null;return[...s.children].find(el=>el.tagName==="B")||null}
function setYellow(btn,on,label,kind){const s=side(btn);if(!s)return;let b=directYellow(btn);if(!on){b?.remove();return}if(!b){b=document.createElement("b");const arrow=s.querySelector(":scope > i");if(arrow)s.insertBefore(b,arrow);else s.appendChild(b)}b.textContent="✓";b.className=`evia-evidence-check ${kind||""}`.trim();b.title=label;b.setAttribute("aria-label",label);b.setAttribute("role","img")}
function clearLegacyOppSources(btn){side(btn)?.querySelectorAll(":scope > .evia-rpl-evidence-marks,:scope > .evia-milos-evidence-marks,:scope > .evia-source-tick-v105").forEach(x=>x.remove())}
function setOppSource(btn,type,on,label){
  const s=side(btn);if(!s)return;let mark=s.querySelector(`:scope > .evia-opportunity-source-v106.${type}`);
  if(!on){mark?.remove();return}
  if(!mark){mark=document.createElement("span");mark.className=`evia-opportunity-source-v106 ${type}`;const arrow=s.querySelector(":scope > i");if(arrow)s.insertBefore(mark,arrow);else s.appendChild(mark)}
  mark.textContent="✓";mark.title=label;mark.setAttribute("aria-label",label);mark.setAttribute("role","img")
}
function ksbRail(btn){
  let rail=btn.querySelector(":scope > .evia-ksb-marker-rail-v106");
  if(!rail){rail=document.createElement("span");rail.className="evia-ksb-marker-rail-v106";rail.setAttribute("aria-label","Evidence sources");btn.appendChild(rail)}
  return rail
}
function setKsbRail(btn,learner,rpl,milos){
  const rail=ksbRail(btn),states=[["learner",learner,"Learner evidence"],["rpl",rpl,"Recognised prior learning"],["milos",milos,"Observed by assessor in Milos"]];
  for(const[type,on,label]of states){let slot=rail.querySelector(`:scope > .evia-ksb-slot-v106.${type}`);if(!slot){slot=document.createElement("span");slot.className=`evia-ksb-slot-v106 ${type}`;rail.appendChild(slot)}slot.classList.toggle("on",!!on);slot.textContent=on?"✓":"";if(on){slot.title=label;slot.setAttribute("aria-label",label);slot.setAttribute("role","img")}else{slot.removeAttribute("title");slot.removeAttribute("aria-label");slot.removeAttribute("role")}}
}
function setGroupYellow(card,on){const em=card.querySelector("strong em");if(!em)return;if(on){em.textContent="✓";em.classList.add("evia-evidence-check");em.title="Evidence recorded"}else{em.textContent="";em.classList.remove("evia-evidence-check");em.removeAttribute("title")}}
function setArchCoverage(covered){const c=ctx(),codes=(c?.codes||[]).map(x=>String(x).toUpperCase());if(!codes.length)return;const n=codes.filter(code=>covered.has(code)).length,pct=Math.round(n/codes.length*100),arch=document.querySelector('[data-arch="KSB"],[data-arch="AC"]');if(arch){const path=arch.querySelector(".arch-value"),num=arch.querySelector(".arch-number");if(path){path.setAttribute("stroke-dasharray",`${pct} 100`);path.style.strokeDasharray=`${pct} 100`}if(num)num.textContent=`${pct}%`}const mini=[...document.querySelectorAll(".self-mini button")].find(b=>/course coverage/i.test(b.textContent||"")),text=mini?.querySelector("span");if(text)text.textContent=`${n} of ${codes.length} evidenced`}
function patchCopy(){
  document.querySelectorAll(".self-copy,.evia-nvq-note").forEach(el=>{
    const t=el.textContent||"";
    let next=t;
    if(/A yellow tick shows that you have evidence against that KSB/i.test(next))next="Yellow shows learner evidence, purple shows RPL and blue shows Milos observation. Each KSB has a fixed place for each source.";
    next=next.replace("Yellow marks only show how many times you have evidenced each KSB.","Yellow shows learner evidence, purple shows RPL and blue shows Milos observation.")
      .replace("Yellow marks show evidence frequency.","Yellow ticks show learner evidence.")
      .replace("Purple o marks show RPL.","Purple ticks show RPL.")
      .replace("Blue o marks show assessor-observed coverage.","Blue ticks show assessor-observed coverage.")
      .replace("Yellow o = evidence.","Yellow tick = learner evidence.");
    if(next!==t)el.textContent=next
  })
}
async function patch(){
  queued=false;await ensureData();
  const xs=entries(),learnerOpp=learnerOppSet(xs),learnerCodes=learnerCodeSet(xs),rpl=rplSet(),milos=milosSet(),covered=combinedCodeSet(xs);
  document.querySelectorAll("button[data-cat]").forEach(btn=>{const c=findCat(btn.dataset.cat),on=catComplete(c,learnerOpp,rpl,milos);setYellow(btn,on,on?"Every area in this folder is covered":"","evia-folder-complete-v106")});
  document.querySelectorAll("button[data-job]").forEach(btn=>{const j=findJob(btn.dataset.job),on=jobComplete(j,learnerOpp,rpl,milos);setYellow(btn,on,on?"Every area in this folder is covered":"","evia-folder-complete-v106")});
  document.querySelectorAll("button[data-opp]").forEach(btn=>{
    const o=findOpp(btn.dataset.opp),learner=learnerOpp.has(btn.dataset.opp),allRpl=allBy(o,rpl),allMilos=allBy(o,milos);
    clearLegacyOppSources(btn);setYellow(btn,learner,"Learner evidence recorded","evia-learner-source-v106");
    setOppSource(btn,"rpl",allRpl,"All KSBs in this evidence area are covered by RPL");
    setOppSource(btn,"milos",allMilos,"All KSBs in this evidence area are covered by Milos")
  });
  document.querySelectorAll(".self-ksbs button[data-code]").forEach(btn=>{const code=String(btn.dataset.code||"").toUpperCase();setKsbRail(btn,learnerCodes.has(code),rpl.has(code),milos.has(code))});
  document.querySelectorAll(".self-card.group").forEach(card=>setGroupYellow(card,!!card.querySelector(".self-entry")));
  setArchCoverage(covered);patchCopy()
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>patch())}
const WATCH="button[data-cat],button[data-job],button[data-opp],.self-ksbs button[data-code],.self-card.group,.self-entry,.self-mini,[data-arch='KSB'],[data-arch='AC'],.evia-nvq-note,.self-copy";
function relevant(records){return records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(WATCH)||n.querySelector?.(WATCH))))}
function hookStorage(){
  if(window.__eviaEvidenceStateStorageV106)return;window.__eviaEvidenceStateStorageV106=true;const native=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const out=native.call(this,key,value);if(this===localStorage&&[STORE,RPL_KEY,OBS_KEY].includes(String(key))){queue();setTimeout(queue,0)}return out}
}
function start(){hookStorage();queue();const root=document.getElementById("root")||document.body;if(root&&!root.__eviaEvidenceStateV106){root.__eviaEvidenceStateV106=true;new MutationObserver(records=>{if(relevant(records))queue()}).observe(root,{subtree:true,childList:true})}}
window.addEventListener("load",start);window.addEventListener("pageshow",queue);window.addEventListener("storage",e=>{if([STORE,RPL_KEY,OBS_KEY].includes(e.key)){queue();setTimeout(queue,0)}});window.addEventListener("evia:milos-observed-changed",()=>{queue();setTimeout(queue,0)});document.addEventListener("click",()=>setTimeout(queue,0),true);if(document.readyState!=="loading")start();else document.addEventListener("DOMContentLoaded",start,{once:true});
const style=document.createElement("style");style.id="evia-evidence-state-v106-style";style.textContent=`
.evia-opportunity-source-v106{display:inline-grid!important;place-items:center!important;width:.92rem!important;height:.92rem!important;min-width:.92rem!important;border-radius:50%!important;color:#fff!important;font:850 .62rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;letter-spacing:0!important;box-shadow:none!important}
.evia-opportunity-source-v106.rpl{background:#7b3fc6!important}.evia-opportunity-source-v106.milos{background:#367fd0!important}
.selfobs .self-ksbs button[data-code]>.evia-rpl-o,.selfobs .self-ksbs button[data-code]>.evia-milos-arch-marker,.selfobs .self-ksbs button[data-code]>.evia-milos-observed-marker,.selfobs .self-ksbs button[data-code]>span:not(.evia-ksb-marker-rail-v106){display:none!important}
.selfobs .self-ksbs button[data-code]>.evia-ksb-marker-rail-v106{display:grid!important;grid-template-columns:repeat(3,.92rem)!important;justify-content:center!important;align-items:center!important;gap:.12rem!important;min-height:.92rem!important;margin:.18rem auto 0!important;color:inherit!important;font-size:0!important;letter-spacing:0!important}
.selfobs .evia-ksb-slot-v106{display:inline-grid!important;place-items:center!important;width:.92rem!important;height:.92rem!important;min-width:.92rem!important;min-height:.92rem!important;margin:0!important;border-radius:50%!important;opacity:0!important;font:850 .62rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;letter-spacing:0!important;box-shadow:none!important}
.selfobs .evia-ksb-slot-v106.on{opacity:1!important}.selfobs .evia-ksb-slot-v106.learner.on{background:#efc33d!important;color:#4c3b0b!important}.selfobs .evia-ksb-slot-v106.rpl.on{background:#7b3fc6!important;color:#fff!important}.selfobs .evia-ksb-slot-v106.milos.on{background:#367fd0!important;color:#fff!important}
`;document.head.appendChild(style);
const api=Object.freeze({version:VERSION,refresh:queue,covered:()=>[...combinedCodeSet()],rpl:()=>[...rplSet()],milos:()=>[...milosSet()]});window.EviaEvidenceStateV106=api;window.EviaEvidenceStateV105=api;
const NAV_SELECTOR=["button[data-cat]","button[data-job]","button[data-opp]","button[data-mode]","button[data-tab]","button[data-code]","button[data-arch='KSB']","button[data-quick]","button[data-evia]",".option-row",".self-back",".self-evidence",".evia-target-row",".evia-target-history-row","[data-view]","[data-nav]","[data-route]","[data-action='back']","[data-action='next']","[data-action='save']","[data-action='submit']","[data-action='finish']","[data-action='home']","[data-action='evidence']","[data-action='coverage']"].join(",");
const SURFACE_SELECTOR=".self-panel,.view-panel,.selfobs-view,.evia-tools-screen,.evia-sign-card,.selfobs-help-card,.evia-target-layer,.evia-rpl-layer";let replaying=false,transitioning=false;
function reducedMotion(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function surfaceFor(control){return control.closest?.(SURFACE_SELECTOR)||document.querySelector(SURFACE_SELECTOR)}function fallbackSurface(){return document.querySelector(SURFACE_SELECTOR)}
document.addEventListener("click",event=>{if(replaying||transitioning||reducedMotion()||event.defaultPrevented)return;const control=event.target instanceof Element?event.target.closest(NAV_SELECTOR):null;if(!control||control.disabled||control.getAttribute?.("aria-disabled")==="true")return;if(control.matches?.("[data-evia-native-photo],[data-evia-native-video],[data-evia-native-gallery],[data-pick],[data-action='record'],[data-action='stop'],[data-action='download'],[data-install-update],[data-later]"))return;const surface=surfaceFor(control);if(!surface)return;event.preventDefault();event.stopImmediatePropagation();transitioning=true;surface.classList.remove("evia-nav-enter");surface.classList.add("evia-nav-leave");window.setTimeout(()=>{replaying=true;try{control.click()}finally{replaying=false}requestAnimationFrame(()=>requestAnimationFrame(()=>{const next=surface.isConnected?surface:fallbackSurface();if(next){next.classList.remove("evia-nav-leave");next.classList.remove("evia-nav-enter");void next.offsetWidth;next.classList.add("evia-nav-enter")}transitioning=false}))},125)},true);
})();