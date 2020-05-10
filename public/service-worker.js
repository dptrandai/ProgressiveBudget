//message that consoles the service worker is being loaded 
console,log("service worker has started");

//cahce the files so the app could be used offline 
const FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "manifest.webmanifest",
    "index.html",
    "styles.css"
];

//the cache for stoing our files
const CACHE_NAME = "static-cache-v2";

//cache for storing data
const DATA_CACHE_NAME = "cata-cache-v1";

//install the service worker when loaded
self.addEventListener("install", function(event){
    event.waitUntil(
        //opens our cache
        caches.open(CACHE_NAME).then(cache => {
            console.log("files have been pre-cached");
            //return the cache files needed
            return cache.addALL(FILES_TO_CACHE);
        })
    );
    //service worker will stop waiting
    self.skipWaiting();
});

//activate the service worker
//once page is active, service worker will check if cache needs update
self.addEventListener("activaate", function(event){
    event.watiUntil(
        //find keys
        cache.keys().then(keyList => {
            return Promise.all(
                //checking cahce and deleting irrelevants
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old cached data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

//grab cache from storage

self.addEventListener("fetch", function(event){
    //get the request and check if service worker needs to start 
    if(event.request.url.startsWith(self.location.origin)){
        //open current data cache on file, and pull from server
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request).then(response => {
                    //responce 200, the request came back with info, put it up to the app, and also keep a copy for the cache.
                if (response.status === 200) {
                cache.put(event.request.url, response.clone());
                }
  
                return response;
                })
                .catch(error => {
                    return cache.match(event.request);
                });
            }).catch(error => console.log(error))
        );
        //end
        return;
    }
});