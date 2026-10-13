/* Public Supabase project key is intended for browsers. Access control is enforced in SQL RLS. */
let clientPromise;
export function hasBackend(){
  const cfg=window.PORTFOLIO_CONFIG||{};
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.supabaseUrl||'') && !!cfg.supabaseAnonKey;
}
export async function getClient(){
  if(!hasBackend())return null;
  if(!clientPromise){
    clientPromise=import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm')
      .then(({createClient})=>createClient(window.PORTFOLIO_CONFIG.supabaseUrl,window.PORTFOLIO_CONFIG.supabaseAnonKey,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
      })).catch(error=>{clientPromise=undefined;throw error});
  }
  return clientPromise;
}
export async function getPublicData(){
  const fallback=await fetch('/data/projects.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Bundled portfolio is unavailable');return r.json()});
  if(!hasBackend())return {...fallback,source:'bundle'};
  try{
    const client=await getClient();
    const [ps,ss]=await Promise.all([
      client.from('portfolio_projects').select('id,data,status,sort_order').eq('status','published').order('sort_order',{ascending:true}),
      client.from('portfolio_settings').select('key,value')
    ]);
    if(ps.error||ss.error)throw ps.error||ss.error;
    // Database is deliberately optional until the initial seed script is imported.
    if(!ps.data.length)return {...fallback,source:'bundle'};
    const settings={...fallback.settings};
    (ss.data||[]).forEach(row=>{settings[row.key]=row.value});
    const projects=ps.data.map(row=>({...row.data,id:row.id,status:row.status,sort_order:row.sort_order}));
    return {settings,projects,source:'supabase'};
  }catch(err){console.warn('CMS connection failed; showing bundled public snapshot:',err);return {...fallback,source:'offline-fallback'}}
}
export function safeUrl(input){
  if(typeof input!=='string'||!input.trim())return '';
  const value=input.trim();
  if(value.startsWith('/')&&!value.startsWith('//'))return value;
  if(/^https:\/\//i.test(value))return value;
  return '';
}
export function escapeHtml(s=''){
 return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function escapeAttr(s=''){return escapeHtml(s)}
