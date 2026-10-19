// No credentials are written to disk. Login cookies remain in memory.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const origin=process.env.OPUS_SITE?.replace(/\/$/,'');
if(!origin?.startsWith('https://')||!process.env.OPUS_PASSWORD)throw new Error('Set OPUS_SITE=https://… and OPUS_PASSWORD in your shell.');
let jar=new Map();
async function call(route,init={}){const r=await fetch(origin+'/api/'+route,{...init,headers:{Origin:origin,Cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),'Content-Type':'application/json',...init.headers}});for(const c of r.headers.getSetCookie()){const [k,v]=c.split(';')[0].split(/=(.*)/s);jar.set(k,v);}if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(route+': '+(j.error||r.status));}return r;}
await call('login',{method:'POST',body:JSON.stringify({email:'info@turquoiseopus.art',password:process.env.OPUS_PASSWORD,challenge:process.env.OPUS_CHALLENGE||''})});
const command=process.argv[2]||'import';
try{
 if(command==='backup'){
  const dir=path.resolve(process.argv[3]||'backups/'+new Date().toISOString().slice(0,10));await mkdir(dir,{recursive:true});const j=await (await call('backup')).json();await writeFile(path.join(dir,'backup.json'),JSON.stringify(j,null,2));for(const m of j.media){const r=await call('media/'+m.id+'?preview=1');await writeFile(path.join(dir,m.path),new Uint8Array(await r.arrayBuffer()));console.log('Backed up',m.name);}console.log('Complete backup:',dir);
 }else if(command==='restore'){
  const dir=path.resolve(process.argv[3]);const j=JSON.parse(await readFile(path.join(dir,'backup.json'),'utf8'));if(j.format!=='opus-backup-v1')throw new Error('Invalid backup');await call('visibility',{method:'POST',body:JSON.stringify({hidden:true})});const existing=await (await call('media')).json();const ids=new Set(existing.map(x=>x.id));for(const m of j.media){if(ids.has(m.id))continue;await call('media',{method:'POST',headers:{'Content-Type':m.mime,'X-Watermarked':'true','X-Media-ID':m.id,'X-Filename':encodeURIComponent(m.name)},body:await readFile(path.join(dir,m.path))});}const s=await (await call('state')).json();await call('save',{method:'POST',body:JSON.stringify({version:s.version,document:j.state.draft})});console.log('Restored draft. Images remain HIDDEN. Review preview and publish manually.');
 }else{
  const dir=path.resolve(process.argv[3]||'../private-media');const manifest=JSON.parse(await readFile(path.join(dir,'manifest.json'),'utf8'));const existing=await (await call('media')).json();const ids=new Set(existing.map(x=>x.id));for(const m of manifest){if(ids.has(m.id)){console.log('Already imported:',m.file);continue;}const fileBytes=await readFile(path.join(dir,m.file));if(m.sha256&&createHash('sha256').update(fileBytes).digest('hex')!==m.sha256)throw new Error('SHA256 mismatch: '+m.file);const ext=path.extname(m.file).toLowerCase();await call('media',{method:'POST',headers:{'Content-Type':ext==='.png'?'image/png':ext==='.webp'?'image/webp':'image/jpeg','X-Watermarked':'true','X-Media-ID':m.id,'X-Filename':encodeURIComponent(m.file)},body:fileBytes});console.log('Imported:',m.file);}const s=await (await call('state')).json();if(!s.draft?.artworks?.length){const doc=JSON.parse(await readFile('seed/content.json','utf8'));await call('save',{method:'POST',body:JSON.stringify({version:s.version,document:doc})});console.log('Seed imported as DRAFT. Open admin, preview and publish. Images remain HIDDEN.');}else console.log('Existing content preserved. No automatic overwrite.');
 }
}finally{await call('logout',{method:'POST',body:'{}'}).catch(()=>{});}
