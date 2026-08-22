(()=>{
"use strict";
const VERSION=108,STYLE_ID="evia-avatar-life-v108-style";
let blinkTimer=null,lookTimer=null,tiltTimer=null,happyTimer=null,observer=null;
const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const anchor=()=>document.querySelector(".evia-app.selfobs .evia-anchor[data-evia]");
const app=()=>document.querySelector(".evia-app.selfobs");
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs:not(.is-open):not(.evia-exchange-open) .evia-anchor .evia-float{animation:evia-life-float-v108 5.8s cubic-bezier(.45,0,.55,1) infinite}
.selfobs:not(.is-open) .evia-anchor .evia-halo{animation:evia-life-halo-v108 4.7s ease-in-out infinite}
.selfobs .evia-anchor .evia-eyes{transition:transform .48s cubic-bezier(.22,1,.36,1)!important}
.selfobs .evia-anchor .evia-eye{transform-origin:50% 50%;transition:scale .09s ease,translate .28s ease,border-color .2s ease,border-radius .2s ease}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-look-left .evia-eyes{transform:translate(-12%,3%)!important}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-look-right .evia-eyes{transform:translate(12%,3%)!important}
.selfobs:not(.is-open):not(.evia-exchange-open) .evia-anchor.evia-life-look-up .evia-eyes{transform:translate(0,-9%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-left .evia-eyes{transform:translate(-10%,14%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-right .evia-eyes{transform:translate(10%,14%)!important}
.selfobs.is-open:not(.evia-exchange-open) .evia-anchor.evia-life-look-up .evia-eyes{transform:translate(0,7%)!important}
.selfobs .evia-anchor.evia-life-blink .evia-eye{scale:1 .12!important}
.selfobs .evia-anchor.evia-life-happy .evia-eye{scale:1 .56!important;translate:0 17%!important;border-bottom-color:transparent!important;border-radius:50% 50% 34% 34%!important}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-tilt-left .evia-face{rotate:-2.2deg!important}
.selfobs:not(.evia-exchange-open) .evia-anchor.evia-life-tilt-right .evia-face{rotate:2.2deg!important}
.selfobs .evia-anchor.evia-life-attention .evia-float{animation:evia-life-attention-v108 .72s cubic-bezier(.22,1,.36,1) both!important}
@keyframes evia-life-float-v108{0%,100%{translate:0 0}46%{translate:0 -3px}56%{translate:0 -3.5px}}
@keyframes evia-life-halo-v108{0%,100%{opacity:.62;scale:.98}50%{opacity:.92;scale:1.035}}
@keyframes evia-life-attention-v108{0%,100%{scale:1;translate:0 0}35%{scale:1.035;translate:0 -4px}68%{scale:.995;translate:0 1px}}
@media(prefers-reduced-motion:reduce){.selfobs .evia-anchor .evia-float,.selfobs .evia-anchor .evia-halo{animation:none!important}.selfobs .evia-anchor .evia-eyes,.selfobs .evia-anchor .evia-eye{transition:none!important}}
`;document.head.appendChild(s)
}
function clearClass(prefix){const a=anchor();if(!a)return;[...a.classList].filter(c=>c.startsWith(prefix)).forEach(c=>a.classList.remove(c))}
function usable(){const a=anchor(),root=app();return !!(a&&root&&!document.hidden&&!document.querySelector(".evia-qrx-layer")&&!root.classList.contains("evia-exchange-open"))}
function later(fn,min,max){return setTimeout(fn,Math.round(min+Math.random()*(max-min)))}
function doBlink(doubleBlink=Math.random()<.18){
  if(reduced()||!usable()){scheduleBlink();return}
  const a=anchor();if(!a)return scheduleBlink();a.classList.add("evia-life-blink");
  setTimeout(()=>{a.classList.remove("evia-life-blink");if(doubleBlink)setTimeout(()=>{if(!usable())return;a.classList.add("evia-life-blink");setTimeout(()=>a.classList.remove("evia-life-blink"),105)},145)},105);
  scheduleBlink()
}
function scheduleBlink(){clearTimeout(blinkTimer);blinkTimer=later(doBlink,2800,6200)}
function doLook(){
  if(reduced()||!usable()){scheduleLook();return}
  const a=anchor();if(!a)return scheduleLook();clearClass("evia-life-look-");
  const states=["left","right","left","right","up"],state=states[Math.floor(Math.random()*states.length)];a.classList.add(`evia-life-look-${state}`);
  setTimeout(()=>a.classList.remove(`evia-life-look-${state}`),Math.round(650+Math.random()*650));scheduleLook()
}
function scheduleLook(){clearTimeout(lookTimer);lookTimer=later(doLook,3200,6500)}
function doTilt(){
  if(reduced()||!usable()){scheduleTilt();return}
  const a=anchor();if(!a)return scheduleTilt();clearClass("evia-life-tilt-");const state=Math.random()<.5?"left":"right";a.classList.add(`evia-life-tilt-${state}`);setTimeout(()=>a.classList.remove(`evia-life-tilt-${state}`),900);scheduleTilt()
}
function scheduleTilt(){clearTimeout(tiltTimer);tiltTimer=later(doTilt,7600,12800)}
function react(kind="attention"){
  if(reduced())return;const a=anchor();if(!a)return;
  if(kind==="happy"){clearTimeout(happyTimer);a.classList.remove("evia-life-blink");a.classList.add("evia-life-happy");happyTimer=setTimeout(()=>a.classList.remove("evia-life-happy"),1250);return}
  a.classList.remove("evia-life-attention");void a.offsetWidth;a.classList.add("evia-life-attention");setTimeout(()=>a.classList.remove("evia-life-attention"),760)
}
function watchToasts(){
  const root=document.getElementById("root");if(!root||observer)return;
  observer=new MutationObserver(records=>{for(const r of records){const target=r.target?.nodeType===1?r.target:r.target?.parentElement;if(!target)continue;const toast=target.matches?.(".app-toast")?target:target.closest?.(".app-toast");if(!toast||!toast.classList.contains("is-visible"))continue;const text=(toast.textContent||"").toLowerCase();if(/evidence saved|job submitted|moved to downloaded|updated|complete/.test(text)){react("happy");break}}});
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]})
}
function start(){ensureStyle();scheduleBlink();scheduleLook();scheduleTilt();watchToasts()}
window.addEventListener("evia:update-available",()=>react("attention"));
window.addEventListener("pageshow",()=>{scheduleBlink();scheduleLook();scheduleTilt()});
document.addEventListener("pointerdown",e=>{if(e.target.closest?.(".evia-anchor[data-evia]"))react("attention")},{passive:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaAvatarLife=Object.freeze({version:VERSION,react});
})();
