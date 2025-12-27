window.addEventListener("message", (e) => { if (e.data && e.data.type === "NAVBAR_DEBUG") { console.log("[NAVBAR_DEBUG_PAYLOAD]", e.data.payload); } });
