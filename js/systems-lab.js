// V2.10 Systems Lab: two editable, illustrative demos, no production APIs.
export const SYSTEMS_DEFAULT={
 enabled:false,eyebrow:'DIGITAL OPERATIONS / INTERACTIVE DEMOS',title:'Systems built to make things happen.',intro:'An interactive look at how thoughtful design becomes a working experience.',
 demos:[
  {name:'SILK / Experience & Systems',description:'An illustrative journey from the first inquiry to a confirmed appointment.',steps:[{title:'Inquiry',detail:'A potential client makes contact through the channels a business already uses.'},{title:'Qualify',detail:'The workflow organizes requests and directs questions to the right next step.'},{title:'Schedule',detail:'The booking and confirmation process reduces manual back-and-forth.'},{title:'Follow through',detail:'Reminders and follow-up help the business track what happens after booking.'}]},
  {name:'Matrix / Operations',description:'A simplified example of turning incoming signals into repeatable operational actions.',steps:[{title:'Capture',detail:'Information enters a structured intake process.'},{title:'Check',detail:'Rules verify inputs before taking the next action.'},{title:'Route',detail:'Relevant information moves to the appropriate workspace or owner.'},{title:'Review',detail:'A clear activity trail makes it easier to find problems and improve the flow.'}]}
 ]
};
const safeString=(v,max=400)=>typeof v==='string'?v.trim().slice(0,max):'';
export function normalizeSystems(raw){
 const src=raw&&typeof raw==='object'?raw:{};
 return {enabled:src.enabled===true,eyebrow:safeString(src.eyebrow,110)||SYSTEMS_DEFAULT.eyebrow,title:safeString(src.title,120)||SYSTEMS_DEFAULT.title,intro:safeString(src.intro,380)||SYSTEMS_DEFAULT.intro,
  demos:SYSTEMS_DEFAULT.demos.map((def,i)=>{const d=Array.isArray(src.demos)?src.demos[i]||{}:{};const items=Array.isArray(d.steps)?d.steps:[];return {name:safeString(d.name,100)||def.name,description:safeString(d.description,350)||def.description,steps:(items.length?items:def.steps).slice(0,7).map(st=>({title:safeString(st.title,70),detail:safeString(st.detail,280)})).filter(s=>s.title)}})};
}
const txt=(tag,content,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=content;return el};
export function renderSystemsLab(raw){
 const root=document.getElementById('systems');if(!root)return false;
 const cfg=normalizeSystems(raw);root.hidden=!cfg.enabled;
 document.querySelectorAll('.systems-nav-link').forEach(el=>el.hidden=!cfg.enabled);
 if(!cfg.enabled)return false;
 root.querySelector('#systems-eyebrow').textContent=cfg.eyebrow;
 root.querySelector('#systems-title').textContent=cfg.title;
 root.querySelector('#systems-description').textContent=cfg.intro;
 const container=root.querySelector('#systems-lab-grid');container.replaceChildren();
 for(let index=0;index<cfg.demos.length;index++){
  const demo=cfg.demos[index],card=document.createElement('article');card.className='systems-demo';
  const top=txt('p',`0${index+1} / WORKFLOW DEMONSTRATION`,'systems-demo-index');
  const heading=txt('h3',demo.name),intro=txt('p',demo.description,'systems-demo-intro');
  const rail=document.createElement('div');rail.className='systems-step-rail';rail.setAttribute('role','group');rail.setAttribute('aria-label',demo.name+' workflow steps');
  const detail=document.createElement('div');detail.className='systems-step-detail';detail.setAttribute('aria-live','polite');
  const title=txt('strong',''),description=txt('p','');detail.append(title,description);
  const buttons=[];
  demo.steps.forEach((step,i)=>{const b=document.createElement('button');b.type='button';b.className='systems-step-button';b.append(txt('small',String(i+1).padStart(2,'0')),txt('span',step.title));b.addEventListener('click',()=>{buttons.forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false')});b.classList.add('is-active');b.setAttribute('aria-pressed','true');title.textContent=step.title;description.textContent=step.detail});rail.append(b);buttons.push(b)});
  if(buttons.length)buttons[0].click();
  card.append(top,heading,intro,rail,detail);container.append(card);
 }
 return true;
}
