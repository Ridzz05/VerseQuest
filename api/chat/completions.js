import https from "https";

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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: { message: "Missing Authorization header" } });
    }

    // Vercel's req.body is automatically parsed if Content-Type is application/json.
    // We re-serialize it to forward to AgentRouter.
    let bodyData;
    if (typeof req.body === "object") {
      bodyData = JSON.stringify(req.body);
    } else {
      bodyData = req.body || "";
    }

    const options = {
      hostname: "agentrouter.org",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
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

    const proxyReq = https.request(options, (proxyRes) => {
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
