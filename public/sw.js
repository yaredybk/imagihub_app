const filekeys = [
    "titleparam",
    "textparam",
    "urlparam",
    "text",
    "image",
    "svg",
    "webp",
];
const filetypeslist = [
    { name: "text", accept: ["text/plain", ".txt"] },
    {
        name: "image",
        accept: [
            "image/png",
            "image/jpeg",
            "image/jpg",
            ".png",
            ".jpeg",
            ".jpg",
        ],
    },
    { name: "svg", accept: ["image/svg+xml", ".svg"] },
    { name: "webp", accept: ["image/webp", ".webp"] },
];
const list_precache = ["/"];
const list_network_first = ["manifest.json", "/assets"];
const list_cache_first = [];
async function storeToCache(cacheName, url, datain, dataTypein) {
    if (!caches) return Promise.reject("caches not suported!");
    if (!(url && cacheName)) return Promise.reject("no name/url provided!");
    let dataType;
    if (dataTypein == "text/plain") dataType = dataTypein;
    else if (datain.type) {
        dataType = datain.type;
    } else {
        dataType = filetypeslist.find((f) => f.name == dataTypein);
        dataType = dataType ? dataType.accept[0] : "text/plain";
    }
    // console.log(datain, dataType);
    debugger;
    caches.open(cacheName).then((cache) => {
        // let dd = JSON.stringify(datain);
        const cusRes = new Response(datain, {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": dataType,
            },
        });
        return (
            cache
                // find if there is old entry
                .match(url)
                .then(async (response) => {
                    if (response) {
                        // Delete the previous entry.
                        await cache.delete(url);
                    }
                    // Put the new entry in the cache.
                    return cache.put(url, cusRes);
                })
        );
    });
}
function hadleShareTarget(e) {
    e.respondWith(Response.redirect(`/get-shared/loading`)),
        e.waitUntil(
            (async function () {
                let data = {};
                const A = await e.request?.formData();
                if (!A)
                    storeToCache(
                        "share-target",
                        "/dataType",
                        "empty",
                        "text/plain"
                    );
                let keysinform = [];
                let allkeys = [];
                for (const key of A.keys()) {
                    allkeys.push(key);
                    if (filekeys.includes(key)) {
                        data[key] = A.get(key);
                        keysinform.push(key);
                    }
                }
                if (keysinform.length == 0) {
                    storeToCache(
                        "share-target",
                        "/dataType",
                        "empty",
                        "text/plain"
                    );
                    storeToCache(
                        "share-target",
                        `/shared/text`,
                        JSON.stringify(allkeys),
                        "text/plain"
                    );
                    return;
                } else {
                    storeToCache(
                        "share-target",
                        "/dataType",
                        keysinform[0] || "empty",
                        "text/plain"
                    );
                    keysinform.forEach((key) => {
                        storeToCache(
                            "share-target",
                            `/shared/${key}`,
                            data[key]
                        );
                    });
                    storeToCache(
                        "share-target",
                        `/shared/allKeys`,
                        JSON.stringify(allkeys),
                        "text/plain"
                    );
                }
            })()
        );
}
self.addEventListener("install", (e) => {
    console.log("install", new Date().toISOString());
    e.waitUntil(caches.open("pre-cache").then((c) => c.addAll(list_precache)));
});
self.addEventListener("activate", (e) => {
    self.clients.claim(),
        e.waitUntil(
            (async function () {
                console.log("activate", new Date().toISOString());
            })()
        );
});
self.addEventListener("fetch", async (e) => {
    // console.log(e.request.destination);
    // debugger;
    const A = new URL(e.request.url);
    // Different ORIGIN
    switch (true) {
         case A.pathname.startsWith("/send"):
        case A.pathname.startsWith("/receive"):
            CacheFirst(e, "pre-cache", "/send");
        // Pre-cache routes
        case A.pathname === "/":
        case A.pathname.match(/get-shared/):
            CacheFirst(e, "pre-cache", "/");
            break;
        case A.pathname.startsWith("/about"):
        case A.pathname.startsWith("/help"):
            NetworkFirst(e,"pre-cache")

        // images get route
        case A.pathname.startsWith("/local/sent_images/"):
            CacheFirst(e, "sent_images");
            break;
        // images get route
        case A.pathname.startsWith("/api/v1/anon/images") &&
            e.request.method === "GET":
            CacheFirst(e, "received_images");
            break;

        // i can not fix request.clone() then r.formdata() ERROR
        // images get route
        // case A.pathname.startsWith("/api/v1/anon/images") &&
        //     e.request.method === "POST":
        //     StoreAndPost(e, "sent_images");
        //     break;

        // Assets route
        case A.pathname.startsWith("/assets/"):
            StaleWhileRevalidate(e, "assets");
            break;

        // JavaScript route (optional, uncomment if needed)
        // case A.pathname.match(/.*\.js/):
        //   CacheFirst(e, "js");
        //   break;

        // Share-target POST route
        case A.pathname === "/share-target" && e.request.method === "POST":
            hadleShareTarget(e);
            break;

        // Share-target GET route (logging for debugging)
        case A.pathname === "/share-target":
            console.log(e.request.mode, A.pathname);
            console.log("/" === A.pathname || "/get-shared" === A.pathname);
            console.log(e.request);
            break;

        // Network-first routes (using findIndex for optimized matching)
        case list_network_first.findIndex((ele) => A.pathname.match(ele)) > -1:
            NetworkFirst(e, "pre-cache");
            break;

        // Cache-first routes (using findIndex for optimized matching)
        case list_cache_first.findIndex((ele) => A.pathname.match(ele)) > -1:
            CacheFirst(e, "general-cache-1st");
            break;

        case A.pathname.match(/.json$/):
            StaleWhileRevalidate(e, "json");
            break;

        case A.pathname.match(/.jsx$/):
            StaleWhileRevalidate(e, "jsx");
            break;

        // networkfirst with index.html for all documents
        case e.request.destination == "document":
            NetworkFirst(e, "pre-cache");
            break;

        // Default (no matching route)
        default:
            return;
        // Handle the case where no matching route is found
        // console.warn("Unmatched route:", A.pathname);
        // returning a default response, or using a fallback strategy.
    }
});

/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 * @param {url} n url to fetch altpath || e.request
 */
async function NetworkFirst(e, n, altpath) {
    return fetch(altpath || e.request)
        .then((r) => {
            if (r) {
                let r2 = r.clone();
                e.waitUntil(
                    caches.open(n).then((c) => c.put(altpath || e.request, r2))
                );
                return r;
            } else {
                //offline
                return caches.open(n).then((c) => c.match(e.request));
            }
        })
        .catch(async () => {
            return caches.open(n).then((c) => c.match(e.request));
        });
}
/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 */
async function CacheFirst(e, n) {
    const c = await caches.open(n);
    const r = await c.match(e.request);
    if (r) return r;
    const nr = await fetch(e.request);
    const r3 = nr.clone();
    nr.ok && nr.status < 300 && e.waitUntil(c.put(e.request, r3));
    return nr;
}

/**
 * // not used because i can not fix request.clone() then r.formdata() ERROR
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 * @param {String} k form data key to call formData.get() method
 */
async function StoreAndPost(e, n, k) {
    let r2 = e.request.clone();
    e.respondWith(
        fetch(e.request).then((r) => {
            return (
                r,
                r &&
                    e.waitUntil(
                        caches.open(n).then(async (c) => {
                            let f = r2.formData();
                            let d = f.get(k);
                            c.put(r2.url, new Response(d));
                        })
                    )
            );
        })
    );
}
/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 */
async function StaleWhileRevalidate(e, n) {
    e.respondWith(
        caches
            .open(n)
            .then(async (c) => {
                const r = await c.match(e.request);
                if (r) {
                    e.waitUntil(
                        fetch(e.request).then((r2) => c.put(e.request, r2))
                    );
                    return r;
                } else {
                    return fetch(e.request).then((r2) => {
                        const r3 = r2.clone();
                        if (!r2) return r2; //OFFLINE
                        e.waitUntil(c.put(e.request, r3));
                        return r2;
                    });
                }
            })
            .catch((e) =>
                fetch(e.request).then((r2) => {
                    const r3 = r2.clone();
                    if (!r2) return r2; //OFFLINE
                    return e.waitUntil(c.put(e.request, r2)), r2;
                })
            )
    );
}
