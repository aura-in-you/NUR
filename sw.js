const C='nur-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    // страница: сначала сеть (чтобы обновления видны сразу), офлайн — из кэша
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./'))));
    return;
  }
  // ресурсы (аудио, json, картинки): кэш-first, в фоне обновление
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}
      return res;
    }).catch(()=>hit);
    return hit||net;
  }));
});
