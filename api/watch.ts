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

    const text = await response.text();

    // Only fix relative URLs (starting with /) — make them absolute Render URLs
    // so the browser fetches segments from Render, not from Vercel
    const fixed = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return line;
        if (trimmed.startsWith("http")) return line; // already absolute, leave alone
        if (trimmed.startsWith("/")) return API_BASE_URL + trimmed; // root-relative → absolute Render URL
        return line; // anything else leave alone
      })
      .join("\n");

    res.status(200).send(fixed);
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
