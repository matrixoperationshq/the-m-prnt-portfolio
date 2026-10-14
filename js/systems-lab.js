/** V2.12 Systems Lab. Public-facing demonstrations, not live connected dashboards. */
export const SYSTEMS_DEFAULT={
 enabled:false,
 eyebrow:'SYSTEMS THINKING / EXPERIENCE DESIGN',
 title:'Complex problems. Clearer systems.',
 intro:'Beyond the visuals: how I translate fragmented business processes into structured, human-centered workflows and accountable decisions.',
 demos:[
  {name:'SILK / Experience & Operations',status:'PLATFORM CONCEPT · IN DEVELOPMENT',
   description:'A proposed operational layer that works alongside existing business tools rather than requiring a new booking system.',
   challenge:'Inquiries, bookings, arrivals and feedback often live in disconnected tools, making handoffs and customer experience harder to understand.',
   approach:'Design a platform-agnostic customer journey that connects permitted inquiry handling, appointments, attendance visibility and feedback with human escalation.',
   boundary:'Illustrative system and proposed capabilities. Integrations and managed services depend on permissions, supported tools and release stage.',
   skills:'Service design · Experience architecture · CRM workflows · Operational intelligence',
   steps:[
    {title:'Capture & qualify',detail:'Capture approved inquiries across supported channels and identify the appropriate next step.'},
    {title:'Book & confirm',detail:'Work with the existing scheduler and coordinate reminders, confirmations and changes.'},
    {title:'Verify & listen',detail:'Distinguish booked appointments from verified arrivals, then gather eligible experience feedback.'},
    {title:'Investigate & improve',detail:'Surface bottlenecks for human review, propose changes and measure approved improvements.'}
   ]},
  {name:'The Matrix / Founder Headquarters',status:'CORE V1 CERTIFIED · READ-ONLY',
   description:'A governed research-to-decision operating system that makes opportunity evaluation more structured and transparent.',
   challenge:'Founders can waste time chasing unverified opportunities or taking action before the evidence, costs and permissions are ready.',
   approach:'Separate observed evidence from forecasts, score candidate opportunities, enforce HOLD/TEST decision gates, and surface the next authorized action.',
   boundary:'Current core is read-only. External publishing, spending and payments require separate authorization; no verified commercial results are claimed here.',
   skills:'Automation architecture · Decision systems · Evidence provenance · Human-in-the-loop controls',
   steps:[
    {title:'Collect evidence',detail:'Gather approved public research signals and preserve source information. Trend interest is not a sale.'},
    {title:'Evaluate uncertainty',detail:'Score candidates and make missing economics or weak evidence visible rather than treating forecasts as facts.'},
    {title:'Apply decision gates',detail:'Hold proposals that do not meet validation criteria; external execution remains blocked without authorization.'},
    {title:'Surface next steps',detail:'Present founder-facing decisions and a clear path toward evidence review or a future approved pilot.'}
   ]}
 ]
};
const safeString=(v,max=400)=>typeof v==='string'?v.trim().slice(0,max):'';
export function normalizeSystems(raw){
 const src=raw&&typeof raw==='object'?raw:{};
 return {enabled:src.enabled===true,eyebrow:safeString(src.eyebrow,110)||SYSTEMS_DEFAULT.eyebrow,
  title:safeString(src.title,120)||SYSTEMS_DEFAULT.title,
  intro:safeString(src.intro,380)||SYSTEMS_DEFAULT.intro,
  demos:SYSTEMS_DEFAULT.demos.map((def,i)=>{
   const d=Array.isArray(src.demos)?src.demos[i]||{}:{};
   const items=Array.isArray(d.steps)?d.steps:[];
   const cleaned=(items.length?items:def.steps).slice(0,7).map(st=>({title:safeString(st.title,70),detail:safeString(st.detail,280)})).filter(s=>s.title);
   return {name:safeString(d.name,100)||def.name,description:safeString(d.description,350)||def.description,
    status:safeString(d.status,90)||def.status,challenge:safeString(d.challenge,480)||def.challenge,
    approach:safeString(d.approach,550)||def.approach,boundary:safeString(d.boundary,470)||def.boundary,
    skills:safeString(d.skills,220)||def.skills,steps:cleaned};
  })};
}
const txt=(tag,value,className='')=>{const el=document.createElement(tag);if(className)el.className=className;el.textContent=value;return el};
function info(label,value,css=''){
 const div=document.createElement('div');div.className='systems-insight '+css;
 div.append(txt('span',label,'systems-insight-label'),txt('p',value));return div;
}
export function renderSystemsLab(raw){
 const root=document.getElementById('systems');if(!root)return false;
 const cfg=normalizeSystems(raw);root.hidden=!cfg.enabled;
 document.querySelectorAll('.systems-nav-link').forEach(el=>el.hidden=!cfg.enabled);
 if(!cfg.enabled)return false;
 root.querySelector('#systems-eyebrow').textContent=cfg.eyebrow;
 root.querySelector('#systems-title').textContent=cfg.title;
 root.querySelector('#systems-description').textContent=cfg.intro;
 const container=root.querySelector('#systems-lab-grid');container.replaceChildren();
 cfg.demos.forEach((demo,index)=>{
  const card=document.createElement('article');card.className='systems-demo systems-demo-v212';
  const top=document.createElement('div');top.className='systems-demo-topline';
  top.append(txt('p',`0${index+1} / WORKFLOW DESIGN`,'systems-demo-index'),txt('span',demo.status,'systems-stage'));
  card.append(top,txt('h3',demo.name),txt('p',demo.description,'systems-demo-intro'));
  const overview=document.createElement('div');overview.className='systems-insight-grid';
  overview.append(info('01 / THE PROBLEM',demo.challenge),info('02 / MY DESIGN APPROACH',demo.approach));
  card.append(overview);
  const label=txt('p','03 / INTERACTIVE WORKFLOW · SELECT A STAGE','systems-flow-label');card.append(label);
  const rail=document.createElement('div');rail.className='systems-step-rail';rail.setAttribute('role','group');rail.setAttribute('aria-label',demo.name+' interactive workflow');
  const detail=document.createElement('div');detail.className='systems-step-detail';detail.setAttribute('aria-live','polite');
  const title=txt('strong',''),description=txt('p','');detail.append(title,description);
  const buttons=[];
  demo.steps.forEach((step,i)=>{
   const btn=document.createElement('button');btn.type='button';btn.className='systems-step-button';
   btn.append(txt('small',String(i+1).padStart(2,'0')),txt('span',step.title));
   btn.addEventListener('click',()=>{
    buttons.forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-pressed','false')});
    btn.classList.add('is-active');btn.setAttribute('aria-pressed','true');title.textContent=step.title;description.textContent=step.detail;
   });rail.append(btn);buttons.push(btn);
  });
  if(buttons.length)buttons[0].click();card.append(rail,detail);
  const foot=document.createElement('div');foot.className='systems-demo-proof';
  foot.append(info('WHAT THIS DEMONSTRATES',demo.skills,'systems-skill'),info('CURRENT STATUS & BOUNDARIES',demo.boundary,'systems-boundary'));
  card.append(foot);container.append(card);
 });
 return true;
}
