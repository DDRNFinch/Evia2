(()=>{
"use strict";
const RPL_KEY="evia-rpl-ksbs-v1";
function refresh(){window.EviaEvidenceStateV105?.refresh?.()}
window.addEventListener("load",refresh);window.addEventListener("pageshow",refresh);window.addEventListener("storage",e=>{if(e.key===RPL_KEY)refresh()});
document.addEventListener("click",()=>setTimeout(refresh,0),true);setTimeout(refresh,250);
})();