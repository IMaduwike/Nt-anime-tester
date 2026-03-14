import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { anime, episode, server } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

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

    // Serve the manifest as-is — Render's /hls-proxy already handles CDN CORS
    const text = await response.text();
    res.status(200).send(text);
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
