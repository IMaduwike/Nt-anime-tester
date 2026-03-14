import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { anime, episode, server, url: proxyUrl } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // ── Proxy mode: /api/watch?url=<encoded url>
  // Used for segment/playlist URLs that the backend already rewrote
  if (proxyUrl && typeof proxyUrl === "string") {
    const target = decodeURIComponent(proxyUrl);
    console.log("[SERVER] HLS proxy request:", target);

    try {
      const headers: Record<string, string> = {};
      if (req.headers.range) headers["Range"] = req.headers.range;

      const upstream = await fetch(target, { headers });
      const ct = upstream.headers.get("content-type") || "";

      res.setHeader("Content-Type", ct);
      if (upstream.headers.get("content-range")) {
        res.setHeader("Content-Range", upstream.headers.get("content-range")!);
      }

      const isPlaylist = ct.includes("mpegurl") || target.includes(".m3u8");

      if (isPlaylist) {
        // Rewrite playlist URLs to go back through this proxy
        const text = await upstream.text();
        const base = target.substring(0, target.lastIndexOf("/") + 1);
        const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
        const rewritten = rewriteM3u8(text, base, host);
        res.status(200).send(rewritten);
      } else {
        // Raw segment — pipe bytes through untouched
        res.status(upstream.status);
        const reader = upstream.body?.getReader();
        if (!reader) { res.end(); return; }
        req.on("close", () => reader.cancel());
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          res.write(value);
        }
      }
    } catch (err) {
      console.error("[SERVER] Proxy error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Proxy failed" });
    }
    return;
  }

  // ── Master manifest mode: /api/watch/<anime>/<episode>
  if (
    !anime || typeof anime !== "string" ||
    !episode || typeof episode !== "string"
  ) {
    res.status(400).json({ error: "Missing anime or episode parameter" });
    return;
  }

  const query = server === "dub" ? "?server=dub" : "";
  const upstreamUrl = `${API_BASE_URL}/watch/${encodeURIComponent(anime)}/${encodeURIComponent(episode)}${query}`;

  console.log("[SERVER] Watch API endpoint invoked");
  console.log("[SERVER] Fetching manifest from:", upstreamUrl);

  try {
    const response = await fetch(upstreamUrl);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const ct = response.headers.get("content-type") || "application/vnd.apple.mpegurl";
    res.setHeader("Content-Type", ct);

    const text = await response.text();
    const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

    // Rewrite all URLs in the manifest to go through this proxy
    // Base = the upstream URL's directory for resolving relative paths
    const base = upstreamUrl.substring(0, upstreamUrl.lastIndexOf("/") + 1);
    const rewritten = rewriteM3u8(text, base, host);
    res.status(200).send(rewritten);
  } catch (error) {
    console.error("[SERVER] Watch stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Watch stream failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

function rewriteM3u8(text: string, base: string, host: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      // Resolve to absolute URL if relative
      const absolute = trimmed.startsWith("http") ? trimmed : base + trimmed;
      return `${host}/api/watch?url=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}
