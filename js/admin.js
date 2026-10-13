import {disciplineFor,locationFor,locationLabel,suggestedLocation,LOCATIONS} from './project-taxonomy.js';
import {hasBackend,getClient,safeUrl} from './data-service.js';
const REORDER_ICONS={up:`<svg class="line-icon line-icon-arrow-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>`,down:`<svg class="line-icon line-icon-arrow-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>`};
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
let client, projects=[],settings={},current=null,selectedId=null,dirty=false,filterStatus='all';let locationTouched=false;let persistedIds=new Set();
let noticeTimer;
function notice(message,error=false){const node=$('#admin-toast');node.textContent=message;node.style.background=error?'#a12c53':'#692c66';node.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>node.classList.remove('show'),4200)}
function show(view){['setup-view','login-view','dashboard'].forEach(id=>$('#'+id).hidden=id!==view);$('#signout').hidden=view!=='dashboard'}
function getVal(id){return $('#'+id).value.trim()}
function setVal(id,value){$('#'+id).value=value||''}
function fallbackImage(){return '/assets/media/pending-upload-placeholder.webp'}
function updateImage(el,url){el.src=safeUrl(url)||fallbackImage();el.onerror=()=>{el.onerror=null;el.src=fallbackImage()}}
function authMessage(message){$('#login-error').textContent=message}
async function checkAuthorization(){const {data:{user},error}=await client.auth.getUser();if(error||!user)return false;const result=await client.from('portfolio_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(result.error)throw result.error;return !!result.data}
async function begin(){if(!hasBackend()){show('setup-view');return}try{client=await getClient();if(await checkAuthorization())await openDashboard();else show('login-view')}catch(e){console.error(e);show('login-view');authMessage('Could not connect to Supabase. Check the public project URL, key, schema and network.')}}
async function openDashboard(){show('dashboard');await loadData();renderList();if(projects.length)selectProject(projects[0].id)}
async function loadData(){const [records,copy]=await Promise.all([client.from('portfolio_projects').select('id,data,status,sort_order').order('sort_order',{ascending:true}),client.from('portfolio_settings').select('key,value')]);if(records.error)throw records.error;if(copy.error)throw copy.error;projects=(records.data||[]).map(r=>({...r.data,id:r.id,status:r.status,sort_order:r.sort_order}));persistedIds=new Set(projects.map(p=>p.id));settings=Object.fromEntries((copy.data||[]).map(r=>[r.key,r.value]));loadSettingsForm();renderCustomSectionEditors()}
function renderList(){
 const query=getVal('project-search').toLowerCase();
 const locationFilter=$('#library-placement-filter').value;
 const visible=projects.filter(p=>{
  const matchesStatus=filterStatus==='all'||p.status===filterStatus;
  const matchesSearch=!query||[p.title,disciplineFor(p),p.category,(p.tags||[]).join(' '),locationLabel(p)].join(' ').toLowerCase().includes(query);
  const matchesLocation=locationFilter==='all'||(locationFilter==='featured'?!!p.featured:locationFor(p)===locationFilter);
  return matchesStatus&&matchesSearch&&matchesLocation;
 });
 $('#record-count').textContent=`(${projects.length})`;
 const list=$('#project-list');list.replaceChildren();
 visible.forEach(p=>{
  const button=document.createElement('button');button.type='button';button.className='project-item'+(p.id===selectedId?' selected':'');button.setAttribute('role','listitem');
  const img=document.createElement('img');updateImage(img,p.cover);img.alt='';
  const body=document.createElement('div');const strong=document.createElement('strong');strong.textContent=p.title||'Untitled';
  const small=document.createElement('small');small.textContent=disciplineFor(p);
  const where=document.createElement('span');where.className='library-location-pill';where.textContent=p.featured?'Featured + '+locationLabel(p):locationLabel(p);
  body.append(strong,small,where);
  const dot=document.createElement('span');dot.className='status-dot '+p.status;dot.title=p.status;
  button.append(img,body,dot);button.addEventListener('click',()=>{if(dirty&&!confirm('Discard your unsaved edits?'))return;selectProject(p.id)});list.append(button);
 });
 if(!visible.length){const empty=document.createElement('p');empty.className='fineprint';empty.textContent='No projects match these filters. Try a different section or status.';list.append(empty)}
}

function cleanProject(p){return JSON.parse(JSON.stringify(p))}
const pick=(value,options,fallback)=>options.includes(value)?value:fallback;
function markDirty(){dirty=true;$('#save-state').textContent='Unsaved changes';}
function fieldSelect(value,options,onChange){const el=document.createElement('select');for(const [v,label] of options){const op=document.createElement('option');op.value=v;op.textContent=label;el.append(op)}el.value=value;el.addEventListener('change',()=>onChange(el.value));return el}
function fieldLabel(title,el){const label=document.createElement('label');label.textContent=title;label.append(el);return label}
function fieldInput(value,onChange,multi=false){const el=document.createElement(multi?'textarea':'input');el.value=value||'';el.addEventListener('input',()=>onChange(el.value));if(multi)el.rows=3;return el}
const shapeOptions=[['original','Original / entire image'],['square','Square · 1:1'],['portrait','Portrait · 4:5'],['landscape','Landscape · 16:9'],['classic','Classic · 3:2']];
const fitOptions=[['contain','Fit entire image'],['cover','Fill frame / crop']];

function selectProject(id){const item=projects.find(p=>p.id===id);if(!item)return;selectedId=id;current=cleanProject(item);dirty=false;populateForm();renderList();$('#editor-empty').hidden=true;$('#editor-content').hidden=false;$('#save-project').disabled=false;$('#editor-heading').textContent=current.title||'Untitled project';$('#save-state').textContent='Saved on server';}
function selectedPlacement(){return document.querySelector('input[name="site-section"]:checked')?.value||'work'}
function setPlacement(value,touched=true){
 const radio=document.querySelector(`input[name="site-section"][value="${value}"]`);
 if(radio)radio.checked=true;
 if(touched)locationTouched=true;
 updatePlacementPreview();
}
function updatePlacementPreview(){
 if(!current)return;
 const place=selectedPlacement();
 const name=(LOCATIONS.find(x=>x[0]===place)||LOCATIONS[0])[1];
 const featured=$('#edit-featured').checked;
 const published=$('#edit-status').value==='published';
 const text=published ? `Published to ${name}${featured?' + featured in Selected Work':''}.`:`${$('#edit-status').value==='archived'?'Archived':'Draft'}: not visible publicly. Will appear in ${name} when published${featured?' and as Selected Work feature':''}.`;
 $('#placement-feedback').textContent=text;
 $('#placement-live').textContent=published?'LIVE · '+name.toUpperCase():'NOT PUBLIC';
 $('#editor-preview-placement').textContent=name.toUpperCase();
 document.querySelectorAll('.placement-choice').forEach(el=>el.classList.toggle('is-selected',!!el.querySelector('input:checked')));
}
function populateForm(){if(!current)return;setVal('edit-title',current.title);setVal('edit-category',disciplineFor(current));setVal('edit-client-type',current.client_type);setVal('edit-eyebrow',current.eyebrow);setVal('edit-role',current.role);setVal('edit-site-url',current.site_url);setVal('edit-summary',current.summary);setVal('edit-approach',current.approach);setVal('edit-outcome',current.outcome);setVal('edit-tags',(current.tags||[]).join(', '));setVal('edit-cover',current.cover?.startsWith('https://')?current.cover:'');for(const [key,id,otherwise] of [['card_ratio','edit-card-ratio','auto'],['card_span','edit-card-span','auto'],['card_fit','edit-card-fit','cover'],['hero_ratio','edit-hero-ratio','original'],['hero_fit','edit-hero-fit','contain'],['gallery_layout','edit-gallery-layout','two'],['gallery_gap','edit-gallery-gap','normal']])$('#'+id).value=current[key]||otherwise;$('#edit-status').value=current.status||'draft';$('#edit-featured').checked=!!current.featured;locationTouched=false;setPlacement(locationFor(current),false);updateImage($('#cover-preview'),current.cover);renderMedia();renderStoryBlocks();renderPreview();$('#history-list').replaceChildren()}
function syncForm(){if(!current)return;current.title=getVal('edit-title');current.category=getVal('edit-category');current.site_section=selectedPlacement();current.client_type=getVal('edit-client-type');current.eyebrow=getVal('edit-eyebrow');current.role=getVal('edit-role');current.site_url=getVal('edit-site-url');current.summary=getVal('edit-summary');current.approach=getVal('edit-approach');current.outcome=getVal('edit-outcome');current.tags=getVal('edit-tags').split(',').map(x=>x.trim()).filter(Boolean);current.featured=$('#edit-featured').checked;current.status=$('#edit-status').value;for(const [key,id] of [['card_ratio','edit-card-ratio'],['card_span','edit-card-span'],['card_fit','edit-card-fit'],['hero_ratio','edit-hero-ratio'],['hero_fit','edit-hero-fit'],['gallery_layout','edit-gallery-layout'],['gallery_gap','edit-gallery-gap']])current[key]=$('#'+id).value;const cover=getVal('edit-cover');if(cover){if(!safeUrl(cover)){notice('Cover must be a secure HTTPS URL.',true);return}current.cover=cover}dirty=true;$('#save-state').textContent='Unsaved changes';$('#editor-heading').textContent=current.title||'Untitled project';renderPreview()}
function renderPreview(){if(!current)return;updateImage($('#editor-preview-img'),current.cover);$('#editor-preview-title').textContent=current.title||'Untitled';$('#editor-preview-category').textContent=disciplineFor(current).toUpperCase();updatePlacementPreview();$('#editor-preview-summary').textContent=(current.summary||'Project summary goes here.').slice(0,240);updateImage($('#cover-preview'),current.cover);const preview=$('#editor-preview-img');preview.classList.remove('preview-ratio-square','preview-ratio-portrait','preview-ratio-landscape');if(['square','portrait','landscape'].includes(current.card_ratio))preview.classList.add('preview-ratio-'+current.card_ratio);preview.style.objectFit=current.card_fit==='contain'?'contain':'cover'}
function renderMedia(){
 const list=$('#gallery-editor');list.replaceChildren();
 (current.media||[]).forEach((asset,index)=>{
  const row=document.createElement('div');row.className='gallery-row';
  const img=document.createElement('img');img.alt='';updateImage(img,asset.type==='image'?asset.src:current.cover);
  const middle=document.createElement('div');const caption=document.createElement('small');caption.textContent=(asset.type||'image').toUpperCase()+' · '+(asset.src||'').split('/').pop().slice(0,38);
  const input=fieldInput(asset.caption||'',val=>{asset.caption=val;markDirty()});input.placeholder='Caption / image description';middle.append(caption,input);
  const options=document.createElement('div');options.className='gallery-media-options';
  if(asset.type==='image'){
   options.append(fieldLabel('Image shape',fieldSelect(asset.ratio||'original',shapeOptions,val=>{asset.ratio=val;markDirty()})));
   options.append(fieldLabel('Fill behavior',fieldSelect(asset.fit||'contain',fitOptions,val=>{asset.fit=val;markDirty()})));
  }
  options.append(fieldLabel('Display width',fieldSelect(asset.span||'auto',[['auto','Normal column'],['full','Full-width gallery row']],val=>{asset.span=val;markDirty()})));
  middle.append(options);
  const actions=document.createElement('div');actions.className='row-actions';
  for(const [direction,delta] of [['up',-1],['down',1]]){
   const btn=document.createElement('button');btn.type='button';btn.innerHTML=REORDER_ICONS[direction];btn.setAttribute('aria-label',direction==='up'?'Move media earlier':'Move media later');btn.title='Reorder gallery media';btn.disabled=index+delta<0||index+delta>=current.media.length;
   btn.addEventListener('click',()=>{[current.media[index],current.media[index+delta]]=[current.media[index+delta],current.media[index]];markDirty();renderMedia()});actions.append(btn);
  }
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.className='remove';
  remove.addEventListener('click',()=>{current.media.splice(index,1);markDirty();renderMedia()});actions.append(remove);
  row.append(img,middle,actions);list.append(row);
 });
 if(!current.media?.length){const note=document.createElement('p');note.className='fineprint';note.textContent='No gallery media attached yet.';list.append(note)}
}
function renderStoryBlocks(){
 const list=$('#story-block-list');list.replaceChildren();if(!current)return;
 (current.story_blocks||[]).forEach((block,index)=>{
  const row=document.createElement('div');row.className='studio-block-row';
  const head=document.createElement('div');head.className='studio-block-heading';head.textContent=`${String(index+1).padStart(2,'0')} / ${block.type==='image'?'Image story':'Text story'}`;
  const remove=document.createElement('button');remove.textContent='Remove';remove.type='button';remove.addEventListener('click',()=>{current.story_blocks.splice(index,1);markDirty();renderStoryBlocks()});head.append(remove);row.append(head);
  row.append(fieldLabel(block.type==='image'?'Image caption':'Heading',fieldInput(block.heading||'',val=>{block.heading=val;markDirty()})));
  if(block.type==='image')row.append(fieldLabel('Image URL (HTTPS or /assets/...)',fieldInput(block.src||'',val=>{block.src=val;markDirty()})));
  else row.append(fieldLabel('Paragraph text',fieldInput(block.body||'',val=>{block.body=val;markDirty()},true)));
  const move=document.createElement('div');move.className='block-actions';
  for(const [text,delta] of [['Move up',-1],['Move down',1]]){
   const btn=document.createElement('button');btn.type='button';btn.textContent=text;btn.className='subtle-button';btn.disabled=index+delta<0||index+delta>=current.story_blocks.length;
   btn.addEventListener('click',()=>{[current.story_blocks[index],current.story_blocks[index+delta]]=[current.story_blocks[index+delta],current.story_blocks[index]];markDirty();renderStoryBlocks()});move.append(btn);
  }row.append(move);list.append(row);
 });
 if(!(current.story_blocks||[]).length){const note=document.createElement('p');note.className='fineprint';note.textContent='No additional case-study sections yet.';list.append(note)}
}
function renderCustomSectionEditors(){
 const list=$('#custom-sections-list');list.replaceChildren();const blocks=Array.isArray(settings.customSections)?settings.customSections:[];
 blocks.forEach((block,index)=>{
  const row=document.createElement('div');row.className='studio-block-row';
  const head=document.createElement('div');head.className='studio-block-heading';head.textContent=`${index+1} / WEBSITE SECTION`;
  const remove=document.createElement('button');remove.textContent='Remove';remove.type='button';remove.addEventListener('click',()=>{blocks.splice(index,1);renderCustomSectionEditors();$('#custom-sections-state').textContent='Unsaved changes. Publish website sections to apply.'});head.append(remove);row.append(head);
  const values=[['Small label','eyebrow',false],['Headline','title',false],['Description','body',true],['Image URL','image',false],['Link label','link_text',false],['Link URL (HTTPS)','link_url',false]];
  for(const [label,key,multi] of values)row.append(fieldLabel(label,fieldInput(block[key]||'',v=>{block[key]=v;$('#custom-sections-state').textContent='Unsaved changes. Publish website sections to apply.'},multi)));
  row.append(fieldLabel('Placement',fieldSelect(block.placement||'after-work',[['after-work','After selected work'],['before-concept','Before The Concept Lab'],['before-visual','Before Visual Studies'],['before-motion','Before Motion & Film'],['before-three','Before 3D & Interaction'],['before-studio','Before studio']],v=>{block.placement=v;$('#custom-sections-state').textContent='Unsaved changes.'})));
  row.append(fieldLabel('Layout',fieldSelect(block.layout||'split',[['split','Text + image side by side'],['stacked','Stacked / full width']],v=>{block.layout=v;$('#custom-sections-state').textContent='Unsaved changes.'})));
  row.append(fieldLabel('Color theme',fieldSelect(block.theme||'light',[['light','Warm cream / light'],['dark','Deep violet / dark']],v=>{block.theme=v;$('#custom-sections-state').textContent='Unsaved changes.'})));
  const moves=document.createElement('div');moves.className='block-actions';for(const [direction,d] of [['up',-1],['down',1]]){const btn=document.createElement('button');btn.type='button';btn.className='subtle-button';btn.innerHTML=REORDER_ICONS[direction]+' Move '+direction;btn.disabled=index+d<0||index+d>=blocks.length;btn.addEventListener('click',()=>{[blocks[index],blocks[index+d]]=[blocks[index+d],blocks[index]];renderCustomSectionEditors();$('#custom-sections-state').textContent='Unsaved changes.'});moves.append(btn)}row.append(moves);list.append(row);
 });
 if(!blocks.length){const empty=document.createElement('p');empty.className='fineprint';empty.textContent='No additional website sections yet. Add your first one below.';list.append(empty)}
}
async function saveCustomSections(){
 const sections=Array.isArray(settings.customSections)?settings.customSections:[];
 if(sections.some(section=>!section.title?.trim())){notice('Every website section needs a headline.',true);return}
 if(sections.some(section=>section.image&&!safeUrl(section.image)||section.link_url&&!safeUrl(section.link_url))){notice('Image and link URLs must be HTTPS or a valid local /assets/ path.',true);return}
 const result=await client.from('portfolio_settings').upsert({key:'customSections',value:sections},{onConflict:'key'});
 if(result.error){notice('Section publish failed: '+result.error.message,true);return}
 $('#custom-sections-state').textContent='Published! Your new sections are live after refreshing the site.';notice('Website sections published to Supabase.')
}

function fileType(file){const ext=(file.name.split('.').pop()||'').toLowerCase();if(['jpg','jpeg','png','webp','gif'].includes(ext))return 'image';if(['mp4','webm'].includes(ext))return 'video';if(ext==='pdf')return 'pdf';if(ext==='glb')return 'model';return ''}
const MEDIA_LIMIT_BYTES=50_000_000; // 50 MB (decimal)
const RESUMABLE_THRESHOLD_BYTES=6*1024*1024;

async function uploadResumable(file,path,contentType){
 const {data:{session},error:authError}=await client.auth.getSession();
 if(authError||!session?.access_token)throw Error('Your admin session has expired. Please sign in again.');
 const {Upload}=await import('https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/+esm');
 const cfg=window.PORTFOLIO_CONFIG||{};
 const base=(cfg.supabaseUrl||'').replace(/\/$/,'');
 const directBase=base.replace(/\.supabase\.co$/i,'.storage.supabase.co');
 if(!/^https:\/\/[a-z0-9-]+\.storage\.supabase\.co$/i.test(directBase))throw Error('Invalid Supabase Storage project URL.');
 const node=$('#upload-state');
 return new Promise((resolve,reject)=>{
  const upload=new Upload(file,{
   endpoint:directBase+'/storage/v1/upload/resumable',
   retryDelays:[0,3000,5000,10000,20000],
   headers:{authorization:'Bearer '+session.access_token,'x-upsert':'false'},
   uploadDataDuringCreation:true,
   removeFingerprintOnSuccess:true,
   metadata:{bucketName:'portfolio-media',objectName:path,contentType,cacheControl:'3600'},
   chunkSize:6*1024*1024,
   onProgress:(completed,total)=>{
    const pct=Math.min(100,Math.round(completed/total*100));
    node.textContent=`Uploading ${file.name}… ${pct}%`;
   },
   onError:(err)=>reject(err),
   onSuccess:()=>resolve()
  });
  upload.findPreviousUploads().then(previous=>{
   if(previous.length)upload.resumeFromPreviousUpload(previous[0]);
   upload.start();
  }).catch(reject);
 });
}

async function uploadOne(file,cover=false){
 const type=fileType(file);
 if(!type)throw Error('Unsupported file type: '+file.name);
 if(file.size>MEDIA_LIMIT_BYTES)throw Error(file.name+' exceeds the 50 MB upload limit on Supabase Free.');
 const safeName=file.name.replace(/[^a-z0-9.-]+/gi,'-').slice(-70);
 const path=`projects/${current.id}/${crypto.randomUUID()}-${safeName}`;
 const contentType=file.type||(type==='model'?'model/gltf-binary':'application/octet-stream');
 try{
  if(file.size>RESUMABLE_THRESHOLD_BYTES){
   await uploadResumable(file,path,contentType);
  }else{
   const result=await client.storage.from('portfolio-media').upload(path,file,{upsert:false,contentType});
   if(result.error)throw result.error;
  }
 }catch(error){
  throw Error('Upload failed. Check that the Supabase global and portfolio-media bucket limits are both 50 MB, then retry. Details: '+(error.message||String(error)));
 }
 const urlResult=client.storage.from('portfolio-media').getPublicUrl(path);
 const url=urlResult.data?.publicUrl;
 if(!safeUrl(url))throw Error('Storage upload succeeded but no public URL was returned');
 if(cover){current.cover=url;setVal('edit-cover',url)}
 else{
  current.media??=[];
  current.media.push({type,src:url,caption:''});
  if(!safeUrl(current.cover)&&type==='image'){current.cover=url;setVal('edit-cover',url)}
  if(type==='model')current.model=url;
 }
 dirty=true;renderMedia();renderPreview();$('#save-state').textContent='Upload complete. Save to publish metadata.';
}
async function uploadFiles(files,cover){if(!current||!files?.length)return;const node=$('#upload-state');for(let i=0;i<files.length;i++){node.textContent=`Uploading ${i+1} of ${files.length}: ${files[i].name}…`;try{await uploadOne(files[i],cover);node.textContent=`Uploaded ${i+1} of ${files.length}. Remember to save.`}catch(e){console.error(e);node.textContent='Upload failed: '+e.message;notice(node.textContent,true);return}}notice('Media uploaded. Save changes to attach it to the live project.')}
function projectPayload(p){const copy=cleanProject(p);delete copy.sort_order;return copy}
async function saveProject(){if(!current)return;syncForm();if(!current.title){notice('Project title is required.',true);return}if(current.site_url&&!safeUrl(current.site_url)){notice('Website URL must use HTTPS.',true);return}if(current.status==='published'&&!safeUrl(current.cover)){notice('Published projects require a valid cover image.',true);return}if(current.status==='published'&&current.category==='Experiments'&&!safeUrl(current.model)){notice('3D experiments need a real GLB model to publish.',true);return}if(current.status==='published'&&current.category==='Motion'&&!current.media?.some(m=>m.type==='video'&&safeUrl(m.src))){notice('Motion projects need a playable video to publish.',true);return}const btn=$('#save-project');btn.disabled=true;$('#save-state').textContent='Saving to database…';try{const previous=projects.find(p=>p.id===current.id);if(previous&&persistedIds.has(current.id)){const rev=await client.from('portfolio_revisions').insert({project_id:current.id,previous_data:projectPayload(previous),previous_status:previous.status,previous_order:previous.sort_order});if(rev.error)throw rev.error}const maxOrder=projects.reduce((m,p)=>Math.max(m,p.sort_order??0),0)+1;const order=current.sort_order??maxOrder;const result=await client.from('portfolio_projects').upsert({id:current.id,data:projectPayload(current),status:current.status,sort_order:order},{onConflict:'id'}).select('id').single();if(result.error)throw result.error;persistedIds.add(current.id);current.sort_order=order;const index=projects.findIndex(p=>p.id===current.id);if(index===-1)projects.push(cleanProject(current));else projects[index]=cleanProject(current);dirty=false;renderList();$('#save-state').textContent=current.status==='published'?'Published · saved to database':'Saved as '+current.status;notice('Saved to Supabase. '+(current.status==='published'?'Live site is now updated.':'This record is not public.'))}catch(e){console.error(e);$('#save-state').textContent='Save failed';notice('Save failed: '+e.message,true)}finally{btn.disabled=false}}
async function addProject(){if(dirty&&!confirm('Discard unsaved changes?'))return;const id='project-'+crypto.randomUUID().slice(0,8);const maxOrder=projects.reduce((m,p)=>Math.max(m,p.sort_order??0),0)+1;const p={id,slug:id,title:'New project',eyebrow:'CREATIVE WORK',category:'Brand Identity',site_section:'work',client_type:'Creative work',role:'',summary:'',approach:'',outcome:'',cover:'',media:[],tags:[],feature_rank:99,featured:false,status:'draft',sort_order:maxOrder};projects.push(p);selectProject(id);dirty=true;$('#save-state').textContent='New draft · not saved yet';$('#edit-title').focus()}
async function orderProject(direction){if(!current)return;const idx=projects.findIndex(p=>p.id===current.id);const other=projects[idx+direction];if(!other)return;if(dirty&&!confirm('Save your changes before reordering?'))return;const currentOrder=current.sort_order;const otherOrder=other.sort_order;const a=await client.from('portfolio_projects').update({sort_order:otherOrder}).eq('id',current.id);if(a.error){notice(a.error.message,true);return}const b=await client.from('portfolio_projects').update({sort_order:currentOrder}).eq('id',other.id);if(b.error){notice('One reorder step failed. Refresh to check the saved order.',true);await loadData();renderList();return}current.sort_order=otherOrder;other.sort_order=currentOrder;projects.sort((a,b)=>a.sort_order-b.sort_order);renderList();notice('Project order updated.')}
async function archiveProject(){if(!current)return;$('#edit-status').value='archived';await saveProject()}
async function deleteProject(){if(!current)return;const phrase=prompt('To permanently delete this project record, type DELETE. Uploaded media files will NOT be removed.');if(phrase!=='DELETE')return;try{const res=await client.from('portfolio_projects').delete().eq('id',current.id);if(res.error)throw res.error;projects=projects.filter(p=>p.id!==current.id);persistedIds.delete(current.id);selectedId=null;current=null;dirty=false;renderList();$('#editor-content').hidden=true;$('#editor-empty').hidden=false;$('#editor-heading').textContent='Select a project';notice('Project record deleted. Stored media was left intact.')}catch(e){notice('Delete failed: '+e.message,true)}}
async function history(){if(!current)return;const res=await client.from('portfolio_revisions').select('id,previous_data,previous_status,previous_order,created_at').eq('project_id',current.id).order('created_at',{ascending:false}).limit(10);if(res.error){notice(res.error.message,true);return}const parent=$('#history-list');parent.replaceChildren();if(!res.data.length){parent.textContent='No prior saved versions';return}res.data.forEach(rev=>{const row=document.createElement('div');row.className='history-row';const label=document.createElement('span');label.textContent=new Date(rev.created_at).toLocaleString()+' / '+rev.previous_status;const btn=document.createElement('button');btn.type='button';btn.textContent='Restore to editor';btn.addEventListener('click',()=>{if(!confirm('Load this older version into the editor? You will still need to select Save changes.'))return;current={...rev.previous_data,id:current.id,status:rev.previous_status,sort_order:current.sort_order};dirty=true;populateForm();$('#save-state').textContent='Restored into editor · save to keep';notice('Historical version loaded. Save changes to publish it.')});row.append(label,btn);parent.append(row)})}
const CLIENT_COPY_DEFAULTS={clientWorkLabel:'03 / CLIENT WORK · DESIGN IN PRACTICE',clientWorkHeading:'Designed for the brief.',clientWorkEmphasis:'Made to stand out.',clientWorkDescription:'From brand identities and promotional campaigns to flyers, advertising, and everyday creative assets. A collection of commissioned work where strategy meets visual storytelling, tailored to each client\'s audience, personality, and goals.'};
function loadSettingsForm(){for(const id of ['subtitle','about','aboutExtra','email','instagram','linkedin'])setVal('setting-'+id,settings[id]||'');for(const key of Object.keys(CLIENT_COPY_DEFAULTS))setVal('setting-'+key,settings[key]||CLIENT_COPY_DEFAULTS[key])} 
async function saveSettings(){const entries=['subtitle','about','aboutExtra','email','instagram','linkedin',...Object.keys(CLIENT_COPY_DEFAULTS)].map(key=>({key,value:getVal('setting-'+key)}));if(entries.find(e=>['instagram','linkedin'].includes(e.key)&&e.value&&!safeUrl(e.value))){notice('Social links must use secure HTTPS URLs.',true);return}const res=await client.from('portfolio_settings').upsert(entries,{onConflict:'key'});if(res.error){notice(res.error.message,true);return}entries.forEach(e=>settings[e.key]=e.value);$('#settings-save-state').textContent='Saved to Supabase · updates are public';notice('Studio copy saved.')}
function exportBackup(){const backup={exportedAt:new Date().toISOString(),projects,settings};const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='the-m-prnt-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}

// V2.5: independent, publishable presentation settings; existing projects are untouched.
const ARRANGE_DEFAULTS={featured:'compact',digital:'editorial',client:'compact',concept:'compact',visual:'compact',motion:'editorial',three:'editorial',archive:'compact'};
let arrangeDraftOrder={},arrangeDraftModes={};
function arrangerProjects(section){
 const visible=projects.filter(p=>p.status==='published' && (section==='featured'?!!p.featured:section==='archive'?(!p.featured&&['work','archive'].includes(locationFor(p))):locationFor(p)===section));
 const sequence=arrangeDraftOrder[section]||[];
 if(!sequence.length)return visible;
 const ranks=new Map(sequence.map((id,i)=>[id,i]));
 return visible.map((p,i)=>({p,i})).sort((a,b)=>(ranks.has(a.p.id)?ranks.get(a.p.id):999999)-(ranks.has(b.p.id)?ranks.get(b.p.id):999999)||a.i-b.i).map(x=>x.p);
}
function showArrange(){
 if(dirty&&!confirm('You have unsaved project edits. Continue to the gallery arranger without saving them?'))return;
 arrangeDraftOrder=structuredClone(settings.galleryOrderV25||{});
 arrangeDraftModes={...ARRANGE_DEFAULTS,...(settings.galleryModesV25||{})};
 $('#arrange-section').value='featured';renderArranger();$('#arrange-dialog').showModal();
}
function renderArranger(){
 const section=$('#arrange-section').value;
 $('#arrange-mode').value=arrangeDraftModes[section]||ARRANGE_DEFAULTS[section];
 const descriptions={compact:'Compact layout: cards keep their own image proportions and stack closely, without empty grid rows.',editorial:'Editorial layout: your existing art-directed asymmetric arrangement.',carousel:'Horizontal gallery: visitors swipe or use arrow buttons to explore.'};
 $('#arrange-explanation').textContent=descriptions[$('#arrange-mode').value];
 $('#arrange-status').textContent='Drag cards to reorder, or use the arrow buttons. Save to publish changes.';
 const list=$('#arrange-list');list.replaceChildren();
 const arr=arrangerProjects(section);
 if(!arr.length){const msg=document.createElement('p');msg.className='arrange-empty';msg.textContent='No published projects in this section yet. Assign and publish projects in the editor first.';list.append(msg);return}
 arr.forEach((p,i)=>{
  const row=document.createElement('div');row.className='arrange-item';row.dataset.id=p.id;row.setAttribute('role','listitem');row.draggable=true;
  const handle=document.createElement('span');handle.className='arrange-handle';handle.textContent='⋮⋮';handle.setAttribute('aria-hidden','true');
  const thumb=document.createElement('img');updateImage(thumb,p.cover);thumb.alt='';
  const title=document.createElement('div');title.className='arrange-item-name';const strong=document.createElement('strong');strong.textContent=p.title||'Untitled';const info=document.createElement('small');info.textContent=disciplineFor(p);title.append(strong,info);
  const buttons=document.createElement('div');buttons.className='arrange-item-buttons';
  for(const [diff,label,symbol] of [[-1,'Move earlier','↑'],[1,'Move later','↓']]){
   const button=document.createElement('button');button.type='button';button.textContent=symbol;button.setAttribute('aria-label',label+': '+p.title);button.disabled=(i+diff<0||i+diff>=arr.length);
   button.addEventListener('click',()=>repositionArranger(p.id,i+diff));buttons.append(button)
  }
  row.append(handle,thumb,title,buttons);
  row.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',p.id);row.classList.add('is-dragging')});
  row.addEventListener('dragend',()=>{row.classList.remove('is-dragging');list.querySelectorAll('.is-target').forEach(el=>el.classList.remove('is-target'))});
  row.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';row.classList.add('is-target')});
  row.addEventListener('dragleave',()=>row.classList.remove('is-target'));
  row.addEventListener('drop',e=>{e.preventDefault();row.classList.remove('is-target');const id=e.dataTransfer.getData('text/plain');if(id&&id!==p.id)repositionArranger(id,i)});
  list.append(row)
 });
}
function repositionArranger(id,index){
 const section=$('#arrange-section').value;const ids=arrangerProjects(section).map(p=>p.id);
 const old=ids.indexOf(id);if(old<0)return;
 ids.splice(old,1);ids.splice(Math.max(0,Math.min(index,ids.length)),0,id);
 arrangeDraftOrder[section]=ids;
 renderArranger();$('#arrange-status').textContent='New order ready. Click Save layout & order to publish.';
}
async function saveArranger(){
 const btn=$('#save-arrange');btn.disabled=true;$('#arrange-status').textContent='Saving layout to Supabase…';
 try{
  const result=await client.from('portfolio_settings').upsert([
   {key:'galleryOrderV25',value:arrangeDraftOrder},
   {key:'galleryModesV25',value:arrangeDraftModes}
  ],{onConflict:'key'});
  if(result.error)throw result.error;
  settings.galleryOrderV25=structuredClone(arrangeDraftOrder);settings.galleryModesV25={...arrangeDraftModes};
  $('#arrange-status').textContent='Published! Refresh the public portfolio to see the new arrangement.';
  notice('Your gallery order and layout were saved to Supabase.');
 }catch(e){console.error(e);$('#arrange-status').textContent='Could not save: '+e.message;notice('Gallery settings were not saved.',true)}
 finally{btn.disabled=false}
}

function attachListeners(){
 $('#login-form').addEventListener('submit',async e=>{e.preventDefault();authMessage('Signing in…');$('#login-btn').disabled=true;try{const res=await client.auth.signInWithPassword({email:getVal('login-email'),password:getVal('login-password')});if(res.error)throw res.error;if(!(await checkAuthorization())){await client.auth.signOut();throw Error('This account is not authorized as a portfolio admin.')}authMessage('');await openDashboard()}catch(err){authMessage(err.message||'Login failed')}finally{$('#login-btn').disabled=false}});
 $('#signout').addEventListener('click',async()=>{if(dirty&&!confirm('Discard unsaved edits?'))return;await client.auth.signOut();current=null;show('login-view')});
 $('#project-search').addEventListener('input',renderList);$('#library-placement-filter').addEventListener('change',renderList);$$('.sidebar-filters button').forEach(b=>b.addEventListener('click',()=>{filterStatus=b.dataset.status;$$('.sidebar-filters button').forEach(x=>x.classList.toggle('active',x===b));renderList()}));
 $('#add-text-block').addEventListener('click',()=>{if(!current)return;current.story_blocks??=[];current.story_blocks.push({type:'text',heading:'',body:''});markDirty();renderStoryBlocks()});$('#add-image-block').addEventListener('click',()=>{if(!current)return;current.story_blocks??=[];current.story_blocks.push({type:'image',heading:'',src:''});markDirty();renderStoryBlocks()});
 $('#open-arrange').addEventListener('click',showArrange);
 $('#close-arrange').addEventListener('click',()=>$('#arrange-dialog').close());
 $('#arrange-dialog').addEventListener('click',e=>{if(e.target===$('#arrange-dialog'))$('#arrange-dialog').close()});
 $('#arrange-section').addEventListener('change',renderArranger);
 $('#arrange-mode').addEventListener('change',()=>{arrangeDraftModes[$('#arrange-section').value]=$('#arrange-mode').value;renderArranger();$('#arrange-status').textContent='New layout ready. Save to publish.'});
 $('#save-arrange').addEventListener('click',saveArranger);
 $('#add-project').addEventListener('click',addProject);$('#save-project').addEventListener('click',saveProject);
 $$('input[id^="edit-"],textarea[id^="edit-"],select[id^="edit-"]').forEach(input=>{if(input.id==='edit-cover')return;input.addEventListener('input',syncForm);input.addEventListener('change',syncForm)});
 document.querySelectorAll('input[name="site-section"]').forEach(radio=>radio.addEventListener('change',()=>{setPlacement(radio.value);syncForm()}));
 $('#edit-category').addEventListener('change',()=>{if(!locationTouched)setPlacement(suggestedLocation(getVal('edit-category')),false);syncForm()});
 $('#edit-cover').addEventListener('change',syncForm);
 $('#cover-upload').addEventListener('change',async e=>{await uploadFiles([...e.target.files],true);e.target.value=''});$('#gallery-upload').addEventListener('change',async e=>{await uploadFiles([...e.target.files],false);e.target.value=''});
 $('#add-url-media').addEventListener('click',()=>{if(!current)return;const url=prompt('Paste a secure HTTPS media URL:');if(!url)return;if(!safeUrl(url)){notice('Please use a secure HTTPS URL.',true);return}const type=prompt('Type: image, video, pdf, or model?','image');if(!['image','video','pdf','model'].includes(type)){notice('Unsupported type',true);return}current.media??=[];current.media.push({type,src:url,caption:''});if(type==='model')current.model=url;dirty=true;renderMedia();notice('Media URL added. Save changes to publish.')});
 $('#archive-project').addEventListener('click',archiveProject);$('#delete-project').addEventListener('click',deleteProject);$('#view-history').addEventListener('click',history);$('#export-data').addEventListener('click',exportBackup);
 $('#toggle-custom-sections').addEventListener('click',()=>{const pane=$('#custom-sections-content');pane.hidden=!pane.hidden;$('#toggle-custom-sections').setAttribute('aria-expanded',String(!pane.hidden))});$('#add-site-section').addEventListener('click',()=>{settings.customSections??=[];settings.customSections.push({id:crypto.randomUUID(),eyebrow:'STUDIO / NEW WORK',title:'',body:'',image:'',link_text:'',link_url:'',placement:'after-work',layout:'split',theme:'light'});renderCustomSectionEditors();$('#custom-sections-state').textContent='Unsaved changes.'});$('#save-site-sections').addEventListener('click',saveCustomSections);
 $('#toggle-settings').addEventListener('click',()=>{$('#settings-content').hidden=!$('#settings-content').hidden});$('#save-settings').addEventListener('click',saveSettings);
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
}
attachListeners();begin();
