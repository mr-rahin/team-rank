"use client";

import React, { useEffect, useRef, useState } from "react";
import { Crown, Medal, Award, Flame, Sparkles, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Team, getTeams } from "./api/leaderBor";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');`;

const POLL_INTERVAL_MS = 3000;

type Place = 1 | 2 | 3;
type FlashDir = "up" | "down";

interface PodiumConfig {
  h: number;
  avatar: number;
  icon: LucideIcon;
  label: string;
  grad: string;
  ring: string;
  glow: string;
  order: number;
  delay: number;
}

/* ------------------------------------------------------------------ */
/*  شمارنده‌ی انیمیشنی برای امتیازها                                   */
/* ------------------------------------------------------------------ */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 600;
    if (raf.current) cancelAnimationFrame(raf.current);

    function tick(now: number) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = to;
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  return <>{display}</>;
}

/* ------------------------------------------------------------------ */
/*  ذرات کانفتی برای صدرنشین جدید                                     */
/* ------------------------------------------------------------------ */
interface ConfettiPiece {
  id: string;
  left: number;
  color: string;
  dur: number;
  delay: number;
  rot: number;
  drift: number;
  size: number;
}

function ConfettiBurst({ trigger }: { trigger: string | null }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const colors = ["#FFC857", "#F472B6", "#7C5CFC", "#34D399", "#60A5FA"];
    const next: ConfettiPiece[] = Array.from({ length: 26 }).map((_, i) => ({
      id: `${trigger}-${i}`,
      left: 10 + Math.random() * 80,
      color: colors[i % colors.length],
      dur: 1.1 + Math.random() * 0.9,
      delay: Math.random() * 0.25,
      rot: Math.random() * 360,
      drift: (Math.random() - 0.5) * 120,
      size: 5 + Math.random() * 5,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2200);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!pieces.length) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 5 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={
            {
              position: "absolute",
              left: `${p.left}%`,
              top: 0,
              width: p.size,
              height: p.size * 1.6,
              background: p.color,
              borderRadius: 2,
              transform: `rotate(${p.rot}deg)`,
              animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  سکوی قهرمانی                                                      */
/* ------------------------------------------------------------------ */
function PodiumSlot({ team, place, justRose }: { team: Team; place: Place; justRose: boolean }) {
  const configs: Record<Place, PodiumConfig> = {
    1: {
      h: 200,
      avatar: 76,
      icon: Crown,
      label: "قهرمان کلاس",
      grad: "linear-gradient(180deg,#FFEFC2,#FFC857 50%,#B9852E)",
      ring: "#FFC857",
      glow: "rgba(255,200,87,0.55)",
      order: 2,
      delay: 0,
    },
    2: {
      h: 148,
      avatar: 58,
      icon: Medal,
      label: "نایب قهرمان",
      grad: "linear-gradient(180deg,#F6F8FC,#C7CBD4 50%,#8A93A3)",
      ring: "#C7CBD4",
      glow: "rgba(199,203,212,0.4)",
      order: 1,
      delay: 0.12,
    },
    3: {
      h: 116,
      avatar: 58,
      icon: Award,
      label: "مقام سوم",
      grad: "linear-gradient(180deg,#F3D0AC,#CD7F32 50%,#8A5423)",
      ring: "#CD7F32",
      glow: "rgba(205,127,50,0.4)",
      order: 3,
      delay: 0.24,
    },
  };
  const c = configs[place];
  const Icon = c.icon;
  const isChamp = place === 1;

  return (
    <div
      style={{
        order: c.order,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "0 0 31%",
        position: "relative",
        opacity: 0,
        animation: `podiumRise 0.7s cubic-bezier(.2,.9,.25,1) ${c.delay}s forwards`,
      }}
    >
      <ConfettiBurst trigger={isChamp && justRose ? `${team.id}-${team.points}` : null} />

      {isChamp && (
        <div style={{ position: "absolute", top: -14, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 2 }}>
          {[...Array(7)].map((_, i) => (
            <Sparkles
              key={i}
              size={9 + (i % 3) * 5}
              color="#FFE9A8"
              style={{
                position: "absolute",
                left: `${4 + i * 15}%`,
                top: `${(i % 3) * -12}px`,
                opacity: 0.85,
                animation: `twinkle 2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          animation: isChamp ? "float 3s ease-in-out infinite" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 10,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: c.avatar,
            height: c.avatar,
            borderRadius: "50%",
            background: c.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isChamp
              ? `0 0 0 4px #14111F, 0 0 0 5px ${c.ring}55, 0 0 32px ${c.glow}`
              : `0 0 0 3px #14111F, 0 0 0 4px ${c.ring}44, 0 0 14px ${c.glow}`,
            animation: isChamp ? "glow 2.4s ease-in-out infinite" : "none",
            position: "relative",
          }}
        >
          <Icon size={isChamp ? 36 : 27} color="#14111F" strokeWidth={2.4} />
          {isChamp && (
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: `2px solid ${c.ring}`,
                opacity: 0.5,
                animation: "ripple 2.4s ease-out infinite",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontFamily: "Vazirmatn",
            fontWeight: 700,
            fontSize: isChamp ? 16 : 14,
            color: "#F6F3FB",
            marginTop: 9,
            textAlign: "center",
            maxWidth: 118,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team.name}
        </div>
        <div style={{ fontFamily: "Lalezar", fontSize: isChamp ? 25 : 21, color: c.ring, marginTop: 3, letterSpacing: 0.5 }}>
          <AnimatedNumber value={team.points} />{" "}
          <span style={{ fontFamily: "Vazirmatn", fontSize: 12, color: "#A6A0C0", fontWeight: 500 }}>امتیاز</span>
        </div>
        <div style={{ fontFamily: "Vazirmatn", fontSize: 11, color: "#8981A6", marginTop: 2, fontWeight: 600 }}>{c.label}</div>
      </div>

      <div
        style={{
          width: "100%",
          height: c.h,
          background: c.grad,
          borderRadius: "16px 16px 0 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 12,
          boxShadow: `inset 0 3px 14px rgba(255,255,255,0.4), inset 0 -6px 18px rgba(0,0,0,0.18), 0 -4px 26px ${c.glow}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-60%",
            width: "50%",
            height: "100%",
            background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent)",
            animation: "shine 3.4s ease-in-out infinite",
            animationDelay: `${c.delay + 0.6}s`,
          }}
        />
        <span style={{ fontFamily: "Lalezar", fontSize: 38, color: "rgba(20,17,31,0.5)", zIndex: 1 }}>{place}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ردیف رتبه‌های ۴ به بعد                                             */
/* ------------------------------------------------------------------ */
function RankRow({ team, rank, flashDir, index }: { team: Team; rank: number; flashDir?: FlashDir; index: number }) {
  return (
    <div
      className={`team-row ${flashDir === "up" ? "row-flash-up" : flashDir === "down" ? "row-flash-down" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "11px 15px",
        marginBottom: 9,
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.05}s`,
        transition: "transform 0.25s ease, border-color 0.25s ease, background 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(-3px) scale(1.012)";
        e.currentTarget.style.background = "rgba(255,255,255,0.075)";
        e.currentTarget.style.borderColor = `${team.hue}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0) scale(1)";
        e.currentTarget.style.background = "rgba(255,255,255,0.045)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div style={{ fontFamily: "Lalezar", fontSize: 19, color: "#8B84AA", width: 26, textAlign: "center", flexShrink: 0 }}>{rank}</div>
      <div style={{ width: 9, height: 34, borderRadius: 5, background: team.hue, boxShadow: `0 0 10px ${team.hue}88`, flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: 14.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "Vazirmatn",
        }}
      >
        {team.name}
      </div>
      {flashDir && (
        <span style={{ display: "flex", alignItems: "center", animation: "popIn 0.35s ease" }}>
          {flashDir === "up" ? <TrendingUp size={15} color="#34D399" /> : <TrendingDown size={15} color="#FB7185" />}
        </span>
      )}
      <div style={{ fontFamily: "Lalezar", fontSize: 19, color: team.hue, minWidth: 34, textAlign: "center" }}>
        <AnimatedNumber value={team.points} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ذرات پس‌زمینه شناور                                                */
/* ------------------------------------------------------------------ */
function BackgroundOrbs() {
  const orbs = [
    { size: 340, top: "-8%", left: "-10%", color: "#7C5CFC", dur: 22 },
    { size: 300, top: "55%", left: "78%", color: "#F472B6", dur: 26 },
    { size: 220, top: "78%", left: "5%", color: "#FFC857", dur: 19 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: o.size,
            height: o.size,
            top: o.top,
            left: o.left,
            borderRadius: "50%",
            background: o.color,
            opacity: 0.14,
            filter: "blur(70px)",
            animation: `drift ${o.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}
      {[...Array(18)].map((_, i) => (
        <span
          key={`star-${i}`}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.4,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  کامپوننت اصلی                                                     */
/* ------------------------------------------------------------------ */
export default function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<Record<string, FlashDir>>({});
  const [championId, setChampionId] = useState<string | null>(null);
  const [championChanged, setChampionChanged] = useState(0);

  const prevPoints = useRef<Record<string, number>>({});
  const prevChampion = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getTeams();
        if (cancelled) return;

        const next: Record<string, FlashDir> = {};
        data.forEach((t: any) => {
          const prev = prevPoints.current[t.id];
          if (prev !== undefined && prev !== t.points) {
            next[t.id] = t.points > prev ? "up" : "down";
          }
        });
        prevPoints.current = Object.fromEntries(data.map((t: any) => [t.id, t.points]));

        const sortedData = [...data].sort((a: Team, b: Team) => b.points - a.points);
        const leader = sortedData[0]?.id ?? null;
        if (leader && leader !== prevChampion.current) {
          if (prevChampion.current !== null) setChampionChanged((n) => n + 1);
          prevChampion.current = leader;
        }
        setChampionId(leader);

        setTeams(data);
        setError(null);
        if (Object.keys(next).length) {
          setFlash(next);
          setTimeout(() => setFlash({}), 900);
        }
      } catch (err) {
        if (!cancelled) setError("اتصال به سرور برقرار نشد");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sorted = [...teams].sort((a, b) => b.points - a.points);
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const gap = podium.length > 1 ? podium[0].points - podium[1].points : 0;

  return (
    <div
      className="h-svh"
      dir="rtl"
      style={{
        fontFamily: "Vazirmatn, sans-serif",
        minHeight: "100%",
        position: "relative",
        background: "radial-gradient(circle at 50% -10%, #2A2246 0%, #14111F 55%, #0A0912 100%)",
        padding: "30px 16px 44px",
        color: "#F6F3FB",
        overflow: "hidden",
      }}
    >
      <style>{`
        ${FONT_IMPORT}

        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.22); } }
        @keyframes twinkle { 0%,100% { opacity: 0.15; transform: scale(0.75); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes ripple { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.35); opacity: 0; } }
        @keyframes shine { 0% { left: -60%; } 45%,100% { left: 130%; } }
        @keyframes drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-24px) scale(1.08); } }
        @keyframes podiumRise { from { opacity: 0; transform: translateY(26px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes flashUp { 0% { background-color: rgba(52,211,153,0.4); } 100% { background-color: transparent; } }
        @keyframes flashDown { 0% { background-color: rgba(251,113,133,0.4); } 100% { background-color: transparent; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(124,92,252,0.55); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(124,92,252,0); } }
        @keyframes titleGlow { 0%,100% { filter: drop-shadow(0 0 10px rgba(244,114,182,0.25)); } 50% { filter: drop-shadow(0 0 22px rgba(124,92,252,0.45)); } }
        @keyframes confettiFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(210px) translateX(var(--drift)) rotate(540deg); opacity: 0; }
        }
        .row-flash-up { animation: flashUp 0.9s ease-out; }
        .row-flash-down { animation: flashDown 0.9s ease-out; }
        .team-row { animation: slideIn 0.45s cubic-bezier(.2,.8,.3,1) both; }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <BackgroundOrbs />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: "#C4B5FF",
              background: "rgba(124,92,252,0.14)",
              padding: "5px 13px",
              borderRadius: 999,
              border: "1px solid rgba(124,92,252,0.4)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#7C5CFC",
                display: "inline-block",
                animation: "pulseDot 1.6s ease-in-out infinite",
              }}
            />
            رقابت زنده کلاس
            <Flame size={13} color="#FFC857" />
          </div>
          <h1
            style={{
              fontFamily: "Lalezar",
              fontSize: 42,
              margin: "12px 0 3px",
              background: "linear-gradient(90deg,#FFC857,#F472B6,#7C5CFC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "titleGlow 3s ease-in-out infinite",
              letterSpacing: 0.5,
            }}
          >
            میدان قهرمانان
          </h1>
          <p style={{ color: "#A79FC4", fontSize: 13, margin: 0 }}>
            هر پاسخ درست، یک قدم نزدیک‌تر به سکو 🔥
            {gap > 0 && gap <= 6 && <span style={{ color: "#FFC857", fontWeight: 700 }}> — فقط {gap} امتیاز تا صدر!</span>}
          </p>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "30px 0" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#7C5CFC",
                  animation: `float 0.9s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <p style={{ textAlign: "center", color: "#FB7185", fontSize: 13 }}>{error}</p>
        )}

        {!loading && podium.length > 0 && (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, maxWidth: 480, margin: "0 auto 32px", position: "relative" }}>
            {podium.map((t, i) => (
              <PodiumSlot key={t.id} team={t} place={(i + 1) as Place} justRose={t.id === championId && championChanged > 0} />
            ))}
          </div>
        )}

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {rest.map((t, i) => (
            <RankRow key={t.id} team={t} rank={i + 4} flashDir={flash[t.id]} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}