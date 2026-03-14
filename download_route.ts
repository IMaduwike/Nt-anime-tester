import { RequestHandler } from "express";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export const handleDownload: RequestHandler = async (req, res) => {
  const { anime, episode } = req.params;
  const { server } = req.query;

  console.log("[SERVER] Download endpoint called");
  console.log("[SERVER] Anime:", anime, "Episode:", episode, "Server:", server);

  if (!anime || !episode) {
    res.status(400).json({ error: "Missing anime or episode parameter" });
    return;
  }

  const query = server === "dub" ? "?server=dub" : "";
  const url = `${API_BASE_URL}/download/${encodeURIComponent(anime)}/${encodeURIComponent(episode)}${query}`;

  console.log("[SERVER] Proxying download from:", url);

  try {
    const response = await fetch(url);

    console.log("[SERVER] Download response status:", response.status);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const filename = `nt-animes-${anime}-ep${episode}.mp4`;

    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: "No response body from external API" });
      return;
    }

    res.status(200);

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        const canContinue = res.write(value);
        if (!canContinue) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
    };

    req.on("close", () => reader.cancel());
    await pump();
  } catch (error) {
    console.error("[SERVER] Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
