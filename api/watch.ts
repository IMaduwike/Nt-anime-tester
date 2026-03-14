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
  if (proxyUrl && typeof proxyUrl === "string") {
    const target = decodeURIComponent(proxyUrl);
    console.log("[SERVER] HLS proxy request:", target);

    try {
      const headers: Record<string, string> = {};
      if (req.headers.range) headers["Range"] = req.headers.range;

      const upstream = await fetch(target, { headers });

      if (!upstream.ok && upstream.status === 404) {
        console.error("[SERVER] 404 from upstream:", target);
        res.status(404).json({ error: "Upstream 404", url: target });
        return;
      }

      const ct = upstream.headers.get("content-type") || "";
      res.setHeader("Content-Type", ct);
      if (upstream.headers.get("content-range")) {
        res.setHeader("Content-Range", upstream.headers.get("content-range")!);
      }

      const isPlaylist = ct.includes("mpegurl") || target.includes(".m3u8");

      if (isPlaylist) {
        const text = await upstream.text();
        const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
        const rewritten = rewriteM3u8(text, target, host);
        res.status(200).send(rewritten);
      } else {
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
    console.log("[SERVER] Raw manifest:\n", text.substring(0, 500));

    const host = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
    const rewritten = rewriteM3u8(text, upstreamUrl, host);
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

function rewriteM3u8(text: string, baseUrl: string, host: string): string {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const dir = parsed.href.substring(0, parsed.href.lastIndexOf("/") + 1);

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      let absolute: string;
      if (trimmed.startsWith("http")) {
        absolute = trimmed;
      } else if (trimmed.startsWith("/")) {
        absolute = origin + trimmed;
      } else {
        absolute = dir + trimmed;
      }

      return `${host}/api/watch?url=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}
