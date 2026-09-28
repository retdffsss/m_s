self.addEventListener("install", function() {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname.endsWith("/register")) {
        event.respondWith((async function() {
            let data = {};

            try {
                data = await request.clone().json();
            } catch (error) {
                data = {};
            }

            return new Response(JSON.stringify({
                success: true,
                username: data.name || "",
                email: data.email || "",
                method: "POST"
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        })());
    }
});
