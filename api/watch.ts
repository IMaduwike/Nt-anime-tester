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

  // ── Proxy mode: /api/watch?url=<encoded segment or playlist url>
  if (proxyUrl && typeof proxyUrl === "string") {
    const target = decodeURIComponent(proxyUrl);
    console.log("[SERVER] HLS proxy request:", target);

    try {
      const upstream = await fetch(target, {
        headers: { Range: req.headers.range || "" },
      });

      const ct = upstream.headers.get("content-type") || "";
      res.setHeader("Content-Type", ct);

      const isPlaylist = ct.includes("mpegurl") || target.includes(".m3u8");

      if (isPlaylist) {
        const text = await upstream.text();
        const base = target.substring(0, target.lastIndexOf("/") + 1);
        const rewritten = rewriteM3u8(text, base, req);
        res.status(200).send(rewritten);
      } else {
        // Raw segment — pipe bytes through untouched
        res.status(upstream.status);
        const reader = upstream.body?.getReader();
        if (!reader) { res.end(); return; }
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); break; }
            res.write(value);
          }
        };
        req.on("close", () => reader.cancel());
        await pump();
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

    const ct = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", ct || "application/vnd.apple.mpegurl");

    const text = await response.text();
    // The manifest URLs may be relative — resolve against the upstream URL
    const base = upstreamUrl.substring(0, upstreamUrl.lastIndexOf("/") + 1);
    const rewritten = rewriteM3u8(text, base, req);
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

// Rewrites all URLs in an m3u8 playlist to go through /api/watch?url=<encoded>
function rewriteM3u8(text: string, base: string, req: VercelRequest): string {
  const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("#")) return line;
      // Resolve relative URLs
      const absolute = trimmed.startsWith("http") ? trimmed : base + trimmed;
      return `${host}/api/watch?url=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}
