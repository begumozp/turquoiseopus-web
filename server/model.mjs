export const LANGS=['en','nl','tr'];
export const clone=x=>structuredClone(x);
export function fail(message,status=400){throw Object.assign(new Error(message),{status});}
const text=(x,max=12000)=>typeof x==='string'&&x.length<=max;
export function etsyURL(s){if(!s)return true;try{const u=new URL(s);return u.protocol==='https:'&&['etsy.com','www.etsy.com'].includes(u.hostname)&&!u.username&&!u.password&&/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?listing\/\d+(?:\/|$)/i.test(u.pathname);}catch{return false;}}
export function youtubeID(s){if(!s)return '';try{const u=new URL(s);if(u.protocol!=='https:')return '';const h=u.hostname.replace(/^www\./,'');let id=h==='youtu.be'?u.pathname.slice(1):['youtube.com','youtube-nocookie.com'].includes(h)?u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]:'';return /^[\w-]{11}$/.test(id||'')?id:'';}catch{return '';}}
export function validateDocument(d){
 if(!d||!Array.isArray(d.artworks)||!Array.isArray(d.collections)||!d.copy||!d.pages)fail('Geçersiz içerik belgesi.');
 if(d.artworks.length>1500||d.collections.length>100)fail('Kayıt sınırı aşıldı.');
 const ids=new Set(),codes=new Set();
 for(const a of d.artworks){
  if(!/^[a-zA-Z0-9_-]{1,60}$/.test(a.id)||ids.has(a.id)||!text(a.code,40)||!a.code||codes.has(a.code.toUpperCase()))fail('Eser kodu veya kimliği tekrar ediyor.');ids.add(a.id);codes.add(a.code.toUpperCase());
  if(!a.title||!a.description||!a.medium)fail('Dil alanları eksik.');
  for(const k of ['title','description','medium'])for(const l of LANGS)if(!text(a[k][l]??'',k==='title'?300:12000))fail('Geçersiz dil alanı.');
  for(const k of ['width','height','gsm'])if(a[k]!==null&&a[k]!==''&&(!Number.isFinite(a[k])||a[k]<=0))fail('Ölçü/gramaj pozitif sayı olmalı.');
  if(a.year!==null&&(!Number.isInteger(a.year)||a.year<1000||a.year>2200))fail('Yıl geçersiz.');
  if(!['available','sold','enquire','not-for-sale'].includes(a.original.status))fail('Satış durumu geçersiz.');
  if(!etsyURL(a.original.etsy))fail('Eser için tam Etsy ürün URL’sini girin.');
  const sizes=new Set();if(!Array.isArray(a.prints)||a.prints.length>20)fail('Baskı sayısı geçersiz.');
  for(const p of a.prints){if(!/^[a-zA-Z0-9 ×x.,_-]{1,50}$/.test(p.size)||sizes.has(p.size))fail('Baskı boyutu tekrar ediyor.');sizes.add(p.size);if(!etsyURL(p.etsy))fail('Baskı için tam Etsy ürün URL’sini girin.');if(p.price!==null&&(!Number.isFinite(p.price)||p.price<0||p.price>999999))fail('Fiyat geçersiz.');}
  if(a.original.price!==null&&(!Number.isFinite(a.original.price)||a.original.price<0))fail('Fiyat geçersiz.');
  if(!Array.isArray(a.details)||a.details.length>12)fail('Detay sayısı geçersiz.');
 }
 const cs=new Set();for(const c of d.collections){if(!/^[a-z0-9-]{1,60}$/.test(c.id)||cs.has(c.id))fail('Koleksiyon kimliği geçersiz.');cs.add(c.id);if(c.cover&&!ids.has(c.cover))fail('Kapak eseri bulunamadı.');}
 for(const a of d.artworks)if(a.collection&&!cs.has(a.collection))fail('Eser koleksiyonu bulunamadı.');
 for(const l of LANGS){if(!d.copy[l]||typeof d.copy[l]!=='object')fail('Metin çevirileri eksik.');for(const v of Object.values(d.copy[l]))if(!text(v))fail('Metin alanı geçersiz.');}
 if(!Array.isArray(d.process)||d.process.length>100)fail('Process kaydı geçersiz.');
 for(const p of d.process)if(p.youtube&&!youtubeID(p.youtube))fail('YouTube URL’si geçersiz.');
 if(JSON.stringify(d).length>2000000)fail('İçerik çok büyük.');return d;
}
export function publicDocument(d,hidden=true){
 if(!d?.artworks)return {artworks:[],collections:[],copy:{en:{},nl:{},tr:{}},pages:{process:false},process:[],imagesHidden:true};
 const approved=a=>a.visible===true&&!a.archived&&a.main&&a.approved===true;
 const artworks=d.artworks.filter(approved).map(a=>({id:a.id,code:a.code,title:a.title,description:a.description,collection:a.collection,year:a.year,medium:a.medium,width:a.width,height:a.height,gsm:a.gsm,acid:a.acid,framing:a.framing,showPrice:a.showPrice,original:{...a.original,price:a.showPrice?a.original.price:null},prints:a.prints.map(p=>({...p,price:a.showPrice?p.price:null})),main:hidden?null:a.main,details:hidden?[]:a.details.filter(x=>x.confirmed&&x.media).map(x=>({media:x.media,label:x.label}))}));
 const ids=new Set(artworks.map(a=>a.id));
 return {artworks,collections:d.collections.filter(c=>c.visible).map(c=>({id:c.id,title:c.title,cover:ids.has(c.cover)?c.cover:null})),copy:d.copy,pages:{process:!!d.pages.process},process:d.pages.process?d.process.filter(p=>p.visible).map(p=>({title:p.title,text:p.text,youtube:hidden?'':youtubeID(p.youtube),media:hidden?null:p.media})):[],hero:hidden?null:d.hero,heroMobile:hidden?null:d.heroMobile,portrait:hidden?null:d.portrait,imagesHidden:hidden};
}
export function allowedMedia(doc){const ids=new Set();if(doc.hero)ids.add(doc.hero);if(doc.heroMobile)ids.add(doc.heroMobile);if(doc.portrait)ids.add(doc.portrait);for(const a of doc.artworks||[]){if(a.main)ids.add(a.main);for(const x of a.details||[])if(x.media)ids.add(x.media);}for(const p of doc.process||[])if(p.media)ids.add(p.media);return ids;}
export function bulkPreview(d,collection,size,price){if(!Number.isFinite(price)||price<0||price>999999)fail('Ortak fiyat geçersiz.');const targets=[],excluded=[];for(const a of d.artworks){if(a.collection!==collection||a.archived)continue;const p=a.prints.find(p=>p.size===size);if(p)targets.push({id:a.id,code:a.code,size,before:p.price,after:price});else excluded.push({id:a.id,code:a.code,reason:'Bu boyutta baskı tanımlı değil'});}return {targets,excluded};}
export function applyBulk(d,preview){const out=clone(d);for(const x of preview.targets){const p=out.artworks.find(a=>a.id===x.id)?.prints.find(p=>p.size===x.size);if(!p||p.price!==x.before)fail('Önizlemeden sonra fiyat değişti; yeniden önizleyin.',409);p.price=x.after;}return out;}
export function mediaType(bytes){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';return '';}
export function imageSize(b){
 const mime=mediaType(b);if(mime==='image/png'&&b.length>=33&&String.fromCharCode(...b.slice(12,16))==='IHDR'){const v=new DataView(b.buffer,b.byteOffset,b.byteLength);return {width:v.getUint32(16),height:v.getUint32(20)};}
 if(mime==='image/jpeg'){let p=2;while(p+3<b.length){if(b[p]!==255)return null;while(b[p]===255)p++;const marker=b[p++];if(marker===0xd9||marker===0xda)return null;const n=b[p]*256+b[p+1];if(n<2||p+n>b.length)return null;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&n>=8)return {height:b[p+3]*256+b[p+4],width:b[p+5]*256+b[p+6]};p+=n;}}
 if(mime==='image/webp'&&b.length>=30){const v=new DataView(b.buffer,b.byteOffset,b.byteLength),chunk=String.fromCharCode(...b.slice(12,16));if(chunk==='VP8X')return {width:1+b[24]+b[25]*256+b[26]*65536,height:1+b[27]+b[28]*256+b[29]*65536};if(chunk==='VP8 '&&b[23]===157&&b[24]===1&&b[25]===42)return {width:v.getUint16(26,true)&16383,height:v.getUint16(28,true)&16383};if(chunk==='VP8L'&&b[20]===47){const bits=v.getUint32(21,true);return {width:1+(bits&16383),height:1+((bits>>>14)&16383)};}}
 return null;
}
