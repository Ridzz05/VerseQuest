import https from "https";

// Vercel serverless function (replaces the local `node proxy.cjs`).
// The browser calls this same-origin (/api/chat/completions) and this function
// forwards the request to AgentRouter server-to-server (no CORS issues).

export const config = {
  api: { bodyParser: false }
};

const TARGET_HOST = "agentrouter.org";

export default function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST, OPTIONS").end("Method Not Allowed");
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    const options = {
      method: "POST",
      hostname: TARGET_HOST,
      path: "/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers["authorization"],
        // Spoofed Claude Code headers (kept for parity with proxy.cjs).
        // NOTE: review AgentRouter's terms of service before relying on these.
        "User-Agent": "claude-cli/2.1.158 (external, sdk-cli)",
        "anthropic-client-name": "claude-code",
        "anthropic-client-version": "2.1.158",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "claude-code-20250219",
        "x-stainless-lang": "js",
        "accept": "application/json"
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (key.toLowerCase() === "transfer-encoding") return;
        res.setHeader(key, value);
      });
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      res.status(502).setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: "Proxy failed: " + err.message } }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
}
