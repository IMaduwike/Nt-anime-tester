import { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Route: /api/watch/[anime]/[episode]
  // Vercel provides path segments via query when using file-based routing,
  // but since we use vercel.json rewrites, params come through req.query.
  const { anime, episode, server } = req.query;

  console.log("[SERVER] Watch API endpoint invoked");
  console.log("[SERVER] Anime:", anime, "Episode:", episode, "Server:", server);

  if (
    !anime || typeof anime !== "string" ||
    !episode || typeof episode !== "string"
  ) {
    res.status(400).json({ error: "Missing anime or episode parameter" });
    return;
  }

  const query = server === "dub" ? "?server=dub" : "";
  const url = `${API_BASE_URL}/watch/${encodeURIComponent(anime)}/${encodeURIComponent(episode)}${query}`;

  console.log("[SERVER] Proxying watch stream from:", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: "No response body" });
      return;
    }

    res.status(response.status);

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(value);
      }
    };

    req.on("close", () => reader.cancel());
    await pump();
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
