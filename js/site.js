import {getPublicData,safeUrl,escapeHtml as esc,escapeAttr as att} from './data-service.js';
const $=q=>document.querySelector(q);
const $$=q=>Array.from(document.querySelectorAll(q));
const modal=$('#project-dialog');
let allProjects=[];let activeFilter='All';
let toastTimer;
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3600)}
function image(src,alt='',lazy=true){const valid=safeUrl(src);return valid?`<img src="${att(valid)}" alt="${att(alt)}" loading="${lazy?'lazy':'eager'}" decoding="async">`:`<div class="empty-note">Visual coming soon</div>`}
function isUsable(p){return p.status==='published'&&!!safeUrl(p.cover)}
function displayTitle(p){return esc(p.title||'Untitled work')}
function featuredCard(p,i){
 return `<article class="project-card featured" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}">
 <div class="card-visual">${image(p.cover,p.title+' project image',i>1)}<span class="card-index">${String(i+1).padStart(2,'0')} / ${esc((p.category||'DESIGN').toUpperCase())}</span><span class="card-icon" aria-hidden="true">↗</span></div>
 <div class="project-card-titleline"><div><h3>${displayTitle(p)}</h3><p>${esc(p.role||p.eyebrow||p.category)}</p></div><span class="project-card-numeral">✳</span></div></article>`;
}
function miniCard(p,i){return `<article class="project-card mini" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}"><div class="card-visual">${image(p.cover,p.title+' project image')}<span class="card-index">${esc((p.category||'WORK').toUpperCase())}</span><span class="card-icon" aria-hidden="true">↗</span></div><div class="project-card-titleline"><div><h3>${displayTitle(p)}</h3><p>${esc((p.tags||[]).slice(0,3).join(' / '))}</p></div></div></article>`}
function renderWork(){
 const publish=allProjects.filter(isUsable);
 const featured=publish.filter(p=>p.featured).sort((a,b)=>(a.feature_rank||999)-(b.feature_rank||999));
 let filtered=activeFilter==='All'?featured:publish.filter(p=>{
    if(activeFilter==='3D & campaigns')return p.category==='3D & campaigns'||p.category==='Experiments';
    return p.category===activeFilter;
 });
 if(activeFilter!=='All')filtered.sort((a,b)=>(a.feature_rank||999)-(b.feature_rank||999));
 $('#featured-grid').innerHTML=filtered.length?filtered.map(featuredCard).join(''):`<p class="loading-note">No published pieces in this collection yet. Explore another discipline.</p>`;
 const others=publish.filter(p=>!p.featured&&p.category!=='Motion'&&p.category!=='Experiments').slice(0,8);
 $('#more-grid').innerHTML=activeFilter==='All'?others.map(miniCard).join(''):'';
 $('.more-work-head').style.display=activeFilter==='All'?'flex':'none';
 $('#all-count').textContent=String(featured.length).padStart(2,'0');
 $$('.filter-btn').forEach(b=>{const active=b.dataset.filter===activeFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false')});
}
function renderDigital(){
 const list=allProjects.filter(p=>p.status==='published'&&p.category==='Web & products');
 $('#digital-grid').innerHTML=list.map((p,i)=>`<article class="digital-card digital-card-${i+1}"><div class="digital-visual">${image(p.cover,p.title+' brand presentation')}<div class="digital-number">0${i+1} / DIGITAL EXPERIENCE</div></div><div class="digital-info"><span class="digital-type">${esc(p.client_type||'DIGITAL BUILD')}</span><h3>${displayTitle(p)}</h3><p>${esc(p.summary||'')}</p><div class="digital-tags">${(p.tags||[]).slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="digital-actions"><button type="button" data-open="${att(p.id)}" class="digital-case">Explore the build ↗</button>${safeUrl(p.site_url)?`<a href="${att(safeUrl(p.site_url))}" target="_blank" rel="noopener noreferrer">View website ↗</a>`:''}</div></div></article>`).join('');
}
function motionCard(p){
 const m=(p.media||[]).find(x=>x.type==='video'||x.type==='model');
 const model=p.model||(m&&m.type==='model'?m.src:'');
 let visual='';
 if(model&&safeUrl(model))visual=`<model-viewer src="${att(safeUrl(model))}" alt="Interactive model for ${att(p.title)}" camera-controls auto-rotate shadow-intensity="1" interaction-prompt="auto" exposure="1"></model-viewer>`;
 else if(m&&m.type==='video'&&safeUrl(m.src))visual=`<video muted loop playsinline preload="none" poster="${att(safeUrl(p.cover))}"><source src="${att(safeUrl(m.src))}" type="video/mp4"></video>`;
 else visual=image(p.cover,p.title);
 return `<article class="motion-card" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}"><div class="motion-visual">${visual}<span class="motion-play">${model?'✳ DRAG TO ROTATE':'▶ WATCH / EXPLORE'}</span></div><div class="motion-meta"><div><p>${esc(p.eyebrow||p.category)}</p><h3>${displayTitle(p)}</h3></div><span aria-hidden="true" class="motion-visit">↗</span></div></article>`
}
function renderMotion(){const list=allProjects.filter(p=>isUsable(p)&&(p.category==='Motion'||p.category==='Experiments'));$('#motion-grid').innerHTML=list.length?list.map(motionCard).join(''):'<p>More motion and 3D experiments coming soon.</p>';$$('.motion-card video').forEach(v=>{v.addEventListener('mouseenter',()=>v.play().catch(()=>{}));v.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0})})}
function mediaBlock(m){
 const src=safeUrl(m.src);if(!src)return '';
 if(m.type==='pdf')return `<div class="pdf-holder"><iframe class="pdf-frame" src="${att(src)}#view=FitH" title="${att(m.caption||'Project PDF')}"></iframe><a class="pdf-link" href="${att(src)}" target="_blank" rel="noopener noreferrer">Open PDF in a new tab ↗</a></div>`;
 if(m.type==='video')return `<video controls playsinline preload="metadata" src="${att(src)}"></video>`;
 if(m.type==='model')return `<model-viewer style="height:490px" src="${att(src)}" camera-controls auto-rotate shadow-intensity="1" alt="3D object: ${att(m.caption||'handcrafted sculpture')}"></model-viewer>`;
 return image(src,m.caption||'Project gallery image');
}
function openProject(id){
 const p=allProjects.find(p=>p.id===id&&p.status==='published');if(!p)return;
 const assets=(p.media||[]).filter(m=>safeUrl(m.src));
 const content=`<p class="case-kicker">${esc(p.client_type||p.category)} · ${esc(p.eyebrow||'THE M PRNT')}</p><h2 class="case-title" id="dialog-title">${displayTitle(p)}</h2>
 ${safeUrl(p.model)?`<model-viewer class="case-hero-model" src="${att(safeUrl(p.model))}" camera-controls auto-rotate shadow-intensity="1" alt="Interactive 3D model"></model-viewer>`:(safeUrl(p.cover)?`<div style="max-height:490px;overflow:hidden;border-radius:11px;background:#211625">${image(p.cover,p.title+' cover',false)}</div>`:'')}
 <div class="case-desc"><p>${esc(p.summary||'An exploration in art direction and making.')}</p><div class="case-facts"><span>Discipline</span><strong>${esc(p.category)}</strong><span>Role</span><strong>${esc(p.role||'Concept · Design · Production')}</strong><span>Type</span><strong>${esc(p.client_type||'Creative work')}</strong></div></div>
 ${p.approach?`<div class="case-block"><h3>The thinking behind it.</h3><p>${esc(p.approach)}</p></div>`:''}
 ${p.outcome?`<div class="case-block"><h3>The outcome.</h3><p>${esc(p.outcome)}</p></div>`:''}
 <div class="case-media">${assets.length?assets.map(mediaBlock).join(''):'<p class="empty-note">More process images and media coming soon.</p>'}</div>
 ${safeUrl(p.site_url)?`<p style="margin-top:25px"><a class="pdf-link" href="${att(safeUrl(p.site_url))}" target="_blank" rel="noopener noreferrer">Visit the live site ↗</a></p>`:''}<div class="case-tags">${(p.tags||[]).map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`;
 $('#dialog-body').innerHTML=content;
 if(!modal.open){modal.showModal();document.body.classList.add('dialog-open')}
 const url=new URL(window.location.href);url.searchParams.set('project',id);window.history.replaceState(null,'',url);
}
function closeProject(){if(modal.open)modal.close();document.body.classList.remove('dialog-open');$('#dialog-body').innerHTML='';const url=new URL(window.location.href);url.searchParams.delete('project');history.replaceState(null,'',url)}
function configureInteractions(){
 $('#dialog-close').addEventListener('click',closeProject);
 modal.addEventListener('click',e=>{if(e.target===modal)closeProject()});modal.addEventListener('close',()=>{document.body.classList.remove('dialog-open');$('#dialog-body').innerHTML='';const url=new URL(location.href);if(url.searchParams.has('project')){url.searchParams.delete('project');history.replaceState(null,'',url)}});
 document.addEventListener('click',e=>{const card=e.target.closest('[data-open]');if(card){openProject(card.dataset.open)}});
 document.addEventListener('keydown',e=>{const card=e.target.closest('[data-open]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProject(card.dataset.open)}});
 $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;renderWork()}));
 $$('.skill-tile').forEach(tile=>tile.addEventListener('click',()=>{const cat=tile.dataset.filter;if(cat==='Brand worlds'||cat==='Campaigns'||cat==='Strategy'){activeFilter=cat;renderWork()}}));
 const toggle=$('#menu-toggle'),nav=$('#mobile-nav');toggle.addEventListener('click',()=>{const willOpen=nav.hidden;nav.hidden=!willOpen;toggle.setAttribute('aria-expanded',String(willOpen))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false')}));
}
function launchMotion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced)return;
 const area=$('.hero');const tiles=$$('.skill-tile');const state=tiles.map(el=>({el,x:0,y:0,tx:0,ty:0}));
 let visible=true;
 const media=matchMedia('(max-width: 850px)');
 area.addEventListener('pointermove',e=>{
  document.documentElement.style.setProperty('--mouse-x',e.clientX+'px');document.documentElement.style.setProperty('--mouse-y',e.clientY+'px');
  if(media.matches)return;
  const b=area.getBoundingClientRect();const nx=(e.clientX-b.left)/b.width-.5;const ny=(e.clientY-b.top)/b.height-.5;
  state.forEach(s=>{const depth=+s.el.style.getPropertyValue('--depth')||1;s.tx=nx*50*depth;s.ty=ny*42*depth});
 });
 area.addEventListener('pointerleave',()=>{state.forEach(s=>{s.tx=0;s.ty=0})});
 function frame(){if(!media.matches){state.forEach(s=>{s.x+=(s.tx-s.x)*.065;s.y+=(s.ty-s.y)*.065;s.el.style.setProperty('--parallax-x',s.x.toFixed(2)+'px');s.el.style.setProperty('--parallax-y',s.y.toFixed(2)+'px')})}requestAnimationFrame(frame)}requestAnimationFrame(frame);
 function scrollEffect(){const rect=area.getBoundingClientRect();const progress=Math.max(0,Math.min(1,-rect.top/(area.offsetHeight*.8)));const wave=Math.sin(progress*Math.PI);const offsets=[[-20,-22,-8],[-8,21,5],[13,-18,9],[24,15,-8],[31,-22,7]];$('#move-word').style.setProperty('--move-translate',(-progress*8)+'px');$('#move-word').style.setProperty('--move-rotate',(progress*1.2)+'deg');$$('.move-letter').forEach((letter,i)=>{const [x,y,r]=offsets[i];letter.style.transform=`translate3d(${(x*wave).toFixed(2)}px,${(y*wave).toFixed(2)}px,0) rotate(${(r*wave).toFixed(2)}deg)`})};addEventListener('scroll',scrollEffect,{passive:true});scrollEffect();
}
async function init(){configureInteractions();launchMotion();try{const data=await getPublicData();allProjects=data.projects||[];const s=data.settings||{};if(s.subtitle)$('#hero-subtitle').textContent=s.subtitle;if(s.about)$('#about-copy').textContent=s.about;if(s.aboutExtra)$('#about-extra').textContent=s.aboutExtra;if(s.email){$('#email-link').textContent=s.email+' ↗';$('#email-link').href='mailto:'+encodeURIComponent(s.email)}if(s.instagram&&safeUrl(s.instagram))$('#instagram-link').href=s.instagram;if(s.linkedin&&safeUrl(s.linkedin))$('#linkedin-link').href=s.linkedin;renderWork();renderDigital();renderMotion();const deep=new URLSearchParams(location.search).get('project');if(deep)openProject(deep);if(data.source==='offline-fallback')console.warn('CMS unavailable. Serving bundled snapshot.')}catch(error){console.error(error);$('#featured-grid').innerHTML='<p class="loading-note">The portfolio could not be loaded. Try refreshing the page.</p>';toast('Portfolio content could not load.')}}
init();
