import { RequestHandler } from "express";

const API_BASE_URL = "https://nt-anime-api.onrender.com";

export const handleTrending: RequestHandler = async (_req, res) => {
  console.log("[SERVER] Trending endpoint called");

  try {
    const response = await fetch(`${API_BASE_URL}/trending`);

    console.log("[SERVER] Trending response status:", response.status);

    if (!response.ok) {
      res.status(response.status).json({ error: `External API returned ${response.status}` });
      return;
    }

    const data = await response.json();
    console.log("[SERVER] Trending results count:", data.results?.length || 0);
    res.status(200).json(data);
  } catch (error) {
    console.error("[SERVER] Trending error:", error);
    res.status(500).json({
      error: "Trending request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
