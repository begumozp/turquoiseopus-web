import {fail,validateDocument,publicDocument,allowedMedia,bulkPreview,applyBulk,mediaType,imageSize} from './model.mjs';
import initialContent from './initial-content.mjs';
const COOKIE='opus_session',REFRESH='opus_refresh';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Vary':'Cookie'};
export function json(body,status=200,extra={}){return new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});}
function cookies(r){return Object.fromEntries((r.headers.get('Cookie')||'').split(';').map(x=>x.trim().split(/=(.*)/s)).filter(x=>x.length>1));}
function cookie(name,value,age){return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
function sessionResponse(data,result){const r=json(result);r.headers.append('Set-Cookie',cookie(COOKIE,data.access_token,Math.min(data.expires_in||3600,3600)));r.headers.append('Set-Cookie',cookie(REFRESH,data.refresh_token,604800));return r;}
const result=async r=>{const d=await r.json().catch(()=>null);if(!r.ok)fail(r.status===409?'VERSION_CONFLICT':d?.message||'Servis isteği başarısız.',r.status===400&&d?.message?.includes('VERSION_CONFLICT')?409:502);return d;};
export function backend(env,fetcher=fetch){
 const base=env.SUPABASE_URL?.replace(/\/$/,'');if(!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/.test(base||'')||!env.SUPABASE_SERVICE_ROLE_KEY||!env.SUPABASE_ANON_KEY)fail('Sunucu kurulumu henüz tamamlanmadı.',503);
 const call=async(path,init={})=>result(await fetcher(base+path,{...init,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...init.headers}}));
 return {base,call,fetcher,auth:async(path,init={})=>result(await fetcher(base+'/auth/v1/'+path,{...init,headers:{apikey:env.SUPABASE_ANON_KEY,'Content-Type':'application/json',...init.headers}})),state:async(fields='*')=>{const a=await call('/rest/v1/opus_state?id=eq.1&select='+fields);if(!a[0])fail('İçerik veritabanı hazır değil.',503);return a[0];}};
}
export async function adminUser(request,env,b){const token=decodeURIComponent(cookies(request)[COOKIE]||'');if(!token)fail('Yönetici girişi gerekli.',401);let u;try{u=await b.auth('user',{headers:{Authorization:'Bearer '+token}});}catch{fail('Oturum sona erdi. Yeniden giriş yapın.',401);}if(!env.ADMIN_USER_ID||u.id!==env.ADMIN_USER_ID||u.email?.toLowerCase()!==(env.ADMIN_EMAIL||'info@turquoiseopus.art').toLowerCase()||!u.email_confirmed_at)fail('Bu hesap yetkili değil.',403);return u;}
async function readLimited(request,max){if(Number(request.headers.get('Content-Length'))>max)fail('İstek fazla büyük.',413);if(!request.body)return new Uint8Array();const reader=request.body.getReader(),chunks=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();fail('İstek fazla büyük.',413);}chunks.push(value);}const out=new Uint8Array(length);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;}
async function body(request){const n=Number(request.headers.get('Content-Length'));if(n>2100000)fail('İstek fazla büyük.',413);const s=new TextDecoder().decode(await readLimited(request,2100000));if(s.length>2100000)fail('İstek fazla büyük.',413);try{return JSON.parse(s);}catch{fail('JSON okunamadı.');}}
async function rate(request,b,name,max,seconds){const ip=request.headers.get('CF-Connecting-IP')||'local';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(name+ip));const key=Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');const ok=await b.call('/rest/v1/rpc/opus_rate',{method:'POST',body:JSON.stringify({bucket:key,window_seconds:seconds,maximum:max})});if(!ok)fail('Çok fazla deneme. Lütfen biraz bekleyin.',429);}
export async function handle(request,env,fetcher=fetch){
 try{
 const url=new URL(request.url),path=url.pathname.replace(/^\/api\/?/,'').replace(/\/$/,''),method=request.method;
 if(method!=='GET'&&method!=='HEAD'&&request.headers.get('Origin')!==url.origin)fail('Origin reddedildi.',403);
 if(path==='config'&&method==='GET')return json({adminEmail:env.ADMIN_EMAIL||'info@turquoiseopus.art',turnstileSiteKey:env.TURNSTILE_SITE_KEY||''});
 const b=backend(env,fetcher);
 if(path==='login'&&method==='POST'){
  await rate(request,b,'login',8,900);const d=await body(request);if(d.email?.toLowerCase()!==(env.ADMIN_EMAIL||'info@turquoiseopus.art')||typeof d.password!=='string')fail('E-posta veya şifre hatalı.',401);
  if(env.TURNSTILE_SECRET_KEY){const check=await result(await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:d.challenge||'',remoteip:request.headers.get('CF-Connecting-IP')||''})}));if(!check.success)fail('Güvenlik doğrulaması gerekli.',403);}
  let auth;try{auth=await b.auth('token?grant_type=password',{method:'POST',body:JSON.stringify({email:d.email,password:d.password})});}catch{fail('E-posta veya şifre hatalı.',401);}
  if(auth.user?.id!==env.ADMIN_USER_ID||!auth.user?.email_confirmed_at)fail('Bu hesap yetkili değil.',403);return sessionResponse(auth,{ok:true});
 }
 if(path==='refresh'&&method==='POST'){
  const rt=decodeURIComponent(cookies(request)[REFRESH]||'');if(!rt)fail('Oturum sona erdi.',401);
  let a;try{a=await b.auth('token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:rt})});}catch{fail('Yeniden giriş yapın.',401);}
  if(a.user?.id!==env.ADMIN_USER_ID||a.user?.email?.toLowerCase()!==(env.ADMIN_EMAIL||'info@turquoiseopus.art'))fail('Yetkisiz hesap.',403);return sessionResponse(a,{ok:true});
 }
 if(path==='public'&&method==='GET'){const s=await b.state('published,images_hidden,version');return json({...publicDocument(s.published,s.images_hidden!==false),version:s.version});}
 if(path==='status'&&method==='GET'){const s=await b.state('images_hidden,version');return json({imagesHidden:s.images_hidden!==false,version:s.version});}
 if(path.startsWith('media/')&&(method==='GET'||method==='HEAD')){
  const id=path.slice(6);if(!/^[a-f0-9-]{36}$/.test(id))fail('Görsel bulunamadı.',404);
  const preview=url.searchParams.get('preview')==='1',s=await b.state(preview?'images_hidden':'images_hidden,published');let doc;
  if(preview){await adminUser(request,env,b);}else{if(s.images_hidden!==false)fail('Görseller şu an gizli.',404);doc=publicDocument(s.published,false);if(!allowedMedia(doc).has(id))fail('Görsel bulunamadı.',404);}
  const records=await b.call('/rest/v1/opus_media?id=eq.'+id+'&select=*');const m=records[0];if(!m)fail('Görsel bulunamadı.',404);
  const r=await fetcher(b.base+'/storage/v1/object/authenticated/opus-private/'+m.path,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY},cache:'no-store'});
  if(!r.ok)fail('Görsel okunamadı.',404);
  return new Response(method==='HEAD'?null:r.body,{headers:{'Content-Type':m.mime,'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Cloudflare-CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Disposition':'inline','Vary':'Cookie'}});
 }
 await adminUser(request,env,b);
 if(path==='logout'&&method==='POST'){const token=decodeURIComponent(cookies(request)[COOKIE]||'');await b.auth('logout',{method:'POST',headers:{Authorization:'Bearer '+token}}).catch(()=>{});const r=json({ok:true});r.headers.append('Set-Cookie',cookie(COOKIE,'',0));r.headers.append('Set-Cookie',cookie(REFRESH,'',0));return r;}
 if(path==='state'&&method==='GET')return json(await b.state());
 if(path==='initialize'&&method==='POST'){
  const d=await body(request),s=await b.state();
  if(d.version!==s.version)fail('Başka bir sekmede değişiklik var. Yeniden yükleyin.',409);
  if(s.draft&&Object.keys(s.draft).length)fail('Taslakta zaten içerik var. Başlangıç içeriği üzerine yazılmadı.',409);
  const document=structuredClone(initialContent);document.pages.artworks=false;validateDocument(document);
  const media=await b.call('/rest/v1/opus_media?select=id,watermarked'),ids=new Set(media.filter(m=>m.watermarked).map(m=>m.id));
  const missing=[...allowedMedia(document)].filter(id=>!ids.has(id));
  if(missing.length)fail(`${missing.length} fotoğraf eksik veya filigran onaysız. Terminal'deki aktarım komutunu tekrar çalıştırın; yüklenen dosyalar atlanır.`);
  const version=await b.call('/rest/v1/rpc/opus_commit',{method:'POST',body:JSON.stringify({expected:s.version,next_draft:document,publish_now:false,label:'initialize'})});
  return json({version,artworks:document.artworks.length});
 }
 if(path==='preview'&&method==='GET'){const s=await b.state();return json({...publicDocument(s.draft,false),preview:true});}
 if(path==='media'&&method==='GET')return json(await b.call('/rest/v1/opus_media?select=id,name,mime,bytes,watermarked,created_at&order=created_at.desc'));
 if(path==='media'&&method==='POST'){
  if(Number(request.headers.get('Content-Length'))>8388608)fail('En fazla 8 MB yükleyin.',413);
  const bytes=await readLimited(request,8388608);if(!bytes.length||bytes.length>8388608)fail('En fazla 8 MB yükleyin.',413);const mime=mediaType(bytes);if(!mime)fail('Yalnız JPEG, PNG ve WebP kabul edilir.');const size=imageSize(bytes);if(!size||size.width<1||size.height<1||Math.max(size.width,size.height)>3000)fail('Geçerli web görseli yükleyin; uzun kenar en fazla 3000 px.');
  if(request.headers.get('X-Watermarked')!=='true')fail('Filigran kontrolünü onaylayın.');
  const requested=request.headers.get('X-Media-ID');if(requested&&!/^[a-f0-9-]{36}$/.test(requested))fail('Medya kimliği geçersiz.');const id=requested||crypto.randomUUID(),ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime],p=id+'.'+ext;
  const r=await fetcher(b.base+'/storage/v1/object/opus-private/'+p,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':mime,'x-upsert':'false','cache-control':'no-store'},body:bytes});await result(r);
  await b.call('/rest/v1/opus_media',{method:'POST',body:JSON.stringify({id,path:p,name:decodeURIComponent(request.headers.get('X-Filename')||'image').normalize('NFC').replace(/[^\p{L}\p{N}_. -]/gu,'_').slice(0,180),mime,bytes:bytes.length,watermarked:true})});return json({id},201);
 }
 if(path==='visibility'&&method==='POST'){const d=await body(request);if(typeof d.hidden!=='boolean')fail('Gizlilik değeri geçersiz.');if(!d.hidden&&d.confirm!=='ENGINEER_APPROVED')fail('Mühendis onayı teyidi gerekli.');await b.call('/rest/v1/opus_state?id=eq.1',{method:'PATCH',body:JSON.stringify({images_hidden:d.hidden})});return json({imagesHidden:d.hidden});}
 if(['save','publish','restore'].includes(path)&&method==='POST'){
  const d=await body(request),s=await b.state();if(d.version!==s.version)fail('Başka bir sekmede değişiklik var. Yeniden yükleyin.',409);
  let document=d.document,label=path;
  if(path==='restore'){const rev=await b.call('/rest/v1/opus_revisions?id=eq.'+Number(d.revision)+'&select=draft');if(!rev[0])fail('Sürüm bulunamadı.',404);document=rev[0].draft;}
  validateDocument(document);
  const media=await b.call('/rest/v1/opus_media?select=id,watermarked');const ms=new Set(media.filter(m=>m.watermarked).map(m=>m.id));for(const id of allowedMedia(document))if(!ms.has(id))fail('Bazı görseller yüklenmemiş veya filigran onayı eksik.');
  const v=await b.call('/rest/v1/rpc/opus_commit',{method:'POST',body:JSON.stringify({expected:s.version,next_draft:document,publish_now:path==='publish',label})});return json({version:v});
 }
 if(path==='bulk-preview'&&method==='POST'){const d=await body(request),s=await b.state();return json({...bulkPreview(s.draft,d.collection,d.size,d.price),version:s.version});}
 if(path==='bulk-apply'&&method==='POST'){const d=await body(request),s=await b.state();if(d.version!==s.version)fail('Fiyatlar değişti; yeniden önizleyin.',409);const preview=bulkPreview(s.draft,d.collection,d.size,d.price);const next=applyBulk(s.draft,preview);const v=await b.call('/rest/v1/rpc/opus_commit',{method:'POST',body:JSON.stringify({expected:s.version,next_draft:next,publish_now:false,label:'bulk-price'})});return json({version:v,changed:preview.targets.length});}
 if(path==='revisions'&&method==='GET')return json(await b.call('/rest/v1/opus_revisions?select=id,version,action,created_at&version=gt.0&order=id.desc&limit=100'));
 if(path==='backup'&&method==='GET'){const s=await b.state();return json({format:'opus-backup-v1',exported:new Date().toISOString(),state:s,media:await b.call('/rest/v1/opus_media?select=*')});}
 if(path==='password'&&method==='POST'){const d=await body(request);if(typeof d.password!=='string'||d.password.length<14)fail('En az 14 karakter kullanın.');await b.auth('user',{method:'PUT',headers:{Authorization:'Bearer '+decodeURIComponent(cookies(request)[COOKIE])},body:JSON.stringify({password:d.password})});return json({ok:true});}
 fail('İşlem bulunamadı.',404);
 }catch(e){return json({error:e.status?e.message:'Beklenmeyen sunucu hatası.'},e.status||500);}
}
