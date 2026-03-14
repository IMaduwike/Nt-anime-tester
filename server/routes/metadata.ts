import { RequestHandler } from "express";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export const handleMetadata: RequestHandler = async (req, res) => {
  const { anime } = req.query;

  console.log("[SERVER] Metadata endpoint called");
  console.log("[SERVER] Anime slug:", anime);

  if (!anime || typeof anime !== "string" || !anime.trim()) {
    res.status(400).json({ error: "Missing or empty anime parameter" });
    return;
  }

  const url = `${API_BASE_URL}/metadata?anime=${encodeURIComponent(anime)}`;
  console.log("[SERVER] Fetching:", url);

  try {
    const response = await fetch(url);

    console.log("[SERVER] Metadata response status:", response.status);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const data = await response.json();
    console.log("[SERVER] Metadata title:", data.title);
    res.status(200).json(data);
  } catch (error) {
    console.error("[SERVER] Metadata error:", error);
    res.status(500).json({
      error: "Metadata request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
