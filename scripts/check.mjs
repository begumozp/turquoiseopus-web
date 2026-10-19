import {readdir,readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
async function walk(p){const arr=[];for(const e of await readdir(p,{withFileTypes:true})){const f=p+'/'+e.name;if(e.isDirectory())arr.push(...await walk(f));else arr.push(f);}return arr;}
const files=await walk('dist');const source=[...await walk('public'),...await walk('server'),...await walk('scripts'),...await walk('functions')];
for(const f of source.filter(x=>/\.(?:mjs|js)$/.test(x)))execFileSync(process.execPath,['--check',f]);
for(const f of files){if(/\d{3}_(?:WEB|DETAIL|HOME)|begum-about\.(?:png|jpg)|\.(?:tiff?|dng|raw)$/i.test(f))throw new Error('Private media in public output: '+f);if(/\.(?:html|css|js|mjs|json)$/.test(f)){const t=await readFile(f,'utf8');if(/data:image\/(?:jpeg|png);base64/i.test(t))throw new Error('Embedded artwork bytes: '+f);if(/SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*['"][^'"]{20,}/.test(t))throw new Error('Secret in output: '+f);}}
console.log('PASS: syntax, private asset exclusion, embedded artwork exclusion, secret scan. Files:',files.length);
