import {disciplineFor,locationFor,has3D} from './project-taxonomy.js';
import {getPublicData,safeUrl,escapeHtml as esc,escapeAttr as att} from './data-service.js';
const $=q=>document.querySelector(q);
const $$=q=>Array.from(document.querySelectorAll(q));
const modal=$('#project-dialog');
let allProjects=[];let activeFilter='All';
let galleryOrderV25={},galleryModesV25={};
const GALLERY_DEFAULT_MODES={featured:'compact',archive:'compact',digital:'editorial',concept:'compact',visual:'compact',motion:'editorial',three:'editorial'};
function ordered(section,list){
 const seq=Array.isArray(galleryOrderV25[section])?galleryOrderV25[section]:[];
 if(!seq.length)return list;
 const rank=new Map(seq.map((id,index)=>[id,index]));
 return list.map((p,index)=>({p,index})).sort((a,b)=>{
  const ia=rank.has(a.p.id)?rank.get(a.p.id):Number.MAX_SAFE_INTEGER;
  const ib=rank.has(b.p.id)?rank.get(b.p.id):Number.MAX_SAFE_INTEGER;
  return ia-ib||a.index-b.index;
 }).map(x=>x.p);
}
function setGalleryPresentation(section,id){
 const target=document.getElementById(id);if(!target)return;
 const mode=['compact','editorial','carousel'].includes(galleryModesV25[section])?galleryModesV25[section]:GALLERY_DEFAULT_MODES[section];
 target.classList.remove('gallery-layout-compact','gallery-layout-editorial','gallery-layout-carousel');
 target.classList.add('gallery-layout-'+mode);
 const navId='gallery-navigation-'+section;let nav=document.getElementById(navId);
 if(mode!=='carousel'||!target.children.length||target.querySelector('.collection-empty,.loading-note')){if(nav)nav.remove();return}
 if(!nav){
  nav=document.createElement('div');nav.id=navId;nav.className='gallery-navigation';
  const label=document.createElement('span');label.textContent='SWIPE TO EXPLORE';
  const actions=document.createElement('div');
  for(const [direction,txt] of [[-1,'←'],[1,'→']]){
   const btn=document.createElement('button');btn.type='button';btn.setAttribute('aria-label',direction<0?'Previous artwork':'Next artwork');btn.textContent=txt;
   btn.addEventListener('click',()=>target.scrollBy({left:direction*target.clientWidth*.72,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));actions.append(btn);
  }nav.append(label,actions);target.parentNode.insertBefore(nav,target);
 }
}
let toastTimer;
const pick=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
const ratio=v=>pick(v,['original','auto','square','portrait','landscape','classic'],'original');
const fit=v=>pick(v,['contain','cover'],'contain');
const columns=v=>pick(v,['one','two','three','editorial'],'two');
const gap=v=>pick(v,['normal','tight','airy'],'normal');
const cardSpan=v=>pick(v,['auto','wide','half'],'auto');

function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3600)}
function image(src,alt='',lazy=true){const valid=safeUrl(src);return valid?`<img src="${att(valid)}" alt="${att(alt)}" loading="${lazy?'lazy':'eager'}" decoding="async">`:`<div class="empty-note">Visual coming soon</div>`}
function isUsable(p){return p.status==='published'&&!!safeUrl(p.cover)}
function displayTitle(p){return esc(p.title||'Untitled work')}
function featuredCard(p,i){
 return `<article class="project-card featured card-ratio-${att(ratio(p.card_ratio))} card-span-${att(cardSpan(p.card_span))} card-fit-${att(fit(p.card_fit||'cover'))}" data-aura="${att(disciplineFor(p))}" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}">
 <div class="card-visual">${image(p.cover,p.title+' project image',i>1)}<span class="card-index">${String(i+1).padStart(2,'0')} / ${esc(disciplineFor(p).toUpperCase())}</span><span class="card-icon" aria-hidden="true"><svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></div>
 <div class="project-card-titleline"><div><h3>${displayTitle(p)}</h3><p>${esc(p.role||p.eyebrow||p.category)}</p></div><span class="project-card-numeral"><svg class="line-icon line-icon-asterisk" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></svg></span></div></article>`;
}
function miniCard(p,i){return `<article class="project-card mini card-ratio-${att(ratio(p.card_ratio))} card-fit-${att(fit(p.card_fit||'cover'))}" data-aura="${att(disciplineFor(p))}" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}"><div class="card-visual">${image(p.cover,p.title+' project image')}<span class="card-index">${esc(disciplineFor(p).toUpperCase())}</span><span class="card-icon" aria-hidden="true"><svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></div><div class="project-card-titleline"><div><h3>${displayTitle(p)}</h3><p>${esc((p.tags||[]).slice(0,3).join(' / '))}</p></div></div></article>`}
function renderWork(){
 const publish=allProjects.filter(isUsable);
 const featured=ordered('featured',publish.filter(p=>p.featured).sort((a,b)=>(a.feature_rank||999)-(b.feature_rank||999)));
 let filtered=activeFilter==='All'?featured:featured.filter(p=>disciplineFor(p)===activeFilter);
 
 $('#featured-grid').innerHTML=filtered.length?filtered.map(featuredCard).join(''):`<p class="loading-note">No published pieces in this collection yet. Explore another discipline.</p>`;
 setGalleryPresentation('featured','featured-grid');
 // Only show creative/archive projects here. Websites and motion have their own curated sections.
 const others=ordered('archive',publish.filter(p=>!p.featured && ['work','archive'].includes(locationFor(p)))).slice(0,12);
 $('#more-grid').innerHTML=activeFilter==='All'?others.map(miniCard).join(''):'';
 setGalleryPresentation('archive','more-grid');
 $('.more-work-head').style.display=activeFilter==='All'&&others.length?'flex':'none';
 $('#all-count').textContent=String(featured.length).padStart(2,'0');
 $$('.filter-btn').forEach(b=>{const active=b.dataset.filter===activeFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false')});
}

function renderDigital(){
 const list=ordered('digital',allProjects.filter(p=>isUsable(p)&&locationFor(p)==='digital'));
 $('#digital-grid').innerHTML=list.map((p,i)=>`<article class="digital-card digital-card-${i+1} card-ratio-${att(ratio(p.card_ratio))}" data-aura="${att(disciplineFor(p))}"><div class="digital-visual">${image(p.cover,p.title+' brand presentation')}<div class="digital-number">0${i+1} / DIGITAL EXPERIENCE</div></div><div class="digital-info"><span class="digital-type">${esc(p.client_type||'DIGITAL BUILD')}</span><h3>${displayTitle(p)}</h3><p>${esc(p.summary||'')}</p><div class="digital-tags">${(p.tags||[]).slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="digital-actions"><button type="button" data-open="${att(p.id)}" class="digital-case">Explore the build <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></button>${safeUrl(p.site_url)?`<a href="${att(safeUrl(p.site_url))}" target="_blank" rel="noopener noreferrer">View website <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></a>`:''}</div></div></article>`).join('');
 setGalleryPresentation('digital','digital-grid');
}
// Two distinct creative archives with their own layouts, sourced from Supabase.
const CARD_ARROW='<svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
function conceptCard(p,i){
 const letter=String(i+1).padStart(2,'0');
 const kind=esc(p.client_type||'Speculative / creative concept');
 return `<article class="concept-card card-ratio-${att(ratio(p.card_ratio))} card-fit-${att(fit(p.card_fit||'cover'))}" data-aura="${att(disciplineFor(p))}" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}">
  <div class="concept-art">${image(p.cover,p.title+' campaign artwork',i>1)}<span class="concept-index">CONCEPT ${letter}</span><span class="concept-arrow" aria-hidden="true">${CARD_ARROW}</span></div>
  <div class="concept-meta"><span>${kind}</span><h3>${displayTitle(p)}</h3><p>${esc(p.eyebrow||disciplineFor(p))}</p></div></article>`;
}
function renderConcept(){
 const list=ordered('concept',allProjects.filter(p=>isUsable(p)&&locationFor(p)==='concept'));
 const host=$('#concept-grid');
 host.innerHTML=list.length?list.map(conceptCard).join(''):'<p class="collection-empty">The next idea starts here. Spec campaigns and mock pitches will appear as you publish them from Studio Admin.</p>';
 setGalleryPresentation('concept','concept-grid');
}
function visualCard(p,i){
 const shape=ratio(p.card_ratio||'original');
 return `<article class="visual-card visual-ratio-${att(shape)} card-fit-${att(fit(p.card_fit||'contain'))}" data-aura="${att(disciplineFor(p))}" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="View ${att(p.title)}">
 <div class="visual-art">${image(p.cover,p.title+' poster or graphic',i>2)}<span class="visual-open" aria-hidden="true">${CARD_ARROW}</span></div>
 <div class="visual-card-meta"><span>${esc(disciplineFor(p))}</span><h3>${displayTitle(p)}</h3></div></article>`;
}
function renderVisual(){
 const list=ordered('visual',allProjects.filter(p=>isUsable(p)&&locationFor(p)==='visual'));
 $('#visual-grid').innerHTML=list.length?list.map(visualCard).join(''):'<p class="collection-empty">An evolving wall of posters, illustrations and graphic experiments. Add your first piece through Studio Admin.</p>';
 setGalleryPresentation('visual','visual-grid');
}

function motionCard(p){
 const m=(p.media||[]).find(x=>x.type==='video'||x.type==='model');
 const model=p.model||(m&&m.type==='model'?m.src:'');
 let visual='';
 if(model&&safeUrl(model))visual=`<model-viewer src="${att(safeUrl(model))}" alt="Interactive model for ${att(p.title)}" camera-controls auto-rotate shadow-intensity="1" interaction-prompt="auto" exposure="1"></model-viewer>`;
 else if(m&&m.type==='video'&&safeUrl(m.src))visual=`<video muted loop playsinline preload="none" poster="${att(safeUrl(p.cover))}"><source src="${att(safeUrl(m.src))}" type="video/mp4"></video>`;
 else visual=image(p.cover,p.title);
 return `<article class="motion-card" data-aura="${att(disciplineFor(p))}" data-open="${att(p.id)}" tabindex="0" role="button" aria-label="Explore ${att(p.title)}"><div class="motion-visual">${visual}<span class="motion-play">${model?'<svg class="line-icon line-icon-asterisk" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></svg> DRAG TO ROTATE':m&&m.type==='video'?'<svg class="line-icon line-icon-play" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg> WATCH / EXPLORE':'VIEW PROJECT'}</span></div><div class="motion-meta"><div><p>${esc(p.eyebrow||p.category)}</p><h3>${displayTitle(p)}</h3></div><span aria-hidden="true" class="motion-visit"><svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></span></div></article>`
}
function renderMotion(){
 const film=ordered('motion',allProjects.filter(p=>isUsable(p)&&locationFor(p)==='motion'));
 const three=ordered('three',allProjects.filter(p=>isUsable(p)&&locationFor(p)==='three'));
 $('#motion-grid').innerHTML=film.map(motionCard).join('');
 $('#three-grid').innerHTML=three.map(motionCard).join('');
 // Leave the independent galleries visible, even when they are being curated.
 $('#motion-film-collection').hidden=false;
 $('#motion-three-collection').hidden=false;
 if(!film.length)$('#motion-grid').innerHTML='<p class="collection-empty">Motion & film pieces will appear here as you publish them.</p>';
 if(!three.length)$('#three-grid').innerHTML='<p class="collection-empty">Interactive models and spatial design will appear here as you publish them.</p>';
 setGalleryPresentation('motion','motion-grid');
 setGalleryPresentation('three','three-grid');
 $$('.motion-card video').forEach(v=>{v.addEventListener('mouseenter',()=>v.play().catch(()=>{}));v.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0})});
}

function mediaBlock(m){
 const src=safeUrl(m.src);if(!src)return '';
 const itemRatio=ratio(m.ratio||'original'),itemFit=fit(m.fit||'contain'),span=pick(m.span,['auto','full'],'auto');
 const cl=`case-media-item media-ratio-${itemRatio} media-fit-${itemFit} media-span-${span}`;
 let content='';
 if(m.type==='pdf')content=`<div class="pdf-holder"><iframe class="pdf-frame" loading="lazy" src="${att(src)}#view=FitH" title="${att(m.caption||'Project PDF')}"></iframe><a class="pdf-link" href="${att(src)}" target="_blank" rel="noopener noreferrer">Open PDF in a new tab <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></a></div>`;
 else if(m.type==='video')content=`<video controls playsinline preload="metadata" src="${att(src)}"></video>`;
 else if(m.type==='model')content=`<model-viewer src="${att(src)}" camera-controls shadow-intensity="1" alt="3D object: ${att(m.caption||'handcrafted sculpture')}"></model-viewer>`;
 else content=`<a class="case-media-image-link" href="${att(src)}" target="_blank" rel="noopener noreferrer" title="Open original image in a new tab">${image(src,m.caption||'Project gallery image')}</a>`;
 return `<figure class="${cl}">${content}${m.caption?`<figcaption>${esc(m.caption)}</figcaption>`:''}</figure>`;
}
function storyBlocks(p){
 return (Array.isArray(p.story_blocks)?p.story_blocks:[]).map(block=>{
  if(block.type==='image'){
   const src=safeUrl(block.src);if(!src)return '';
   return `<section class="case-story-block"><figure class="case-story-image">${image(src,block.heading||'Project story image')}${block.heading?`<figcaption>${esc(block.heading)}</figcaption>`:''}</figure></section>`;
  }
  if(block.type==='text'&&(block.heading||block.body))return `<section class="case-block case-story-block">${block.heading?`<h3>${esc(block.heading)}</h3>`:''}${block.body?`<p>${esc(block.body)}</p>`:''}</section>`;
  return '';
 }).join('');
}
function openProject(id){
 const p=allProjects.find(p=>p.id===id&&p.status==='published');if(!p)return;
 const assets=(p.media||[]).filter(m=>safeUrl(m.src));
 const leadShape=ratio(p.hero_ratio||'original'),leadFit=fit(p.hero_fit||'contain');
 const lead=safeUrl(p.model)?`<model-viewer class="case-hero-model" src="${att(safeUrl(p.model))}" camera-controls auto-rotate shadow-intensity="1" alt="Interactive 3D model"></model-viewer>`
 :safeUrl(p.cover)?`<div class="case-hero-wrap hero-ratio-${leadShape} hero-fit-${leadFit}"><img class="case-hero-img" src="${att(safeUrl(p.cover))}" alt="${att(p.title+' project cover')}" decoding="async"><a class="case-hero-view" href="${att(safeUrl(p.cover))}" target="_blank" rel="noopener noreferrer">VIEW FULL IMAGE <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></a></div>`:'';
 const content=`<p class="case-kicker">${esc(p.client_type||p.category)} · ${esc(p.eyebrow||'THE M PRNT')}</p><h2 class="case-title" id="dialog-title">${displayTitle(p)}</h2>
 ${lead}
 <div class="case-desc"><p>${esc(p.summary||'An exploration in art direction and making.')}</p><div class="case-facts"><span>Discipline</span><strong>${esc(disciplineFor(p))}</strong><span>Role</span><strong>${esc(p.role||'Concept · Design · Production')}</strong><span>Type</span><strong>${esc(p.client_type||'Creative work')}</strong></div></div>
 ${p.approach?`<div class="case-block"><h3>The thinking behind it.</h3><p>${esc(p.approach)}</p></div>`:''}
 ${p.outcome?`<div class="case-block"><h3>The outcome.</h3><p>${esc(p.outcome)}</p></div>`:''}
 ${storyBlocks(p)}
 <div class="case-media case-layout-${columns(p.gallery_layout)} gallery-gap-${gap(p.gallery_gap)}">${assets.length?assets.map(mediaBlock).join(''):'<p class="empty-note">More process images and media coming soon.</p>'}</div>
 ${safeUrl(p.site_url)?`<p style="margin-top:25px"><a class="pdf-link" href="${att(safeUrl(p.site_url))}" target="_blank" rel="noopener noreferrer">Visit the live site <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></a></p>`:''}<div class="case-tags">${(p.tags||[]).map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`;
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
 $$('.skill-tile').forEach(tile=>tile.addEventListener('click',()=>{const names={'Brand worlds':'Brand Identity','Campaigns':'Campaigns & Advertising','Strategy':'Strategy & Concepts'};const filter=names[tile.dataset.filter];if(filter){activeFilter=filter;renderWork()}}));
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

function renderCustomSections(sections){
 const list=Array.isArray(sections)?sections:[];
 for(const placement of ['after-work','before-concept','before-visual','before-motion','before-three','before-studio']){
  const host=$('#custom-'+placement);if(!host)continue;
  const subset=list.filter(section=>section&&section.placement===placement&&section.title);
  host.innerHTML=subset.map(section=>{
   const theme=pick(section.theme,['dark','light'],'light');
   const layout=pick(section.layout,['split','stacked'],'split');
   const src=safeUrl(section.image);
   const link=safeUrl(section.link_url);
   return `<section class="custom-editorial custom-theme-${theme} custom-layout-${layout}"><div class="layout-container custom-inner"><div class="custom-copy">${section.eyebrow?`<p class="eyebrow">${esc(section.eyebrow)}</p>`:''}<h2>${esc(section.title)}</h2>${section.body?`<p>${esc(section.body)}</p>`:''}${link?`<a href="${att(link)}" target="_blank" rel="noopener noreferrer">${esc(section.link_text||'Explore')} <svg class="line-icon line-icon-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg></a>`:''}</div>${src?`<div class="custom-image">${image(src,section.title)}</div>`:''}</div></section>`;
  }).join('');
 }
}
function launchAura(){
 const orb=$('#cursor-orb');if(!orb||matchMedia('(pointer: coarse)').matches){if(orb)orb.hidden=true;return;}
 const palette={'Brand Identity':'224,85,151','Campaigns & Advertising':'239,98,115','Strategy & Concepts':'131,85,201','Websites & Digital':'78,155,221','Motion & Film':'182,89,222','3D & Interactive':'130,94,239','Editorial & Art Direction':'212,122,124','Illustration & Experiments':'226,117,183'};
 let x=-999,y=-999;
 document.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;document.documentElement.style.setProperty('--mouse-x',x+'px');document.documentElement.style.setProperty('--mouse-y',y+'px')},{passive:true});
 document.addEventListener('pointerover',e=>{
  const target=e.target.closest('[data-aura]');const section=e.target.closest('.work-section,.studio-section,.digital-section,.custom-theme-light,.project-dialog');
  orb.dataset.surface=section?'light':'dark';
  orb.style.setProperty('--aura-rgb',palette[target?.dataset.aura]||'193,103,228');
  orb.classList.toggle('aura-focused',!!target);
 });
 document.addEventListener('pointerleave',()=>orb.classList.remove('aura-focused'));
}


/** Builds two identical, viewport-filling ticker groups for a gapless continuous loop.
 *  Keep the supplied SVG artwork from the HTML; no Unicode/emoji fallbacks.
 */
function launchSeamlessBanner(){
  const banner=document.querySelector('.word-band');
  const track=banner?.querySelector('.word-band-track');
  if(!banner||!track)return;
  const originalMarkup=track.innerHTML;
  const unit=document.createElement('span');
  unit.className='word-band-unit';
  unit.innerHTML=originalMarkup;
  let resizeFrame=0;
  function rebuild(){
    track.classList.remove('is-ready');
    const first=document.createElement('div');
    first.className='word-band-set';
    track.replaceChildren(first);
    const target=Math.max(banner.getBoundingClientRect().width,window.innerWidth)+90;
    // Original artwork is repeated until the first entire set exceeds the viewport.
    do { first.append(unit.cloneNode(true)); }
    while(first.getBoundingClientRect().width < target && first.children.length < 40);
    const second=first.cloneNode(true);
    second.setAttribute('aria-hidden','true');
    track.append(second);
    const distance=first.getBoundingClientRect().width;
    // Consistent reading speed even on very wide screens.
    track.style.setProperty('--ticker-offset',`-${distance.toFixed(2)}px`);
    track.style.setProperty('--ticker-duration',`${(distance/55).toFixed(2)}s`);
    track.classList.add('is-ready');
  }
  function resize(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(rebuild);}
  window.addEventListener('resize',resize,{passive:true});
  if(document.fonts?.ready)document.fonts.ready.then(resize).catch(()=>{});
  rebuild();
}

async function init(){configureInteractions();launchMotion();launchAura();launchSeamlessBanner();try{const data=await getPublicData();allProjects=data.projects||[];const s=data.settings||{};galleryOrderV25=s.galleryOrderV25||{};galleryModesV25=s.galleryModesV25||{};if(s.subtitle)$('#hero-subtitle').textContent=s.subtitle;if(s.about)$('#about-copy').textContent=s.about;if(s.aboutExtra)$('#about-extra').textContent=s.aboutExtra;if(s.email){$('#email-link').replaceChildren(document.createTextNode(s.email+' '));const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('class','line-icon line-icon-arrow-up-right');arrow.setAttribute('aria-hidden','true');const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d','M7 17 17 7M7 7h10v10');arrow.append(line);$('#email-link').append(arrow);$('#email-link').href='mailto:'+encodeURIComponent(s.email)}if(s.instagram&&safeUrl(s.instagram))$('#instagram-link').href=s.instagram;if(s.linkedin&&safeUrl(s.linkedin))$('#linkedin-link').href=s.linkedin;renderWork();renderDigital();renderConcept();renderVisual();renderMotion();renderCustomSections(s.customSections);const deep=new URLSearchParams(location.search).get('project');if(deep)openProject(deep);if(data.source==='offline-fallback')console.warn('CMS unavailable. Serving bundled snapshot.')}catch(error){console.error(error);$('#featured-grid').innerHTML='<p class="loading-note">The portfolio could not be loaded. Try refreshing the page.</p>';toast('Portfolio content could not load.')}}
init();
