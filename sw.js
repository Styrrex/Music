const V='music-v7';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
// Сначала интернет (всегда свежая версия), если сети нет или она очень медленная, берём из кэша
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    try{
      const r=await Promise.race([fetch(e.request.url,{cache:'no-cache'}),new Promise((_,rej)=>setTimeout(rej,4000))]);
      if(r&&r.ok)c.put(e.request,r.clone());
      return r;
    }catch(_){
      return (await c.match(e.request,{ignoreSearch:true}))||(await c.match('index.html'))||Response.error();
    }
  })());
});
