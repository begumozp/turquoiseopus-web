// Prepare an editable copy; never mutate the stored draft or invent approval.
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const list=x=>Array.isArray(x)?x:[];
const languages=x=>({en:'',nl:'',tr:'',...object(x)});
export function prepareDraft(value){
 const d=structuredClone(object(value));
 d.artworks=list(d.artworks).map(value=>{const a=object(value);return {...a,title:languages(a.title),description:languages(a.description),medium:languages(a.medium),year:a.year??null,width:a.width??null,height:a.height??null,gsm:a.gsm??null,original:{status:'enquire',price:null,etsy:'',...object(a.original)},prints:list(a.prints).map(p=>({price:null,etsy:'',available:false,...object(p)})),details:list(a.details).map(x=>({media:null,confirmed:false,label:'',...object(x)}))};});
 d.collections=list(d.collections).map(c=>({...object(c),title:languages(c?.title)}));
 d.process=list(d.process).map(p=>({...object(p),title:languages(p?.title),text:languages(p?.text)}));
 d.copy={...object(d.copy)};for(const l of ['en','nl','tr'])d.copy[l]={...object(d.copy[l])};
 d.pages={process:false,...object(d.pages)};
 return d;
}
