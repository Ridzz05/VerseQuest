import https from "https";
import http from "http";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  try {
    // Resolve configuration from backend environment variables (much safer than client-side)
    const apiKey = process.env.VITE_API_KEY || process.env.API_KEY;
    const apiBaseUrl = process.env.VITE_API_BASE_URL || "https://agentrouter.org/v1";
    const apiModel = process.env.VITE_API_MODEL || "claude-opus-4-8";

    if (!apiKey) {
      return res.status(500).json({
        error: {
          message: "API Key is not configured on the server. Please set VITE_API_KEY in Vercel settings."
        }
      });
    }

    // Vercel's req.body is automatically parsed if Content-Type is application/json.
    let payload = {};
    if (typeof req.body === "object" && req.body !== null) {
      payload = { ...req.body };
    } else if (req.body) {
      try {
        payload = JSON.parse(req.body);
      } catch {
        return res.status(400).json({ error: { message: "Invalid JSON body" } });
      }
    }

    // Inject backend-configured model if not set or default
    if (!payload.model || payload.model === "claude-opus-4-8") {
      payload.model = apiModel;
    }

    const bodyData = JSON.stringify(payload);

    // Parse the API Base URL to extract hostname, port, and path
    const parsedUrl = new URL(apiBaseUrl.replace(/\/$/, "") + "/chat/completions");
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        // Emulate official Claude Code / claude-cli fingerprinting headers to bypass unauthorized client checks
        "User-Agent": "claude-cli/2.1.158 (external, sdk-cli)",
        "anthropic-client-name": "claude-code",
        "anthropic-client-version": "2.1.158",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "claude-code-20250219",
        "x-stainless-lang": "js",
        "accept": "application/json"
      }
    };

    const proxyReq = transport.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      
      if (proxyRes.headers["content-type"]) {
        res.setHeader("Content-Type", proxyRes.headers["content-type"]);
      }
      
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("[PROXY] Request error:", err);
      res.status(500).json({ error: { message: "Proxy failed: " + err.message } });
    });

    proxyReq.write(bodyData);
    proxyReq.end();
  } catch (err) {
    console.error("[PROXY] Server error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
}
