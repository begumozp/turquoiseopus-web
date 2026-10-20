import {readFile,writeFile,cp,mkdir,rm,readdir} from 'node:fs/promises';
import {validateDocument} from '../server/model.mjs';
const seed=JSON.parse(await readFile('seed/content.json','utf8'));validateDocument(seed);
// Plain JS data works in Node and in the older Wrangler used by Pages builds.
await writeFile('server/initial-content.mjs','// Generated from seed/content.json by scripts/build.mjs.\nexport default '+JSON.stringify(seed)+';\n');
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
const templates=JSON.parse(await readFile('seed/templates.json','utf8'));
const routes=['index','gallery','about','faq','contact','process','privacy','404',...seed.collections.map(c=>'collection-'+c.id),...seed.artworks.filter(a=>a.visible&&a.approved&&a.main&&!a.archived).map(a=>'artwork-'+a.id)];
const shell=title=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Turquoise Opus</title><meta name="description" content="Original artworks and fine art prints by Begüm Özpay. Explore Turquoise Opus."><meta name="theme-color" content="#3A7880"><link rel="stylesheet" href="/design.css"><link rel="stylesheet" href="/cms-site.css"><script type="module" src="/site.mjs"></script></head><body><a class="skip" href="#main" data-i18n="skip">Skip to content</a>${templates.header}<main class="page-main" id="main" aria-live="polite"><h1 class="dotted-title">turquoise opus</h1><p>Loading the studio…</p><noscript>JavaScript is needed to browse the studio. Please enable it to view the catalogue.</noscript></main>${templates.footer}</body></html>`;
for(const route of routes){const a=seed.artworks.find(a=>'artwork-'+a.id===route);const title=(a?.title.en||'Turquoise Opus').replace(/[<>&"']/g,'');await writeFile('dist/'+route+'.html',shell(title));}
await writeFile('dist/_routes.json',JSON.stringify({version:1,include:['/api/*'],exclude:[]}));
console.log(`Built ${routes.length} pages + admin. Artwork files: 0 in public output.`);
