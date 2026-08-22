(()=>{
"use strict";
const VERSION=103;
const DIRECT_SELECTOR=".selfobs .self-side b,.selfobs .group>strong em,.selfobs .self-ksbs button>span:not(.evia-rpl-o),.evia-acb-evidence";
const MIXED_SELECTOR=".evia-nvq-theme>em,.evia-nvq-ac-grid span>i";
let queued=false;
function evidenceCount(text){
  const t=String(text||"").trim();if(!t)return 0;
  if(/^o+$/i.test(t))return t.length;
  const m=t.match(/^o\s*[x×]\s*(\d+)$/i);if(m)return Math.max(1,Number(m[1])||1);
  let n=0;for(const ch of t){if(ch===":")n+=2;else if(ch===".")n+=1}return n
}
function label(n){return `${n} evidence item${n===1?"":"s"} recorded`}
function decorate(el,n){
  if(!el||!n)return;
  el.classList.add("evia-evidence-check");
  if(el.textContent!=="✓")el.textContent="✓";
  el.setAttribute("title","Evidence recorded");
  el.setAttribute("aria-label",label(n));
  el.setAttribute("role","img")
}
function badge(n){const s=document.createElement("span");s.className="evia-evidence-check";s.textContent="✓";s.title="Evidence recorded";s.setAttribute("aria-label",label(n));s.setAttribute("role","img");return s}
function patchDirect(root=document){
  const nodes=[];if(root.nodeType===1&&root.matches?.(DIRECT_SELECTOR))nodes.push(root);root.querySelectorAll?.(DIRECT_SELECTOR).forEach(x=>nodes.push(x));
  nodes.forEach(el=>{if(el.classList.contains("evia-rpl-o")||el.classList.contains("evia-milos-arch-marker"))return;const n=evidenceCount(el.textContent);if(n)decorate(el,n)})
}
function patchMixed(root=document){
  const nodes=[];if(root.nodeType===1&&root.matches?.(MIXED_SELECTOR))nodes.push(root);root.querySelectorAll?.(MIXED_SELECTOR).forEach(x=>nodes.push(x));
  nodes.forEach(parent=>{[...parent.childNodes].forEach(node=>{if(node.nodeType!==3)return;const n=evidenceCount(node.textContent);if(n)node.replaceWith(badge(n))})})
}
function patchCopy(root=document){
  const nodes=[];if(root.nodeType===1&&root.matches?.(".self-copy,.evia-nvq-note"))nodes.push(root);root.querySelectorAll?.(".self-copy,.evia-nvq-note").forEach(x=>nodes.push(x));
  nodes.forEach(el=>{const t=el.textContent||"";let next=t.replace("Yellow marks only show how many times you have evidenced each KSB.","A yellow tick shows that you have evidence against that KSB.").replace("Yellow marks show evidence frequency.","Yellow ticks show portfolio evidence.").replace("Yellow o = evidence.","Yellow tick = evidence.");if(next!==t)el.textContent=next})
}
function patch(root=document){queued=false;patchDirect(root);patchMixed(root);patchCopy(root)}
function queue(root=document){if(queued)return;queued=true;requestAnimationFrame(()=>patch(root?.isConnected?root:document))}
function relevant(node){return node?.nodeType===1&&(node.matches?.(`${DIRECT_SELECTOR},${MIXED_SELECTOR},.self-copy,.evia-nvq-note`)||node.querySelector?.(`${DIRECT_SELECTOR},${MIXED_SELECTOR},.self-copy,.evia-nvq-note`))}
function start(){
  patch(document);const root=document.getElementById("root")||document.body;
  if(root&&!root.__eviaEvidenceTicksV103){root.__eviaEvidenceTicksV103=true;new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(relevant(n)){queue(n);return}}if(r.type==="characterData"){queue(r.target.parentElement||document);return}}}).observe(root,{subtree:true,childList:true,characterData:true})}
}
const style=document.createElement("style");style.id="evia-evidence-ticks-v103-style";style.textContent=`.evia-evidence-check{display:inline-grid!important;place-items:center!important;width:.92rem!important;height:.92rem!important;min-width:.92rem!important;min-height:.92rem!important;border:0!important;border-radius:50%!important;background:#efc33d!important;color:#4c3b0b!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-size:.62rem!important;font-style:normal!important;font-weight:850!important;line-height:1!important;letter-spacing:0!important;vertical-align:middle!important;box-shadow:none!important}.selfobs .self-side b.evia-evidence-check,.selfobs .group em.evia-evidence-check,.selfobs .self-ksbs button span.evia-evidence-check{display:inline-grid!important;width:.92rem!important;height:.92rem!important;min-width:.92rem!important;min-height:.92rem!important;color:#4c3b0b!important;font-size:.62rem!important;letter-spacing:0!important;white-space:nowrap!important;margin:.12rem 0 0!important}.selfobs .self-side b.evia-evidence-check{margin:0!important}.selfobs .group em.evia-evidence-check{margin-left:.28rem!important;vertical-align:middle!important}.evia-acb-status .evia-evidence-check,.evia-nvq-ac-grid .evia-evidence-check,.evia-nvq-theme .evia-evidence-check{margin:0!important;flex:none!important}`;document.head.appendChild(style);
window.addEventListener("load",start);window.addEventListener("pageshow",()=>patch(document));document.addEventListener("click",()=>queue(document),true);if(document.readyState!=="loading")start();else document.addEventListener("DOMContentLoaded",start,{once:true});
window.EviaEvidenceTicks=Object.freeze({version:VERSION,refresh:()=>patch(document)});
})();
