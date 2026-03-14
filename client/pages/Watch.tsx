import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Header from "@/components/Header";
import { Loader2, ArrowLeft } from "lucide-react";

interface AnimeMetadata {
  title: string;
  has_sub: boolean;
  has_dub: boolean;
  total_episodes: string;
  duration: string;
  thumbnail: string;
}

function formatTime(s: number) {
  if (isNaN(s) || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Watch() {
  const { url, episode } = useParams<{ url: string; episode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<"sub" | "dub">("sub");

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const currentEp = parseInt(episode || "1");
  const totalEps = parseInt(anime?.total_episodes || "0") || 0;

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
    const video = videoRef.current;
    const videoSrc = `/api/watch/${url}/${currentEp}${server === "dub" ? "?server=dub" : ""}`;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.play().catch(() => {});
    }
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [url, currentEp, server, anime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0)
        setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [anime]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); playing ? video.pause() : video.play(); break;
        case "ArrowRight": e.preventDefault(); video.currentTime = Math.min(video.currentTime + 10, video.duration); break;
        case "ArrowLeft": e.preventDefault(); video.currentTime = Math.max(video.currentTime - 10, 0); break;
        case "ArrowUp": e.preventDefault(); video.volume = Math.min(video.volume + 0.1, 1); break;
        case "ArrowDown": e.preventDefault(); video.volume = Math.max(video.volume - 0.1, 0); break;
        case "m": video.muted = !video.muted; break;
        case "f": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3500);
  }, [playing]);

  const togglePlay = () => { const v = videoRef.current; if (!v) return; playing ? v.pause() : v.play(); };
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    video.muted = v === 0;
  };

  const goTo = (ep: number) => navigate(`/anime/${url}/watch/${ep}`);
  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

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

        {/* Player */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden select-none"
          style={{
            background: "#000",
            borderRadius: "16px",
            aspectRatio: "16/9",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => playing && setShowControls(false)}
          onMouseEnter={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            style={{ cursor: "pointer", display: "block" }}
          />

          {/* Centre play icon when paused */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  border: "2px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              position: "absolute", inset: 0,
              opacity: showControls ? 1 : 0,
              pointerEvents: showControls ? "auto" : "none",
              transition: "opacity 0.3s ease",
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              padding: "0 20px 16px",
            }}
          >
            {/* Title row */}
            <div style={{ marginBottom: 10 }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0, opacity: 0.95 }}>
                {anime.title}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: 0, marginTop: 1 }}>
                Episode {currentEp}{anime.duration ? ` · ${anime.duration}` : ""}
              </p>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseEnter={() => setSeeking(true)}
              onMouseLeave={() => setSeeking(false)}
              style={{
                position: "relative", height: seeking ? 6 : 4,
                borderRadius: 9999, cursor: "pointer",
                background: "rgba(255,255,255,0.18)",
                marginBottom: 14,
                transition: "height 0.15s ease",
              }}
            >
              {/* Buffered */}
              <div style={{
                position: "absolute", inset: 0,
                width: `${bufferedPct}%`, borderRadius: 9999,
                background: "rgba(255,255,255,0.3)",
              }} />
              {/* Played */}
              <div style={{
                position: "absolute", inset: 0,
                width: `${progressPct}%`, borderRadius: 9999,
                background: "var(--accent-primary)",
              }} />
              {/* Thumb */}
              <div style={{
                position: "absolute", top: "50%",
                left: `${progressPct}%`,
                transform: `translate(-50%, -50%) scale(${seeking ? 1.3 : 1})`,
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--accent-primary)",
                boxShadow: "0 0 8px rgba(158,240,255,0.7)",
                transition: "transform 0.15s ease",
              }} />
            </div>

            {/* Controls row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

              {/* Play/Pause */}
              <button onClick={togglePlay} style={btnStyle}>
                {playing
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                }
              </button>

              {/* Skip back */}
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }} style={btnStyle} title="Back 10s">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <text x="9.5" y="14.5" fontSize="5.5" fill="white" stroke="none" fontWeight="bold">10</text>
                </svg>
              </button>

              {/* Skip forward */}
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }} style={btnStyle} title="Forward 10s">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  <text x="9.5" y="14.5" fontSize="5.5" fill="white" stroke="none" fontWeight="bold">10</text>
                </svg>
              </button>

              {/* Volume */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={toggleMute} style={btnStyle}>
                  {muted || volume === 0
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/></svg>
                    : volume < 0.5
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="white" strokeWidth="2"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="white" strokeWidth="2"/></svg>
                  }
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{ width: 70, accentColor: "var(--accent-primary)", cursor: "pointer" }}
                />
              </div>

              {/* Time */}
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontVariantNumeric: "tabular-nums", marginLeft: 2 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div style={{ flex: 1 }} />

              {/* Sub/Dub */}
              {(anime.has_sub || anime.has_dub) && (
                <div style={{ display: "flex", gap: 4 }}>
                  {anime.has_sub && (
                    <button
                      onClick={() => setServer("sub")}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px",
                        borderRadius: 6, border: "none", cursor: "pointer",
                        background: server === "sub" ? "var(--accent-primary)" : "rgba(255,255,255,0.15)",
                        color: server === "sub" ? "#000" : "#fff",
                        transition: "all 0.2s",
                      }}
                    >SUB</button>
                  )}
                  {anime.has_dub && (
                    <button
                      onClick={() => setServer("dub")}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px",
                        borderRadius: 6, border: "none", cursor: "pointer",
                        background: server === "dub" ? "var(--accent-primary)" : "rgba(255,255,255,0.15)",
                        color: server === "dub" ? "#000" : "#fff",
                        transition: "all 0.2s",
                      }}
                    >DUB</button>
                  )}
                </div>
              )}

              {/* Prev episode */}
              {currentEp > 1 && (
                <button onClick={() => goTo(currentEp - 1)} style={btnStyle} title="Previous episode">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2.5" height="16"/></svg>
                </button>
              )}

              {/* Next episode */}
              {currentEp < totalEps && (
                <button onClick={() => goTo(currentEp + 1)} style={btnStyle} title="Next episode">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,4 15,12 5,20"/><rect x="16.5" y="4" width="2.5" height="16"/></svg>
                </button>
              )}

              {/* Download */}
              <a href={downloadSrc} target="_blank" rel="noreferrer" style={{ ...btnStyle, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }} title="Download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} style={btnStyle} title="Fullscreen">
                {fullscreen
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Episode grid */}
        {totalEps > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Episodes
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
                    border: ep === currentEp ? "1px solid var(--accent-primary)" : "1px solid var(--border-soft)",
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

const btnStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "none", cursor: "pointer",
  transition: "background 0.15s ease",
  flexShrink: 0,
};
