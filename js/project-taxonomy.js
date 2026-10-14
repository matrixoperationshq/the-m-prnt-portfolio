/** Shared portfolio taxonomy and section placement. No migration of existing records required. */
export const DISCIPLINES = [
  ['Brand Identity','Brand identity & packaging'],
  ['Campaigns & Advertising','Campaigns & advertising'],
  ['Spec Campaigns & Concepts','Spec campaigns & pitches'],
  ['Posters & Graphic Art','Posters, typography & graphic art'],
  ['Social & Content','Social posts, digital campaigns and content design'],
  ['Websites & Digital','Websites & digital products'],
  ['3D & Interactive','3D design & interactive work'],
  ['Motion & Film','Motion design & video'],
  ['Editorial & Art Direction','Editorial & art direction'],
  ['Strategy & Concepts','Strategy & concepts'],
  ['Illustration & Experiments','Illustration & experiments']
];
export const LOCATIONS = [
  ['creative','Creative Work','Brand identity, art direction and finished creative projects'],
  ['digital','Digital Experiences','Websites, commerce, UX and digital systems'],
  ['client','Client Work','Commissioned ads, brand marks, flyers and client collateral'],
  ['social','Social & Content','Social posts, campaign carousels, stories and digital content'],
  ['concept','The Concept Lab','Spec ads, mock campaigns, pitches and creative experiments'],
  ['visual','Visual Studies','Posters, illustrations, graphics and standalone designs'],
  ['motion','Motion & Film','Animations, films and motion design'],
  ['three','3D & Interaction','GLB models, spatial design and interactive work'],
  ['archive','More Work','Supporting published projects and additional creative work'],
  ['holding','Private Holding','Keep a project in the library without putting it on the public site']
];
const canonical = new Set(DISCIPLINES.map(item=>item[0]));
const legacy = {
  'Brand worlds':'Brand Identity',
  'Campaigns':'Campaigns & Advertising',
  '3D & campaigns':'3D & Interactive',
  'Web & products':'Websites & Digital',
  'Strategy':'Strategy & Concepts',
  'Art direction':'Editorial & Art Direction',
  'Editorial':'Editorial & Art Direction',
  'Posters':'Posters & Graphic Art',
  'Social':'Social & Content',
  'Motion':'Motion & Film'
};
export function has3D(project){
  return !!project.model || (project.media||[]).some(asset=>asset.type==='model'&&!!asset.src);
}
export function hasMotion(project){
  return (project.media||[]).some(asset=>asset.type==='video'&&!!asset.src);
}
export function disciplineFor(project){
  const old=project.category||'';
  if(canonical.has(old))return old;
  if(old==='Experiments')return has3D(project)?'3D & Interactive':'Illustration & Experiments';
  if(old==='Archive')return /muse|editorial|magazine|spread|fashion/i.test(project.title||'')?'Editorial & Art Direction':'Illustration & Experiments';
  if(old==='Editorial' && isWebEvidence(project))return 'Websites & Digital';
  return legacy[old]||'Illustration & Experiments';
}
function isWebEvidence(project){
  const terms=[project.title,project.role,project.eyebrow,project.summary,...(project.tags||[])].filter(Boolean).join(' ').toLowerCase();
  return /web(?:site|site design| build| design| development| experience)|digital flagship|shopify|e-commerce|commerce|saas|app build|custom code|booking|crm|domain setup/.test(terms);
}
export function locationFor(project){
  // Explicit destination always wins. Legacy projects retain their previous routing.
  if(project.site_section==='work')return 'creative'; // Backward compatibility: work was once both featured and Creative Work.
  if(LOCATIONS.some(item=>item[0]===project.site_section))return project.site_section;
  const category=project.category||'';
  if(category==='Web & products'||category==='Websites & Digital')return 'digital';
  if(category==='Social & Content')return 'social';
  if(category==='Spec Campaigns & Concepts')return 'concept';
  if(category==='Posters & Graphic Art')return 'visual';
  if(category==='Motion'||category==='Motion & Film')return 'motion';
  if(category==='3D & Interactive')return 'three';
  if((category==='Experiments'||category==='3D & campaigns')&&has3D(project))return 'three';
  if(category==='Experiments'&&hasMotion(project))return 'motion';
  if(category==='Editorial'&&isWebEvidence(project))return 'digital';
  if(category==='Archive')return 'archive';
  return 'creative';
}
export function locationLabel(project){
  return (LOCATIONS.find(item=>item[0]===locationFor(project))||LOCATIONS[0])[1];
}
export function suggestedLocation(discipline){
  if(discipline==='Websites & Digital')return 'digital';
  if(discipline==='3D & Interactive')return 'three';
  if(discipline==='Motion & Film')return 'motion';
  if(discipline==='Spec Campaigns & Concepts')return 'concept';
  if(discipline==='Social & Content')return 'social';
  if(discipline==='Posters & Graphic Art'||discipline==='Illustration & Experiments')return 'visual';
  return 'creative';
}

// Additional native galleries load from portfolio_settings after authentication.
const BUILTIN_LOCATION_COUNT=LOCATIONS.length;
export function setCustomLocations(custom=[]){
 LOCATIONS.splice(BUILTIN_LOCATION_COUNT);
 for(const item of custom){
  if(/^collection-[a-z0-9-]{8,65}$/.test(item.id)&&!LOCATIONS.some(row=>row[0]===item.id))
   LOCATIONS.push([item.id,item.name||'Custom gallery','Custom portfolio collection']);
 }
}
