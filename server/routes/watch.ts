import { RequestHandler } from "express";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export const handleWatch: RequestHandler = async (req, res) => {
  const { anime, episode } = req.params;
  const { server } = req.query;

  console.log("[SERVER] Watch endpoint called");
  console.log("[SERVER] Anime:", anime, "Episode:", episode, "Server:", server);

  if (!anime || !episode) {
    res.status(400).json({ error: "Missing anime or episode parameter" });
    return;
  }

  const query = server === "dub" ? "?server=dub" : "";
  const url = `${API_BASE_URL}/watch/${encodeURIComponent(anime)}/${encodeURIComponent(episode)}${query}`;

  console.log("[SERVER] Proxying watch stream from:", url);

  try {
    const response = await fetch(url);

    console.log("[SERVER] Watch response status:", response.status);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    // Forward content-type and content-length headers so the browser handles the video correctly
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    // Stream the response body directly to the client
    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: "No response body from external API" });
      return;
    }

    res.status(response.status);

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
    console.error("[SERVER] Watch stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Watch stream failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
