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
        // Pre-cache routes
        case A.pathname === "/":
        case A.pathname.startsWith("/send"):
        case A.pathname.startsWith("/receive"):
        case A.pathname.match(/get-shared/):
            NetworkFirst(e, "pre-cache", "/");
            break;

        // images get route
        case A.pathname.startsWith("/api/v1/anon/images") &&
            e.request.method === "GET":
            CacheFirst(e, "sent_images");
            break;

        // images get route
        case A.pathname.startsWith("/api/v1/anon/images") &&
            e.request.method === "POST":
            StoreAndPost(e, "sent_images");
            break;

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
            NetworkFirst(e, "pre-cache", "/");
            break;

        // Default (no matching route)
        default:
        // Handle the case where no matching route is found
        // console.warn("Unmatched route:", A.pathname);
        // You may decide to handle this case by throwing an error,
        // returning a default response, or using a fallback strategy.
    }
});
self.addEventListener("message", (e) => {
    if (e.data.action)
        switch (e.data.action) {
            case "cache-all":
                // e.waitUntil(ce(le));
                break;
            case "skipWaiting":
                console.warn("=> skipWaiting");
                // console.log(self);
                try {
                    skipWaiting();
                } catch (error) {
                    console.warn(error);
                }
            default:
                console.log(e.data);
        }
});

/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 * @param {url} n url to fetch altpath || e.request
 */
async function NetworkFirst(e, n, altpath) {
    e.respondWith(
        fetch(altpath || e.request)
            .then((r) => {
                if (r) {
                    let r2 = r.clone();
                    e.waitUntil(
                        caches
                            .open(n)
                            .then((c) => c.put(altpath || e.request, r2))
                    );
                    return r;
                } else {
                    //offline
                    return caches.open(n).then((c) => c.match(e.request));
                }
            })
            .catch(async () => {
                return caches.open(n).then((c) => c.match(e.request));
            })
    );
}

/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 */
async function CacheFirst(e, n) {
    e.respondWith(
        caches
            .open(n)
            .then(async (c) => {
                const r = await c.match(e.request);
                if (r) return r;
                else {
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
/**
 * @param {Object} e fetch event
 * @param {String} n cache name/folder to open
 * @param {String} k form data key to call formData.get() method
 */
async function StoreAndPost(e, n, k) {
    e.respondWith(
        fetch(e.request)
            .then((r) => {
                return (
                    r,
                    r &&
                        e.waitUntil(
                            caches.open(n).then(async (c) => {
                                let f = e.request.formData();
                                let d = f.get(k);
                                c.put(e.request.url, new Response(d));
                            })
                        )
                );
            })
            .catch(async (e) => {
                return e;
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
    7 - 78;
    0;
}

self.addEventListener("push", NotificationManager);
self.addEventListener("notificationclick", NotificationClickManager, false);
self.addEventListener("message", hadleMessage);
async function hadleMessage(event) {
    const { name, value } = event.data;
    if (name === "status" && value) {
        settings[name] = value;
        console.log("status:", value);
    }
}

function extractnotificationData(dd) {
    let nodatatext = "your server did not send any message!";
    let body;
    try {
        let txt = "";
        txt = dd.text();
        if (txt[0] === "#" && txt[1] == "#") {
            txt = txt.slice(2);
            let decompose = txt.split("##");
            dd = JSON.parse(decompose[0]);
            dd.data = decompose[1];
            body = dd?.body ? dd.body : nodatatext;
        } else if (txt[0] === "{") {
            dd = dd.json();
            body = dd?.body ? dd.body : nodatatext;
        } else {
            dd = txt;
            body = dd || nodatatext;
        }
        dd.body = body;
        return dd;
    } catch (error) {
        console.warn(error);
        body = nodatatext;
        return null;
    }
}
function NotificationManager(e) {
    // self.ServiceWorkerRegistration.sendNotification("test1",{})
    let dd = e.data;
    if (!dd) {
        return console.warn("no data");
    }
    dd = extractnotificationData(dd);
    const title = dd.title || "no title";
    if (dd.data) {
        if (!dd.data.navPath)
            dd.data.navPath = title.includes("report")
                ? "/nav/report/today"
                : "/nav/notifications";
        if (dd.data.dontnotify) {
            dd.dontnotify = true;
        }
    }
    const options_1 = {
        silent: dd.silent || false,
        tag: dd.tag || "No-data" + Date.now(),
        icon: dd.icon || "/image/danielgaragemini2.PNG",
        badge: dd.badge || "/image/danielgaragemini2.PNG",
        data: dd.data || {
            time: new Date(Date.now()).toString(),
            message: "No data found from server !",
        },
        ...dd,
    };
    function senedNotf(_title, _options) {
        return self.registration.showNotification(_title, _options);
    }
    let promiseChain;
    if (options_1.chunkSize && !isNaN(options_1.chunkSize)) {
        promiseChain = cache_Chunk_DataFromPush(options_1)
            .then((modifiedOptions) => {
                let tmptitle = modifiedOptions.title || title;
                if (!modifiedOptions?.dontnotify)
                    promiseChain = senedNotf(tmptitle, modifiedOptions);
            })
            .catch((modifiedOptions) => {
                let tmptitle = modifiedOptions.title || title;
                promiseChain = senedNotf(tmptitle, options_1);
            });
    }
    // normal push data with cacheName
    else if (
        options_1.data?.cacheName &&
        options_1.data?.cacheName != "dontcache"
    ) {
        promiseChain = cacheDataFromPush(options_1)
            .then((modifiedOptions) => {
                let tmptitle = modifiedOptions.title || title;
                promiseChain = senedNotf(tmptitle, modifiedOptions);
            })
            .catch((err) => {
                console.warn(err);
                promiseChain = senedNotf(title, options_1);
            });
    }
    // normal push data with cacheName
    else promiseChain = senedNotf(title, options_1);
    e.waitUntil(promiseChain);
}
async function cacheDataFromPush(datain) {
    return new Promise((resolve, reject) => {
        let { data } = datain;
        let { urlPath, reportData, cacheName } = data;
        if (!cacheName) {
            console.warn("no cacheName");
            return resolve(datain);
        }
        if (cacheName == "dontcache") {
            return resolve(datain);
        }
        if (!(urlPath && reportData)) return reject(datain);
        try {
            caches.open(cacheName).then((cache) => {
                let dd = JSON.stringify(reportData);
                const cusRes = new Response(dd, {
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });

                cache
                    // find if there is old entry
                    .match(urlPath)
                    .then(async (response) => {
                        if (response) {
                            // Delete the previous entry.
                            await cache.delete(urlPath);
                        }
                        // Put the new entry in the cache.
                        return await cache.put(urlPath, cusRes);
                    })
                    .then(() => resolve(datain))
                    .catch(() => reject(datain));
            });
        } catch (error) {
            reject(datain);
            console.warn(error);
        }
    });
}
async function cache_Chunk_DataFromPush(datain) {
    return new Promise(async (resolve, reject) => {
        let { index, chunkSize, data } = datain;
        index = Number(index);
        chunkSize = Number(chunkSize);
        // first chunk
        if (index == 0) await caches.delete("notification_chunks");
        const urlPath = "/local/notification_chunks/" + index;
        const cache = await caches.open("notification_chunks");
        try {
            // last chunk
            if (index + 1 >= chunkSize) {
                // Get all of the keys in the cache.
                cache.keys().then((keysArray) => {
                    // Get the response data for each key.
                    Promise.all(
                        keysArray.map(async (key) => {
                            const response = await cache.match(key);
                            return response.text();
                        })
                    )
                        .then(async (responses) => {
                            // Do something with the response data.
                            responses.push(data);
                            if (responses.length < 1) {
                                console.warn(responses);
                                return reject("small chunk size");
                            }
                            let buildChunk = "";
                            responses.forEach((ele) => {
                                buildChunk = buildChunk.concat(ele);
                            });
                            const finalData = JSON.parse(buildChunk);
                            finalData.icon = "/image/danielgaragemini2.PNG";
                            finalData.badge = "/image/danielgaragemini2.PNG";
                            finalData.silent = false;
                            finalData.dontnotify = false;
                            return resolve(cacheDataFromPush(finalData));
                        })
                        .catch((error) => {
                            reject(datain);
                            console.warn(error);
                        });
                });
            } else {
                const cusRes = new Response(data, {
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                    },
                });
                let modifiedOptions = {
                    dontnotify: index == "0" ? false : true,
                    title: `daniel garage`,
                    // body: `syncing data`,
                    tag: datain?.tag?.split("::")[0],
                    icon: "/image/danielgaragemini2title:.PNG",
                    badge: "/image/images/sync.webp",
                    silent: true,
                    ...datain,
                };
                cache
                    .put(urlPath, cusRes)
                    .then(() => resolve(modifiedOptions))
                    .catch(reject(modifiedOptions));
            }
        } catch (error) {
            reject(datain);
            console.warn(error);
        }
    });
}
/**
 * An object representing a notification displayed by the browser.
 *
 * @typedef {Object} Notification
 * @property {string} title - The title text displayed in the notification.
 * @property {Array<Object>} actions - An array of action objects. Each action object has properties like `title` (string) and an optional `icon` (string) URL. Clicking an action triggers the `onclick` callback with the corresponding action object as an argument.
 * @property {string} badge - A URL string for an image to be displayed as a badge on the notification.
 * @property {string} body - The main content text displayed in the notification body.
 * @property {Object} data - An optional object containing arbitrary data associated with the notification.
 * @property {"auto" | "ltr" | "rtl"} dir - The directionality of the notification content ("auto", "ltr" for left-to-right, or "rtl" for right-to-left).
 * @property {string} icon - A URL string for the notification icon.
 * @property {string} image - A URL string for an additional image to be displayed within the notification. (Less commonly used)
 * @property {string} lang - The language code of the notification content.
 * @property {function} onclick - A callback function that is invoked when the user clicks the notification. The argument passed to this function is a `NotificationClickEvent` object (see below).
 * @property {function} onclose - A callback function that is invoked when the notification is closed.
 * @property {function} onerror - A callback function that is invoked if an error occurs while displaying the notification.
 * @property {function} onshow - A callback function that is invoked when the notification is displayed.
 * @property {boolean} renotify - A boolean indicating whether the notification should be re-shown if it's already displayed.
 * @property {boolean} requireInteraction - A boolean indicating whether the user interaction is required to close the notification.
 * @property {boolean} silent - A boolean indicating whether the notification should be displayed silently without any sound or vibration.
 * @property {string} tag - A string identifying the notification.
 * @property {number} timestamp - The timestamp (in milliseconds) when the notification was created.
 * @property {function} reply - A function used for replying to notifications. Not supported in all browsers. (May be null)
 * @property {boolean} returnValue - A boolean indicating whether the notification creation was successful.
 *
 * @typedef {Object} NotificationClickEvent
 * @property {string} [action] - The title of the action button clicked by the user (if any).
 * @property {Notification} notification - The `Notification` object that was clicked.
 *
 * @param {NotificationClickEvent} event - The event object containing information about the clicked notification and action (if applicable).
 */
async function NotificationClickManager(event) {
    let { action = "", replay, type, notification } = event;
    notification.action = action;
    notification.replay = replay;
    notification.n_type = type;
    delete notification.onclick;
    delete notification.onclose;
    delete notification.onerror;
    delete notification.onshow;
    delete notification.requireInteraction;
    delete notification.vibrate;

    event.notification.close();
    return event.waitUntil(
        // if goto is specified the notification click open a page to goto other wise to /nav/notifications
        openWindowAndStoreMessage(
            notification.data.goto || "/nav/notifications",
            notification
        )
    );
    return;

    // event.waitUntil(openWindowAndStoreMessage("/nav/notifications", message));
    // localStorage.setItem("lastnotification", JSON.stringify(event));
    // if (event.action === "archive") {
    // User selected the Archive action.
    // archiveEmail();
    // } else {
    // let fallback = title.includes("report")
    //     ? "/nav/report/today"
    //     : "/nav/notifications";
    // let path = navPath || fallback;
    // const urlToOpen = new URL(path, self.location.origin).href;
}

async function openWindowAndStoreMessage(urlToOpen, message) {
    try {
        return clients
            .matchAll({
                type: "window",
                origin: self.origin,
                includeUncontrolled: false,
            })
            .then(async (windowClients) => {
                let c = await caches.open("SW");
                c.put(
                    "/lastnotification",
                    new Response(JSON.stringify(message))
                ).catch((e) => () => null);
                if (windowClients.length === 0) {
                    return clients.openWindow(getOriginUrl(urlToOpen));
                } else {
                    await windowClients[0]?.focus();
                    return windowClients[0]?.navigate(getOriginUrl(urlToOpen));
                }
            })
            .catch((e) => {
                console.warn(e);
                return Promise.resolve();
            });
    } catch (error) {
        console.error("Error opening window or sending message:", error);
        const client = await clients.openWindow(getOriginUrl(urlToOpen));
        await client.postMessage(message);
    }
}

function getOriginUrl(relativeUrl) {
    // Check if origin property is available on self
    let dd = Date.now();
    if (!self.origin) {
        let u = new URL(relativeUrl);
        u = u.searchParams.append("new", dd);
        return u.href;
    }
    // Check if the relative URL starts with a slash
    if (relativeUrl.startsWith("/")) {
        let u = new URL(relativeUrl, self.origin);
        u.searchParams.append("new", dd);
        return u.href;
    } else {
        let u = new URL(relativeUrl); // Or return the relative URL as-is
        u = u.searchParams.append("new", dd);
        return u.href;
    }
}
