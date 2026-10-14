// V2.10: muted-by-default video UI. Explicit consent is needed for audible playback.
export function videoUI(src,poster='',{autoplay=false,loop=false,extraClass=''}={}){
 const attr=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\"':'&quot;'}[c]));
 if(!/^https:\/\//i.test(src||'')&&!/^\/(?!\/)/.test(src||''))return '';
 const posterAttr=poster?` poster="${attr(poster)}"`:'';
 return `<div class="studio-video ${attr(extraClass)}"><video muted playsinline preload="metadata" ${autoplay?'autoplay':''} ${loop?'loop':''}${posterAttr} src="${attr(src)}" controls controlslist="nodownload"></video><button type="button" class="studio-audio-toggle" aria-pressed="false" aria-label="Enable video sound">Enable sound</button></div>`;
}
export function wireVideos(root=document){
 root.querySelectorAll('.studio-video').forEach(wrapper=>{
  if(wrapper.dataset.videoReady)return; wrapper.dataset.videoReady='1';
  const v=wrapper.querySelector('video'),btn=wrapper.querySelector('.studio-audio-toggle');
  if(!v||!btn)return;v.muted=true;
  btn.addEventListener('click',event=>{
   event.preventDefault();event.stopPropagation();
   v.muted=!v.muted;btn.textContent=v.muted?'Enable sound':'Mute sound';
   btn.setAttribute('aria-pressed',String(!v.muted));
   btn.setAttribute('aria-label',v.muted?'Enable video sound':'Mute video sound');
   if(v.paused)v.play().catch(()=>{});
  });
  v.addEventListener('play',()=>document.querySelectorAll('.studio-video video').forEach(other=>{if(other!==v){other.pause();other.muted=true;const b=other.closest('.studio-video')?.querySelector('.studio-audio-toggle');if(b){b.textContent='Enable sound';b.setAttribute('aria-pressed','false');}}}));
  v.addEventListener('volumechange',()=>{btn.textContent=v.muted?'Enable sound':'Mute sound';btn.setAttribute('aria-pressed',String(!v.muted))});
  if(!v.hasAttribute('autoplay'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause();return}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting){v.pause();v.muted=true;btn.textContent='Enable sound';btn.setAttribute('aria-pressed','false');}else if(v.autoplay)v.play().catch(()=>{});}}, {threshold:.2});observer.observe(wrapper);
  wrapper._studioVideoObserver=observer;
 });
}
export function stopVideos(root){if(!root)return;root.querySelectorAll('video').forEach(v=>{v.pause();v.muted=true});root.querySelectorAll('.studio-video').forEach(w=>{w._studioVideoObserver?.disconnect();w._studioVideoObserver=null});}
