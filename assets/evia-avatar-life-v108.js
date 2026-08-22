(()=>{
"use strict";
const VERSION=113,STYLE_ID="evia-avatar-life-v113-style",SLEEP_MS=10000;
let blinkTimer=null,lookTimer=null,gestureTimer=null,sleepTimer=null,happyTimer=null,observer=null,lastInteraction=Date.now(),sleeping=false;
const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const anchor=()=>document.querySelector(".evia-app.selfobs .evia-anchor[data-evia]");
const app=()=>document.querySelector(".evia-app.selfobs");
function ensureStyle(){
  document.getElementById("evia-avatar-life-v108-style")?.remove();
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .evia-anchor .evia-face{position:relative!important;transition:filter .55s ease,rotate .7s cubic-bezier(.22,1,.36,1),scale .55s cubic-bezier(.22,1,.36,1)!important}
.selfobs .evia-anchor .evia-face::before{content:"";position:absolute;inset:-7px;border-radius:50%;pointer-events:none;opacity:.38;background:conic-gradient(from 0deg,transparent 0 68%,rgba(239,195,61,.08) 72%,rgba(255,221,92,.72) 81%,rgba(239,195,61,.12) 88%,transparent 94%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));animation:evia-life-rollglow-v113 9.5s linear infinite}
.selfobs:not(.is-open):not(.evia-exchange-open) .evia-anchor .evia-float{animation:evia-life-float-v113 6.2s cubic-bezier(.45,0,.55,1) infinite}
.selfobs .evia-anchor .evia-halo{animation:evia-life-breathe-v113 5.1s ease-in-out infinite;filter:drop-shadow(0 0 7px rgba(239,195,61,.16));transition:opacity .6s ease,filter .6s ease,scale .6s ease!important}
.selfobs .evia-anchor .evia-eyes{transition:transform .46s cubic-bezier(.22,1,.36,1)!important}
.selfobs .evia-anchor .evia-eye{transform-origin:50% 50%;transition:scale .11s ease,translate .3s ease,border-color .25s ease,border-radius .25s ease,opacity .3s ease!important}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-look-left .evia-eyes{transform:translate(-9%,0)!important}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-look-right .evia-eyes{transform:translate(9%,0)!important}
.selfobs:not(.is-open):not(.evia-exchange-open) .evia-anchor.evia-life-look-up .evia-eyes{transform:translate(0,-7%)!important}
.selfobs:not(.is-open):not(.evia-exchange-open) .evia-anchor.evia-life-look-down .evia-eyes{transform:translate(0,5%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-left .evia-eyes{transform:translate(-8%,14%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-right .evia-eyes{transform:translate(8%,14%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-up .evia-eyes{transform:translate(0,8%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-down .evia-eyes{transform:translate(0,18%)!important}
.selfobs .evia-anchor.evia-life-blink .evia-eye{scale:1 .1!important}
.selfobs .evia-anchor.evia-life-happy .evia-eye{scale:1 .55!important;translate:0 17%!important;border-bottom-color:transparent!important;border-radius:50% 50% 34% 34%!important}
.selfobs .evia-anchor.evia-life-hop .evia-float{animation:evia-life-hop-v113 .8s cubic-bezier(.22,1,.36,1) both!important}
.selfobs .evia-anchor.evia-life-pop .evia-float{animation:evia-life-pop-v113 .86s cubic-bezier(.22,1,.36,1) both!important}.selfobs .evia-anchor.evia-life-pop .evia-halo{filter:drop-shadow(0 0 13px rgba(239,195,61,.43))!important;opacity:1!important}
.selfobs .evia-anchor.evia-life-dim .evia-face{filter:brightness(.9) saturate(.88)!important}.selfobs .evia-anchor.evia-life-dim .evia-halo{opacity:.42!important}
.selfobs .evia-anchor.evia-life-roll-left .evia-face{rotate:-3.4deg!important}.selfobs .evia-anchor.evia-life-roll-right .evia-face{rotate:3.4deg!important}
.selfobs .evia-anchor.evia-life-attention .evia-float,.selfobs .evia-anchor.evia-life-wake .evia-float{animation:evia-life-wake-v113 .72s cubic-bezier(.22,1,.36,1) both!important}.selfobs .evia-anchor.evia-life-wake .evia-halo{filter:drop-shadow(0 0 15px rgba(239,195,61,.46))!important}
.selfobs .evia-anchor.evia-life-sleeping .evia-float{animation:evia-life-sleepfloat-v113 8s ease-in-out infinite!important}.selfobs .evia-anchor.evia-life-sleeping .evia-eye{scale:1 .08!important;translate:0 8%!important;opacity:.78!important}.selfobs .evia-anchor.evia-life-sleeping .evia-face{rotate:1.2deg!important;filter:brightness(.93) saturate(.9)!important}.selfobs .evia-anchor.evia-life-sleeping .evia-halo{animation:evia-life-sleepglow-v113 6.8s ease-in-out infinite!important;filter:drop-shadow(0 0 4px rgba(239,195,61,.1))!important}.selfobs .evia-anchor.evia-life-sleeping .evia-face::before{animation-duration:18s!important;opacity:.18!important}
@keyframes evia-life-float-v113{0%,100%{translate:0 0}45%{translate:0 -2.5px}58%{translate:0 -3px}}
@keyframes evia-life-breathe-v113{0%,100%{opacity:.58;scale:.985}50%{opacity:.9;scale:1.03}}
@keyframes evia-life-rollglow-v113{to{rotate:360deg}}
@keyframes evia-life-hop-v113{0%,100%{translate:0 0;scale:1}38%{translate:0 -5px;scale:1.012}62%{translate:0 1px;scale:.998}}
@keyframes evia-life-pop-v113{0%,100%{scale:1}38%{scale:1.035}68%{scale:.993}}
@keyframes evia-life-wake-v113{0%,100%{scale:1;translate:0 0}32%{scale:1.045;translate:0 -4px}66%{scale:.995;translate:0 1px}}
@keyframes evia-life-sleepfloat-v113{0%,100%{translate:0 1px}50%{translate:0 -1px}}
@keyframes evia-life-sleepglow-v113{0%,100%{opacity:.3;scale:.985}50%{opacity:.48;scale:1.012}}
@media(prefers-reduced-motion:reduce){.selfobs .evia-anchor .evia-float,.selfobs .evia-anchor .evia-halo,.selfobs .evia-anchor .evia-face::before{animation:none!important}.selfobs .evia-anchor .evia-eyes,.selfobs .evia-anchor .evia-eye,.selfobs .evia-anchor .evia-face{transition:none!important}}
`;document.head.appendChild(s)
}
function clearClass(prefix){const a=anchor();if(!a)return;[...a.classList].filter(c=>c.startsWith(prefix)).forEach(c=>a.classList.remove(c))}
function visible(){const a=anchor(),root=app();return !!(a&&root&&!document.hidden&&!document.querySelector(".evia-qrx-layer,.evia-profile-v113")&&!root.classList.contains("evia-exchange-open"))}
function later(fn,min,max){return setTimeout(fn,Math.round(min+Math.random()*(max-min)))}
function doBlink(doubleBlink=Math.random()<.14){if(sleeping||reduced()||!visible()){scheduleBlink();return}const a=anchor();if(!a)return scheduleBlink();a.classList.add("evia-life-blink");setTimeout(()=>{a.classList.remove("evia-life-blink");if(doubleBlink)setTimeout(()=>{if(sleeping||!visible())return;a.classList.add("evia-life-blink");setTimeout(()=>a.classList.remove("evia-life-blink"),100)},150)},105);scheduleBlink()}
function scheduleBlink(){clearTimeout(blinkTimer);blinkTimer=later(doBlink,3000,6800)}
function doLook(){if(sleeping||reduced()||!visible()){scheduleLook();return}const a=anchor();if(!a)return scheduleLook();clearClass("evia-life-look-");const roll=Math.random();let state="";if(roll<.25)state="left";else if(roll<.5)state="right";else if(roll<.69)state="up";else if(roll<.75)state="down";if(state){a.classList.add(`evia-life-look-${state}`);setTimeout(()=>a.classList.remove(`evia-life-look-${state}`),Math.round(520+Math.random()*520))}scheduleLook()}
function scheduleLook(){clearTimeout(lookTimer);lookTimer=later(doLook,3400,7000)}
function clearGesture(a=anchor()){if(!a)return;["evia-life-hop","evia-life-pop","evia-life-dim","evia-life-roll-left","evia-life-roll-right"].forEach(c=>a.classList.remove(c))}
function doGesture(){if(sleeping||reduced()||!visible()){scheduleGesture();return}const a=anchor();if(!a)return scheduleGesture();clearGesture(a);const r=Math.random();let cls="",duration=900;if(r<.29){cls="evia-life-pop";duration=900}else if(r<.53){cls="evia-life-hop";duration=850}else if(r<.72){cls=Math.random()<.5?"evia-life-roll-left":"evia-life-roll-right";duration=1350}else{cls="evia-life-dim";duration=1450}a.classList.add(cls);setTimeout(()=>a.classList.remove(cls),duration);scheduleGesture()}
function scheduleGesture(){clearTimeout(gestureTimer);gestureTimer=later(doGesture,7200,12500)}
function enterSleep(){if(Date.now()-lastInteraction<SLEEP_MS){armSleep();return}const a=anchor();if(!a||document.hidden){armSleep();return}sleeping=true;clearClass("evia-life-look-");clearGesture(a);a.classList.remove("evia-life-blink","evia-life-happy","evia-life-attention","evia-life-wake");a.classList.add("evia-life-sleeping")}
function armSleep(){clearTimeout(sleepTimer);const remaining=Math.max(0,SLEEP_MS-(Date.now()-lastInteraction));sleepTimer=setTimeout(enterSleep,remaining||SLEEP_MS)}
function wake(animate=true){lastInteraction=Date.now();const a=anchor();if(sleeping&&a){sleeping=false;a.classList.remove("evia-life-sleeping");if(animate&&!reduced()){a.classList.remove("evia-life-wake");void a.offsetWidth;a.classList.add("evia-life-wake");setTimeout(()=>a.classList.remove("evia-life-wake"),760)}}armSleep();scheduleBlink();scheduleLook();scheduleGesture()}
function react(kind="attention"){wake(false);if(reduced())return;const a=anchor();if(!a)return;if(kind==="happy"){clearTimeout(happyTimer);a.classList.remove("evia-life-blink");a.classList.add("evia-life-happy","evia-life-pop");happyTimer=setTimeout(()=>{a.classList.remove("evia-life-happy","evia-life-pop")},1200);return}a.classList.remove("evia-life-attention");void a.offsetWidth;a.classList.add("evia-life-attention");setTimeout(()=>a.classList.remove("evia-life-attention"),760)}
function watchToasts(){const root=document.getElementById("root");if(!root||observer)return;observer=new MutationObserver(records=>{for(const r of records){const target=r.target?.nodeType===1?r.target:r.target?.parentElement;if(!target)continue;const toast=target.matches?.(".app-toast")?target:target.closest?.(".app-toast");if(!toast||!toast.classList.contains("is-visible"))continue;const text=(toast.textContent||"").toLowerCase();if(/evidence saved|job submitted|moved to downloaded|updated|complete/.test(text)){react("happy");break}}});observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]})}
function interaction(e){if(e?.isTrusted===false)return;wake(true)}
function start(){ensureStyle();wake(false);watchToasts()}
window.addEventListener("evia:update-available",()=>react("attention"));window.addEventListener("pageshow",()=>wake(false));window.addEventListener("focus",()=>wake(false));document.addEventListener("pointerdown",interaction,{passive:true,capture:true});document.addEventListener("touchstart",interaction,{passive:true,capture:true});document.addEventListener("keydown",interaction,{capture:true});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")wake(false);else clearTimeout(sleepTimer)});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.EviaAvatarLife=Object.freeze({version:VERSION,react,wake,sleep:enterSleep});
})();
