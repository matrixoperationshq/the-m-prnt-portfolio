/** V2.9 - Presentation-only controls for built-in public sections.
 * Projects are never removed or modified by these settings.
 * Motion and 3D are one parent section to preserve the existing V2 layout.
 */
export const SECTION_SETTINGS_KEY = 'sectionManagerV29';
export const SECTION_DEFS = Object.freeze([
 {id:'work',     name:'Selected Work',       nav:'work',         headingId:'work-title',    summary:'Flagship creative projects and selected work'},
 {id:'digital',  name:'Digital Experiences', nav:'web builds',   headingId:'digital-title', summary:'Websites, commerce, UX and systems'},
 {id:'systems',  name:'Systems Lab',         nav:'systems lab',  headingId:'systems-title', summary:'Interactive illustrations of SILK and Matrix workflows'},
 {id:'client',   name:'Client Work',         nav:'client work',  headingId:'client-title',  summary:'Commissioned designs, identities and campaigns'},
 {id:'concept',  name:'The Concept Lab',     nav:'concepts',     headingId:'concept-title', summary:'Spec campaigns and concept development'},
 {id:'visual',   name:'Visual Studies',      nav:'posters',      headingId:'visual-title',  summary:'Posters, illustration and graphic experiments'},
 {id:'motion',   name:'Motion + 3D',         nav:'motion',       headingId:'motion-title',  summary:'Motion & Film and 3D & Interaction together'},
 {id:'studio',   name:'Studio / About',      nav:'studio',       headingId:'studio-title',  summary:'Your practice, skills and creative direction'}
]);
const LIMIT=130;
const text=(v,max=LIMIT)=>typeof v==='string'?v.trim().slice(0,max):'';
export function normalizeSections(raw){
 const input=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const known=new Set(SECTION_DEFS.map(v=>v.id));
 const order=Array.isArray(input.order)?input.order.filter(x=>known.has(x)):[];
 const unique=[...new Set(order),...SECTION_DEFS.map(x=>x.id).filter(x=>!order.includes(x))];
 // Existing V2.9 preferences have no Systems Lab entry yet. Insert it after Web Builds.
 if(!order.includes('systems')){unique.splice(unique.indexOf('systems'),1);unique.splice(unique.indexOf('digital')+1,0,'systems')}
 const entries={};
 for(const def of SECTION_DEFS){const source=input.entries?.[def.id]||{};
  entries[def.id]={visible:source.visible!==false,navLabel:text(source.navLabel,28),heading:text(source.heading,115),eyebrow:text(source.eyebrow,110),description:text(source.description,350)};
 }
 return {order:unique,entries};
}
export function applySectionSettings(raw,{withClient=false,withSystems=false}={}){
 const settings=normalizeSections(raw);
 const main=document.querySelector('main');if(!main)return;
 const reference=document.getElementById('work');
 if(!reference)return;
 // The banner and hero never move. All curated sections stay ahead of any
 // custom editorial blocks, the contact footer and the original copyright.
 const marker=document.createComment('V2.9 managed section order');
 main.insertBefore(marker,reference);
 for(const id of settings.order){
  const element=document.getElementById(id);const def=SECTION_DEFS.find(x=>x.id===id);
  if(!element||!def)continue;
  main.insertBefore(element,marker);
  const entry=settings.entries[id];
  const isAvailable=(id!=='client'||withClient)&&(id!=='systems'||withSystems);
  element.hidden=!entry.visible||!isAvailable;
  element.classList.toggle('managed-section-hidden',!entry.visible||!isAvailable);
  element.dataset.sectionVisible=String(entry.visible&&isAvailable);
  const heading=document.getElementById(def.headingId);
  if(entry.heading&&heading)heading.textContent=entry.heading;
  const intro=element.querySelector('.section-intro,.client-intro,.studio-left');
  if(intro){
   const eyebrow=intro.querySelector('.section-eyebrow,.eyebrow');
   if(eyebrow&&entry.eyebrow)eyebrow.textContent=entry.eyebrow;
   const summary=intro.querySelector(':scope > p:not(.eyebrow):not(.section-eyebrow)');
   if(summary&&entry.description)summary.textContent=entry.description;
  }
 }
 marker.remove();
 for(const nav of document.querySelectorAll('.desktop-nav,.mobile-nav')){
  // Keep the menu in the same order as the rearranged public sections.
  const contact=nav.querySelector('a[href="#contact"]');
  if(contact){
   for(const id of settings.order){
    const anchor=nav.querySelector(`a[href="#${id}"]`);
    if(anchor)nav.insertBefore(anchor,contact);
    if(id==='motion'){
     const three=nav.querySelector('a[href="#three"]');
     if(three)nav.insertBefore(three,contact);
    }
   }
  }
  for(const anchor of nav.querySelectorAll('a[href^="#"]')){
   const href=anchor.getAttribute('href').slice(1);
   const id=href==='three'?'motion':href;
   const def=SECTION_DEFS.find(x=>x.id===id);
   if(!def)continue;
   const allowed=settings.entries[id].visible && (id!=='client'||withClient)&&(id!=='systems'||withSystems);
   anchor.hidden=!allowed;
   anchor.classList.toggle('managed-section-hidden',!allowed);
   const defaultLabel=href==='three'?'3d':def.nav;
   const label=settings.entries[id].navLabel||defaultLabel;
   if(href!=='three'&&label){
    // The original contact icon is untouched (not part of this manager).
    anchor.textContent=label;
   }
  }
 }
}
