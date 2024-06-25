const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === "[::1]" ||
        // 127.0.0.0/8 are considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
);

export function register(config, swUrl = `/sw.js`) {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }
        window.addEventListener("load", () => {
            console.log("configuring sw!");
            registerValidSW(swUrl, config);
        });
    } else {
        window.addEventListener("load", () => {
            swUrl = `/sw.js`;
            // Add some additional logging to localhost
            // This is running on localhost. Let's check if a service worker still exists or not.
            // if checking is needed comment the "registerValidSW(swUrl, config);" and uncomment "checkValidServiceWorker(swUrl, config)""
            checkValidServiceWorker(swUrl, config);
            // registerValidSW(swUrl, config);
        });
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl, { scope: "/" })
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            // if (
                            //     window.confirm(
                            //         "Updates available.\n Install now ?"
                            //     )
                            // ) {
                            //     registration.active.postMessage("skipWaiting");
                            // } else {
                            //     window.alert(
                            //         "Updates will be installed after a restart."
                            //     );
                            // }
                            if (process.env.NODE_ENV != "development")
                                window.alert(
                                    "Updates will be installed after a restart."
                                );
                            else {
                                // skip waiting
                                // installingWorker.postMessage('skipWaiting');
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error("Error during service worker registration:", error);
        });
}

function checkValidServiceWorker(swUrl, config) {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { "Service-Worker": "script" },
    })
        .then((response) => {
            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get("content-type");
            if (
                response.status === 404 ||
                (contentType != null &&
                    contentType.indexOf("javascript") === -1)
            ) {
                console.log("check passed");
                // No service worker found. Probably a different app. Reload the page.
                console.log(
                    "No service worker found. Probably a different app. Reload the page."
                );
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                // Service worker found. Proceed as normal.
                console.log("check passed");
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log(
                "No internet connection found. App is running in offline mode."
            );
        });
}

export function unregister() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
