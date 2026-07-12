const http = require("http");
const https = require("https");

const PORT = 3001;
const TARGET_HOST = "agentrouter.org";

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight options request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`[PROXY] [${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);

  // Only proxy POST requests to chat completions
  if (req.method === "POST" && req.url.includes("/chat/completions")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const options = {
        hostname: TARGET_HOST,
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers.authorization,
          // Emulate official Claude Code / claude-cli fingerprinting headers
          "User-Agent": "claude-cli/2.1.158 (external, sdk-cli)",
          "anthropic-client-name": "claude-code",
          "anthropic-client-version": "2.1.158",
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "claude-code-20250219",
          "x-stainless-lang": "js",
          "accept": "application/json"
        }
      };

      console.log(`[PROXY] Forwarding request to AgentRouter with spoofed Claude Code headers...`);

      const proxyReq = https.request(options, (proxyRes) => {
        console.log(`[PROXY] Received response from AgentRouter. Status: ${proxyRes.statusCode}`);
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        console.error("[PROXY] Request error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Proxy failed: " + err.message } }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    console.log(`[PROXY] Request ignored (not chat completions POST).`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`AgentRouter Proxy Server running on http://localhost:${PORT}`);
});
