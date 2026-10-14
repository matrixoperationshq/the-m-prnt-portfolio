/** Native V2 portfolio galleries and section manager. Stored in existing portfolio_settings. */
export const SECTION_SETTINGS_KEY = 'sectionManagerV29';
export const CUSTOM_PREFIX = 'collection-';
export const SECTION_DEFS = Object.freeze([
 {id:'work',name:'Selected Work',nav:'work',headingId:'work-title',summary:'A separately art-directed selection of featured projects'},
 {id:'creative',name:'Creative Work',nav:'creative',headingId:'creative-title',summary:'Brand identity, art direction, design and finished creative projects'},
 {id:'digital',name:'Digital Experiences',nav:'web builds',headingId:'digital-title',summary:'Websites, commerce, UX and systems'},
 {id:'systems',name:'Systems Lab',nav:'systems lab',headingId:'systems-title',summary:'Interactive illustrations of SILK and Matrix workflows'},
 {id:'client',name:'Client Work',nav:'client work',headingId:'client-title',summary:'Commissioned designs, identities and campaigns'},
 {id:'social',name:'Social & Content',nav:'social',headingId:'social-title',summary:'Posts, stories, content campaigns and carousel graphics'},
 {id:'concept',name:'The Concept Lab',nav:'concepts',headingId:'concept-title',summary:'Spec campaigns and concept development'},
 {id:'visual',name:'Visual Studies',nav:'posters',headingId:'visual-title',summary:'Posters, illustration and graphic experiments'},
 {id:'more',name:'More Work',nav:'more work',headingId:'more-title',summary:'Additional finished work, now with its own public gallery'},
 {id:'motion',name:'Motion + 3D',nav:'motion',headingId:'motion-title',summary:'Motion & Film and 3D & Interaction together'},
 {id:'studio',name:'Studio / About',nav:'studio',headingId:'studio-title',summary:'Your practice, skills and creative direction'}
]);
const clean=(value,max=130)=>typeof value==='string'?value.trim().slice(0,max):'';
const VALID_ID=/^collection-[a-z0-9-]{8,65}$/;
export const isCustomGalleryId = id=>typeof id==='string'&&VALID_ID.test(id);
export function normalizeSections(raw){
 const input=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const custom=[];const taken=new Set(SECTION_DEFS.map(v=>v.id));
 for(const item of (Array.isArray(input.custom)?input.custom:[]).slice(0,30)){
  const id=item?.id;
  if(!isCustomGalleryId(id)||taken.has(id))continue;
  taken.add(id);
  custom.push({id,name:clean(item.name,70)||'New gallery'});
 }
 const defs=[...SECTION_DEFS,...custom.map(item=>({id:item.id,name:item.name,nav:item.name.toLowerCase(),headingId:'',summary:'Custom project gallery'}))];
 const ids=defs.map(v=>v.id);
 const order=Array.isArray(input.order)?input.order.filter(id=>taken.has(id)):[];
 const unique=[...new Set([...order,...ids])];
 // Upgrade older saved ordering without unexpectedly placing new galleries below Studio / About.
 // Preserve explicit positions after the owner has organized these sections.
 if(!order.includes('creative')){unique.splice(unique.indexOf('creative'),1);unique.splice(unique.indexOf('work')+1,0,'creative')}
 if(!order.includes('social')){unique.splice(unique.indexOf('social'),1);unique.splice(unique.indexOf('client')+1,0,'social')}
 if(!order.includes('more')){unique.splice(unique.indexOf('more'),1);unique.splice(unique.indexOf('visual')+1,0,'more')}
 // Old V2.9 ordering predates Systems Lab, and some versions stored no entry for it.
 if(!order.includes('systems')){unique.splice(unique.indexOf('systems'),1);unique.splice(unique.indexOf('digital')+1,0,'systems')}
 const entries={};
 for(const def of defs){const source=input.entries?.[def.id]||{};
  entries[def.id]={removed:source.removed===true,visible:source.visible!==false,navLabel:clean(source.navLabel,28),heading:clean(source.heading,115),eyebrow:clean(source.eyebrow,110),description:clean(source.description,350),theme:['light','dark','lavender'].includes(source.theme)?source.theme:'light'};
 }
 return {order:unique,entries,custom};
}
export function sectionDefinitions(raw){const settings=normalizeSections(raw);return [...SECTION_DEFS,...settings.custom.map(item=>({id:item.id,name:item.name,nav:item.name.toLowerCase(),headingId:'',summary:'Your own collection of portfolio projects'}))]}
export function applySectionSettings(raw,{withClient=false,withSystems=false,withCreative=false,withSocial=false,withMore=false}={}){
 const settings=normalizeSections(raw),defs=sectionDefinitions(settings);
 const main=document.querySelector('main'),reference=document.getElementById('work');if(!main||!reference)return;
 const marker=document.createComment('Managed section order');main.insertBefore(marker,reference);
 for(const id of settings.order){
  const element=document.getElementById(id),def=defs.find(d=>d.id===id);if(!element||!def)continue;
  main.insertBefore(element,marker);
  const entry=settings.entries[id];const available=(id!=='client'||withClient)&&(id!=='systems'||withSystems)&&(id!=='creative'||withCreative)&&(id!=='social'||withSocial)&&(id!=='more'||withMore);
  element.hidden=!entry.visible||entry.removed||!available;
  element.classList.toggle('managed-section-hidden',!entry.visible||entry.removed||!available);
  element.dataset.sectionVisible=String(entry.visible&&!entry.removed&&available);
  const heading=element.querySelector('[data-managed-heading]')||(def.headingId?document.getElementById(def.headingId):null);
  if(heading&&entry.heading)heading.textContent=entry.heading;
  const intro=element.querySelector('.section-intro,.client-heading,.systems-lab-intro,.studio-left');
  if(intro){
   const eyebrow=intro.querySelector('[data-managed-eyebrow],.section-eyebrow,.eyebrow');
   if(eyebrow&&entry.eyebrow)eyebrow.textContent=entry.eyebrow;
   const summary=intro.querySelector('[data-managed-description],:scope > p:not(.eyebrow):not(.section-eyebrow)');
   if(summary&&entry.description)summary.textContent=entry.description;
  }
 }
 marker.remove();
 for(const nav of document.querySelectorAll('.desktop-nav,.mobile-nav')){
  const contact=nav.querySelector('a[href="#contact"]');if(!contact)continue;
  // Build custom links from the *same* section definitions as the project editor.
  for(const def of defs.filter(d=>isCustomGalleryId(d.id))){
   let link=Array.from(nav.querySelectorAll('a[href^="#"]')).find(a=>a.getAttribute('href')==='#'+def.id);
   if(!link){link=document.createElement('a');link.href='#'+def.id;link.dataset.customNav=def.id;nav.insertBefore(link,contact)}
   link.textContent=settings.entries[def.id].navLabel||def.name.toLowerCase();
  }
  for(const id of settings.order){
   const anchor=Array.from(nav.querySelectorAll('a[href^="#"]')).find(a=>a.getAttribute('href')==='#'+id);
   if(anchor)nav.insertBefore(anchor,contact);
   if(id==='motion'){const three=nav.querySelector('a[href="#three"]');if(three)nav.insertBefore(three,contact)}
  }
  for(const link of nav.querySelectorAll('a[href^="#"]')){
   const href=link.getAttribute('href').slice(1),id=href==='three'?'motion':href;
   const def=defs.find(d=>d.id===id);if(!def)continue;
   const entry=settings.entries[id];const available=(id!=='client'||withClient)&&(id!=='systems'||withSystems)&&(id!=='creative'||withCreative)&&(id!=='social'||withSocial)&&(id!=='more'||withMore);
   link.hidden=!entry.visible||entry.removed||!available;
   link.classList.toggle('managed-section-hidden',!entry.visible||entry.removed||!available);
   if(href!=='three')link.textContent=entry.navLabel||def.nav;
  }
 }
}
