import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

interface AnimeMetadata {
  title: string;
  has_sub: boolean;
  has_dub: boolean;
  total_episodes: string;
  duration: string;
  thumbnail: string;
}

type DownloadStatus = "idle" | "starting" | "processing" | "ready" | "failed";

interface DownloadJob {
  token: string;
  status: DownloadStatus;
  filename?: string;
  animeTitle: string;
  animeSlug: string;
  episode: number;
}

// ── Cookie helpers ─────────────────────────────────────────────────────────
const COOKIE_NAME = "nt_dl_job";
const COOKIE_MAX_AGE = 30 * 60; // 30 minutes — matches server expiry

function setCookie(data: object) {
  const value = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

function getCookie(): { token: string; animeTitle: string; animeSlug: string; episode: number; startedAt: number } | null {
  const match = document.cookie.split("; ").find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

// ── Notification helpers ───────────────────────────────────────────────────
async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const n = new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico" });
  setTimeout(() => n.close(), 6000);
}

function formatTime(s: number) {
  if (isNaN(s) || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const btnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "none", cursor: "pointer",
  flexShrink: 0,
};

const animeFacts = [
  "One Piece has been running since 1999 — over 1000 episodes 🏴‍☠️",
  "Naruto ran for 15 years straight across two series 🍥",
  "Attack on Titan's final season took 4 years to finish 👀",
  "Jujutsu Kaisen became a top 10 anime in under a year ⚡",
  "Dragon Ball Z first aired in 1989 — older than most of us 🐉",
  "Fullmetal Alchemist: Brotherhood has a 9.1 on MAL 🔥",
  "Demon Slayer's Mugen Train became the highest-grossing anime film 🎬",
  "Hunter x Hunter has been on hiatus more than it's been running 💀",
  "Steins;Gate has one of the most beloved stories in anime history ⏳",
  "Vinland Saga won Best Drama at the Crunchyroll Anime Awards 🏆",
];

export default function Watch() {
  const { url, episode } = useParams<{ url: string; episode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [anime, setAnime] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<"sub" | "dub">("sub");

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const [downloadJob, setDownloadJob] = useState<DownloadJob | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: "success" | "error";
    message: string;
    time: Date;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentEp = parseInt(episode || "1");
  const totalEps = parseInt(anime?.total_episodes || "0") || 0;
  const unreadCount = notifications.filter(n => !n.read).length;
  const isDownloading = downloadJob !== null;

  // Cycle facts while modal is open
  useEffect(() => {
    if (!showModal) return;
    setFactIndex(Math.floor(Math.random() * animeFacts.length));
    const interval = setInterval(() => setFactIndex(i => (i + 1) % animeFacts.length), 4000);
    return () => clearInterval(interval);
  }, [showModal]);

  const addNotification = useCallback((type: "success" | "error", message: string) => {
    setNotifications(prev => [{
      id: crypto.randomUUID(), type, message, time: new Date(), read: false,
    }, ...prev]);
  }, []);

  // ── Trigger the actual browser file download ───────────────────────────
  const triggerFileDownload = useCallback((token: string, filename: string) => {
    const a = document.createElement("a");
    a.href = `/api/download?action=file&token=${token}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // ── Poll download status ───────────────────────────────────────────────
  const startPolling = useCallback((token: string, animeTitle: string, ep: number) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/download?action=status&token=${token}`);

        // 404 means job expired on server — clear cookie and stop
        if (r.status === 404) {
          clearInterval(pollRef.current!);
          clearCookie();
          setDownloadJob(null);
          setShowModal(false);
          addNotification("error", `Download job for ${animeTitle} EP${ep} expired`);
          return;
        }

        if (!r.ok) return; // temporary error, keep polling

        const data = await r.json() as { status: string; filename: string };

        if (data.status === "ready") {
          clearInterval(pollRef.current!);
          clearCookie(); // job complete — remove cookie

          setDownloadJob(prev => prev ? { ...prev, status: "ready", filename: data.filename } : null);
          setShowModal(false);

          triggerFileDownload(token, data.filename);

          sendNotification("Download Ready! 🎉", `${animeTitle} Episode ${ep} is downloading now`);
          addNotification("success", `${animeTitle} EP${ep} download started`);

          setTimeout(() => setDownloadJob(null), 3000);

        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          clearCookie();

          setDownloadJob(prev => prev ? { ...prev, status: "failed" } : null);
          setShowModal(false);

          sendNotification("Download Failed 😞", `${animeTitle} Episode ${ep} could not be downloaded`);
          addNotification("error", `${animeTitle} EP${ep} download failed`);

          setTimeout(() => setDownloadJob(null), 3000);
        }
        // still "processing" — keep polling
      } catch {
        // network blip — keep polling silently
      }
    }, 3000);
  }, [addNotification, triggerFileDownload]);

  // ── On mount: check cookie for a pending job ───────────────────────────
  // This is what survives tab close/refresh
  useEffect(() => {
    const saved = getCookie();
    if (!saved) return;

    const ageMs = Date.now() - saved.startedAt;
    if (ageMs > 15 * 60 * 1000) {
      // Cookie survived but job is definitely expired on server
      clearCookie();
      return;
    }

    console.log("[DOWNLOAD] Resuming job from cookie:", saved.token);

    setDownloadJob({
      token: saved.token,
      status: "processing",
      animeTitle: saved.animeTitle,
      animeSlug: saved.animeSlug,
      episode: saved.episode,
    });

    // Show a subtle toast rather than the full modal on resume
    addNotification("success", `Resuming download: ${saved.animeTitle} EP${saved.episode}`);

    // Resume polling
    startPolling(saved.token, saved.animeTitle, saved.episode);
  }, []); // empty deps — runs once on mount only

  // ── Handle download button click ──────────────────────────────────────
  const handleDownload = async () => {
    if (downloadJob) {
      // Already in progress — just show the modal
      setShowModal(true);
      return;
    }

    await requestNotificationPermission();

    const animeTitle = anime?.title || url || "";
    const animeSlug = url || "";

    setShowModal(true);
    setDownloadJob({
      token: "",
      status: "starting",
      animeTitle,
      animeSlug,
      episode: currentEp,
    });

    try {
      const r = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime: url, episode: currentEp, server }),
      });

      if (!r.ok) throw new Error("Failed to start job");

      const { token } = await r.json() as { token: string };

      // Save to cookie immediately — survives tab close from this point
      setCookie({ token, animeTitle, animeSlug, episode: currentEp, startedAt: Date.now() });

      setDownloadJob(prev => prev ? { ...prev, token, status: "processing" } : null);

      startPolling(token, animeTitle, currentEp);

    } catch {
      clearCookie();
      setDownloadJob(null);
      setShowModal(false);
      addNotification("error", `Failed to start download for EP${currentEp}`);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => {
    if (!url) { navigate("/"); return; }
    setLoading(true);
    fetch(`/api/metadata?anime=${encodeURIComponent(url)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: AnimeMetadata) => { setAnime(data); if (!data.has_sub && data.has_dub) setServer("dub"); })
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
      hls.on(Hls.Events.MANIFEST_PARSED, () => {});
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
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
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => setMuted(video.muted);
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
      if (!video || (e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); playing ? video.pause() : video.play(); break;
        case "ArrowRight": e.preventDefault(); video.currentTime = Math.min(video.currentTime + 10, video.duration); break;
        case "ArrowLeft": e.preventDefault(); video.currentTime = Math.max(video.currentTime - 10, 0); break;
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
    controlsTimerRef.current = setTimeout(() => { if (playing) setShowControls(false); }, 3500);
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
    video.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
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

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="fixed inset-0 -z-50 space-bg opacity-40" />
      <Header />

      {/* ── Download Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="glass rounded-2xl p-8 flex flex-col items-center gap-6 mx-4"
            style={{ borderColor: "var(--border-soft)", maxWidth: 400, width: "100%" }}
          >
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: "3px solid var(--border-soft)", borderTopColor: "var(--accent-primary)" }} />
              <span className="text-lg font-bold" style={{ color: "var(--accent-primary)" }}>NT</span>
            </div>

            <div className="text-center">
              <p className="font-bold text-lg mb-1" style={{ color: "var(--text-main)" }}>
                {downloadJob?.status === "starting" ? "Starting Download..." : "Preparing Your Download"}
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                {downloadJob?.animeTitle} · Episode {downloadJob?.episode}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Converting stream to MP4. Takes 30–60 seconds.
              </p>
            </div>

            <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "var(--border-soft)" }}>
              <div style={{
                height: "100%", width: "40%", borderRadius: 9999,
                background: "var(--accent-primary)",
                animation: "indeterminate 1.8s ease-in-out infinite",
              }} />
            </div>

            <div
              className="rounded-xl px-4 py-3 text-center w-full"
              style={{ background: "rgba(158,240,255,0.06)", border: "1px solid rgba(158,240,255,0.12)" }}
            >
              <p className="text-xs mb-2 font-semibold uppercase tracking-wider" style={{ color: "var(--accent-primary)" }}>
                Did you know?
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{animeFacts[factIndex]}</p>
            </div>

            {/* Cookie notice */}
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Job saved — safe to close this tab
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              Hide — download continues in background
            </button>
          </div>

          <style>{`
            @keyframes indeterminate {
              0%   { transform: translateX(-200%); }
              100% { transform: translateX(600%); }
            }
          `}</style>
        </div>
      )}

      {/* ── Notifications Panel ── */}
      {showNotifications && (
        <div
          className="fixed top-20 right-4 z-40 glass rounded-2xl overflow-hidden"
          style={{ borderColor: "var(--border-soft)", width: 320, maxHeight: 400 }}
        >
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--text-main)" }}>Notifications</p>
            <div className="flex gap-3 items-center">
              {notifications.length > 0 && (
                <button onClick={() => setNotifications([])}
                  className="text-xs hover:opacity-70" style={{ color: "var(--text-muted)" }}>
                  Clear all
                </button>
              )}
              <button onClick={() => setShowNotifications(false)}
                className="text-xs hover:opacity-70" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                style={{
                  borderBottom: "1px solid var(--border-soft)",
                  background: n.read ? "transparent" : "rgba(158,240,255,0.04)",
                }}
                onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
              >
                {n.type === "success"
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4ade80" }} />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--text-main)" }}>{n.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: "var(--accent-primary)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link to={`/anime/${url}`}
            className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" />
            Back to {anime.title}
          </Link>

          {/* Notification bell */}
          <button
            onClick={() => {
              setShowNotifications(v => !v);
              if (!showNotifications) setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
            className="relative p-2 rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-main)" }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "var(--accent-primary)", color: "#000" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Resumed job banner ── */}
        {isDownloading && !showModal && (
          <div
            className="mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
            style={{ background: "rgba(158,240,255,0.06)", border: "1px solid rgba(158,240,255,0.2)" }}
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: "var(--accent-primary)" }} />
              <p className="text-sm" style={{ color: "var(--text-main)" }}>
                Preparing download: <span className="font-semibold">{downloadJob?.animeTitle} EP{downloadJob?.episode}</span>
              </p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="text-xs shrink-0 hover:opacity-70" style={{ color: "var(--accent-primary)" }}>
              View
            </button>
          </div>
        )}

        {/* ── Video Player ── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden select-none"
          style={{ background: "#000", borderRadius: "16px", aspectRatio: "16/9", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => playing && setShowControls(false)}
          onMouseEnter={() => setShowControls(true)}
        >
          <video ref={videoRef} className="w-full h-full object-contain"
            onClick={togglePlay} style={{ cursor: "pointer", display: "block" }} />

          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 72, height: 72, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(4px)",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
              </div>
            </div>
          )}

          <div style={{
            position: "absolute", inset: 0, opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? "auto" : "none", transition: "opacity 0.3s ease",
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 35%, transparent 60%)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 16px 14px",
          }}>
            <div ref={progressRef} onClick={handleProgressClick}
              onMouseEnter={() => setSeeking(true)} onMouseLeave={() => setSeeking(false)}
              style={{
                position: "relative", height: seeking ? 6 : 4, borderRadius: 9999,
                cursor: "pointer", background: "rgba(255,255,255,0.2)",
                marginBottom: 12, transition: "height 0.15s ease",
              }}>
              <div style={{ position: "absolute", inset: 0, width: `${bufferedPct}%`, borderRadius: 9999, background: "rgba(255,255,255,0.3)" }} />
              <div style={{ position: "absolute", inset: 0, width: `${progressPct}%`, borderRadius: 9999, background: "var(--accent-primary)" }} />
              <div style={{
                position: "absolute", top: "50%", left: `${progressPct}%`,
                transform: `translate(-50%, -50%) scale(${seeking ? 1.3 : 1})`,
                width: 13, height: 13, borderRadius: "50%",
                background: "var(--accent-primary)", boxShadow: "0 0 8px rgba(158,240,255,0.8)",
                transition: "transform 0.15s ease",
              }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={togglePlay} style={btnStyle}>
                {playing
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>}
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }} style={btnStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                  <text x="8.5" y="21" fontSize="5" fill="white" fontWeight="bold">10</text>
                </svg>
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }} style={btnStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M11.5 8c2.65 0 5.05 1 6.9 2.6L22 7v9h-9l3.62-3.62C15.23 11.22 13.46 10.5 11.5 10.5c-3.54 0-6.55 2.31-7.6 5.5l-2.37-.78C2.92 11.03 6.85 8 11.5 8z"/>
                  <text x="8.5" y="21" fontSize="5" fill="white" fontWeight="bold">10</text>
                </svg>
              </button>
              <button onClick={toggleMute} style={btnStyle}>
                {muted
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="white" strokeWidth="2"/></svg>}
              </button>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={toggleFullscreen} style={btnStyle}>
                {fullscreen
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="glass mt-4 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ color: "var(--text-main)" }}>{anime.title}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Episode {currentEp}{anime.duration ? ` · ${anime.duration}` : ""}
            </p>
          </div>

          {(anime.has_sub || anime.has_dub) && (
            <div className="flex gap-2 shrink-0">
              {anime.has_sub && (
                <button onClick={() => setServer("sub")}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: server === "sub" ? "var(--accent-primary)" : "rgba(255,255,255,0.06)",
                    color: server === "sub" ? "#000" : "var(--text-muted)",
                    border: "1px solid var(--border-soft)",
                  }}>SUB</button>
              )}
              {anime.has_dub && (
                <button onClick={() => setServer("dub")}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: server === "dub" ? "var(--accent-primary)" : "rgba(255,255,255,0.06)",
                    color: server === "dub" ? "#000" : "var(--text-muted)",
                    border: "1px solid var(--border-soft)",
                  }}>DUB</button>
              )}
            </div>
          )}

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" className="btn btn-secondary gap-1 text-xs"
              disabled={currentEp <= 1} onClick={() => goTo(currentEp - 1)}>
              <ChevronLeft className="w-3 h-3" /> Prev
            </Button>
            <Button variant="outline" className="btn btn-secondary gap-1 text-xs"
              disabled={currentEp >= totalEps} onClick={() => goTo(currentEp + 1)}>
              Next <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            className="btn btn-secondary gap-2 text-xs shrink-0"
            onClick={handleDownload}
            style={isDownloading ? { borderColor: "var(--accent-primary)", color: "var(--accent-primary)" } : {}}
          >
            {isDownloading
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</>
              : <><Download className="w-3 h-3" /> Download</>
            }
          </Button>
        </div>

        {/* ── Episode grid ── */}
        {totalEps > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Episodes
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16 gap-1.5">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((ep) => (
                <button key={ep} onClick={() => goTo(ep)}
                  className="rounded-lg py-2 text-xs font-semibold transition-all hover-lift"
                  style={{
                    background: ep === currentEp ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: ep === currentEp ? "#000" : "var(--text-muted)",
                    border: ep === currentEp ? "1px solid var(--accent-primary)" : "1px solid var(--border-soft)",
                  }}>
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
