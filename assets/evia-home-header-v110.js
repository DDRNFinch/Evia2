(()=>{
"use strict";
const VERSION=110,STYLE_ID="evia-home-header-v110-style";
let observer=null,queued=false;
function styles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
/* v110: evidence no longer owns the home top-right. Restore the original target bullseye there. */
.selfobs .self-evidence{display:none!important}
.selfobs .evia-target-mini{display:flex!important;top:max(.75rem,env(safe-area-inset-top))!important;right:1rem!important;width:2.8rem!important;min-width:2.8rem!important;height:2.35rem!important;justify-content:center!important;gap:0!important;background:transparent!important;border:0!important;padding:.15rem .2rem!important;overflow:visible!important;box-shadow:none!important}
.selfobs .evia-target-mini .evia-target-symbol{display:grid!important;place-items:center!important;width:2rem!important;height:2rem!important;flex:0 0 2rem!important;color:#efc33d!important}
.selfobs .evia-target-mini .evia-target-symbol svg{display:block!important;width:100%!important;height:100%!important;fill:none!important;stroke:currentColor!important;stroke-width:2.15!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.selfobs .evia-target-mini .evia-target-symbol svg path{display:none!important}
.selfobs .evia-target-mini .evia-target-count{position:absolute!important;top:-.2rem!important;right:-.2rem!important;display:grid!important;place-items:center!important;min-width:1.12rem!important;height:1.12rem!important;padding:0 .2rem!important;border:2px solid #fff!important;border-radius:999px!important;background:#ff3b30!important;color:#fff!important;font-size:.52rem!important;font-weight:750!important;line-height:1!important;text-align:center!important;box-shadow:0 1px 3px rgba(80,20,15,.2)!important}
.selfobs .self-top small.evia-course-identity-v110{display:grid!important;gap:.08rem!important;margin-top:.08rem!important;line-height:1.05!important;color:#888!important;white-space:normal!important}
.selfobs .self-top small.evia-course-identity-v110 span{display:block!important;font-weight:450!important;letter-spacing:0!important}
.selfobs .self-top small.evia-course-identity-v110 .evia-course-name-v110{font-size:.55rem!important;color:#777!important}
.selfobs .self-top small.evia-course-identity-v110 .evia-course-code-v110{font-size:.49rem!important;color:#9a989d!important;text-transform:uppercase!important}
@media(max-width:360px){.selfobs .evia-target-mini{right:.75rem!important;width:2.65rem!important;min-width:2.65rem!important}.selfobs .evia-target-mini .evia-target-symbol{width:1.85rem!important;height:1.85rem!important;flex-basis:1.85rem!important}.selfobs .evia-target-mini .evia-target-count{top:-.16rem!important;right:-.16rem!important;font-size:.5rem!important}}
`;document.head.appendChild(s)}
function identity(){const c=window.EviaCourseContext?.current?.()||{},id=String(c.courseId||""),pathway=String(c.pathway||"").toLowerCase(),title=String(c.courseTitle||"");let name="",code="";
if(/st0095/i.test(id)||/st0095/i.test(title)){name="Bricklayer";code="ST0095"}
else if(/6570-05/i.test(id)||/6570-05/i.test(title)){name="Trowel";code="6570-05"}
else if(/st0264/i.test(id)||/st0264/i.test(title)){name=pathway.includes("joiner")?"Joinery":"Carpentry";code="ST0264"}
else{const m=title.match(/\b(ST\d+|\d{4}-\d{2})\b/i)||id.match(/\b(ST\d+|\d{4}-\d{2})\b/i);code=(m?.[1]||"").toUpperCase();name=(String(c.pathwayTitle||"").trim()||title.split(/[—·]/)[0].trim()||"Course").replace(/\s+(Level\s*\d+).*$/i,"").trim()}
return{name,code}}
function patchCourse(){const small=document.querySelector(".evia-app.selfobs .self-top small");if(!small)return;const x=identity();if(!x.name&&!x.code)return;const key=`${x.name}|${x.code}`;if(small.dataset.eviaCourseIdentity===key)return;small.dataset.eviaCourseIdentity=key;small.classList.add("evia-course-identity-v110");small.innerHTML=`<span class="evia-course-name-v110"></span><span class="evia-course-code-v110"></span>`;small.querySelector(".evia-course-name-v110").textContent=x.name;small.querySelector(".evia-course-code-v110").textContent=x.code}
function patch(){queued=false;styles();patchCourse();const old=document.querySelector(".evia-app.selfobs .self-evidence");if(old)old.setAttribute("aria-hidden","true");const target=document.querySelector(".evia-app.selfobs .evia-target-mini");if(target){target.removeAttribute("aria-hidden");target.title="Targets"}}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
function start(){styles();queue();const root=document.getElementById("root")||document.body;if(!observer){observer=new MutationObserver(queue);observer.observe(root,{subtree:true,childList:true})}setInterval(queue,2500)}
window.EviaHomeHeader=Object.freeze({version:VERSION,refresh:queue});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.addEventListener("pageshow",queue);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")queue()});
})();
