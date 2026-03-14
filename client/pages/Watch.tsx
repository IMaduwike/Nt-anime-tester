import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<"sub" | "dub">("sub");

  const currentEp = parseInt(episode || "1");

  useEffect(() => {
    if (!url) { navigate("/"); return; }
    setLoading(true);
    fetch(`/api/metadata?anime=${encodeURIComponent(url)}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((data: AnimeMetadata) => {
        setAnime(data);
        if (!data.has_sub && data.has_dub) setServer("dub");
      })
      .catch(() => navigate("/search"))
      .finally(() => setLoading(false));
  }, [url, navigate]);

  useEffect(() => {
    if (!anime || !videoRef.current) return;

    const videoSrc = `/api/watch/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;
    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [url, currentEp, server, anime]);

  const totalEps = parseInt(anime?.total_episodes || "0") || 0;
  const goTo = (ep: number) => navigate(`/anime/${url}/watch/${ep}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
        <div className="fixed inset-0 -z-50 space-bg opacity-40" />
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (!anime) return null;

  const downloadSrc = `/api/download/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="fixed inset-0 -z-50 space-bg opacity-40" />
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <Link
          to={`/anime/${url}`}
          className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {anime.title}
        </Link>

        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ background: "#000", border: "1px solid var(--border-soft)" }}
        >
          <video
            ref={videoRef}
            controls
            className="w-full"
            style={{ display: "block", maxHeight: "70vh" }}
          />
        </div>

        <div
          className="glass mt-4 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ color: "var(--text-main)" }}>{anime.title}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Episode {currentEp}{anime.duration ? ` · ${anime.duration}` : ""}
            </p>
          </div>

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
              >SUB</button>
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
              >DUB</button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" className="btn btn-secondary gap-1 text-xs" disabled={currentEp <= 1} onClick={() => goTo(currentEp - 1)}>
              <ChevronLeft className="w-3 h-3" /> Prev
            </Button>
            <Button variant="outline" className="btn btn-secondary gap-1 text-xs" disabled={currentEp >= totalEps} onClick={() => goTo(currentEp + 1)}>
              Next <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          <a href={downloadSrc} target="_blank" rel="noreferrer" className="shrink-0">
            <Button variant="outline" className="btn btn-secondary gap-2 text-xs">
              <Download className="w-3 h-3" /> Download
            </Button>
          </a>
        </div>

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
                    background: ep === currentEp ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
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
