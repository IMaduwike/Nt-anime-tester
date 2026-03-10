import { RequestHandler } from "express";

interface SearchResponse {
  keyword: string;
  results: Array<{
    title: string;
    url: string;
    thumbnail: string;
    episodes: {
      sub: number | null;
      dub: number | null;
      total: number | null;
    };
    type: string;
  }>;
}

export const handleSearch: RequestHandler = async (req, res) => {
  const { keyword } = req.query;

  console.log("[SERVER] Search endpoint called");
  console.log("[SERVER] Query params:", { keyword });

  if (!keyword || typeof keyword !== "string") {
    console.log("[SERVER] Missing or invalid keyword parameter");
    res.status(400).json({ error: "Missing keyword parameter" });
    return;
  }

  if (!keyword.trim()) {
    console.log("[SERVER] Empty keyword provided");
    res.status(400).json({ error: "Keyword cannot be empty" });
    return;
  }

  const encodedKeyword = encodeURIComponent(keyword);
  const externalUrl = `https://nt-anime-api.onrender.com/search?keyword=${encodedKeyword}`;

  console.log("[SERVER] Calling external API");
  console.log("[SERVER] External URL:", externalUrl);
  console.log("[SERVER] Keyword to search:", keyword);

  try {
    console.log("[SERVER] Initiating fetch request...");
    const response = await fetch(externalUrl);

    console.log("[SERVER] Response received");
    console.log("[SERVER] Status code:", response.status);
    console.log("[SERVER] Status text:", response.statusText);
    console.log("[SERVER] Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.warn("[SERVER] Non-OK response from external API");
      console.warn("[SERVER] Status:", response.status);
      res.status(response.status).json({
        error: `External API returned ${response.status}`,
      });
      return;
    }

    const data: SearchResponse = await response.json();

    console.log("[SERVER] JSON parsed successfully");
    console.log("[SERVER] Keyword from response:", data.keyword);
    console.log("[SERVER] Results count:", data.results?.length || 0);

    if (data.results && data.results.length > 0) {
      console.log("[SERVER] First result:", {
        title: data.results[0].title,
        url: data.results[0].url,
      });
    }

    console.log("[SERVER] Sending response to client");
    res.status(200).json(data);
    console.log("[SERVER] Response sent successfully");
  } catch (error) {
    console.error("[SERVER] Error during search:", error);

    if (error instanceof TypeError) {
      console.error("[SERVER] TypeError (likely network issue):", error.message);
    } else if (error instanceof SyntaxError) {
      console.error("[SERVER] SyntaxError (invalid JSON):", error.message);
    } else if (error instanceof Error) {
      console.error("[SERVER] Error message:", error.message);
      console.error("[SERVER] Error stack:", error.stack);
    }

    res.status(500).json({
      error: "Search request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
