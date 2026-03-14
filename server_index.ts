import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSearch } from "./routes/search";
import { handleTrending } from "./routes/trending";
import { handleMetadata } from "./routes/metadata";
import { handleWatch } from "./routes/watch";
import { handleDownload } from "./routes/download";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health / ping
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Anime API routes
  app.get("/api/search", handleSearch);
  app.get("/api/trending", handleTrending);
  app.get("/api/metadata", handleMetadata);
  app.get("/api/watch/:anime/:episode", handleWatch);
  app.get("/api/download/:anime/:episode", handleDownload);

  return app;
}
