import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

const API_BASE = "https://nt-anime-api.onrender.com";

interface AnimeMetadata {
  title: string;
  has_sub: boolean;
  has_dub: boolean;
  total_episodes: string;
  duration: string;
  thumbnail: string;
}

export default function Watch() {
  const { url, episode } = useParams<{ url: string; episode: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<"sub" | "dub">("sub");

  const currentEp = parseInt(episode || "1");

  useEffect(() => {
    if (!url) { navigate("/"); return; }
    setLoading(true);
    fetch(`${API_BASE}/metadata?anime=${encodeURIComponent(url)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: AnimeMetadata) => {
        setAnime(data);
        if (!data.has_sub && data.has_dub) setServer("dub");
      })
      .catch(() => navigate("/search"))
      .finally(() => setLoading(false));
  }, [url, navigate]);

  const totalEps = parseInt(anime?.total_episodes || "0") || 0;

  const goTo = (ep: number) => {
    navigate(`/watch/${url}/${ep}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
        <div className="fixed inset-0 -z-50 space-bg opacity-40" />
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (!anime) return null;

  const videoSrc = `${API_BASE}/watch/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;
  const downloadSrc = `${API_BASE}/download/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="fixed inset-0 -z-50 space-bg opacity-40" />
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Back link */}
        <Link
          to={`/anime/${url}`}
          className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {anime.title}
        </Link>

        {/* Video player */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ background: "#000", border: "1px solid var(--border-soft)" }}
        >
          <video
            key={`${url}-${currentEp}-${server}`}
            controls
            autoPlay
            className="w-full"
            style={{ display: "block", maxHeight: "70vh" }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Controls bar */}
        <div
          className="glass mt-4 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: "var(--border-soft)" }}
        >
          {/* Title + episode */}
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ color: "var(--text-main)" }}>
              {anime.title}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Episode {currentEp} {anime.duration ? `· ${anime.duration}` : ""}
            </p>
          </div>

          {/* Sub/Dub toggle */}
          <div className="flex gap-2 shrink-0">
            {anime.has_sub && (
              <button
                onClick={() => setServer("sub")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: server === "sub" ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                  color: server === "sub" ? "#000" : "var(--text-muted)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                SUB
              </button>
            )}
            {anime.has_dub && (
              <button
                onClick={() => setServer("dub")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: server === "dub" ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                  color: server === "dub" ? "#000" : "var(--text-muted)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                DUB
              </button>
            )}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="btn btn-secondary gap-1 text-xs"
              disabled={currentEp <= 1}
              onClick={() => goTo(currentEp - 1)}
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </Button>
            <Button
              variant="outline"
              className="btn btn-secondary gap-1 text-xs"
              disabled={currentEp >= totalEps}
              onClick={() => goTo(currentEp + 1)}
            >
              Next <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {/* Download */}
          <a href={downloadSrc} target="_blank" rel="noreferrer" className="shrink-0">
            <Button variant="outline" className="btn btn-secondary gap-2 text-xs">
              <Download className="w-3 h-3" /> Download
            </Button>
          </a>
        </div>

        {/* Episode grid */}
        {totalEps > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              All Episodes
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16 gap-1.5">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((ep) => (
                <button
                  key={ep}
                  onClick={() => goTo(ep)}
                  className="rounded-lg py-2 text-xs font-semibold transition-all hover-lift"
                  style={{
                    background: ep === currentEp
                      ? "var(--accent-primary)"
                      : "rgba(255,255,255,0.05)",
                    color: ep === currentEp ? "#000" : "var(--text-muted)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
