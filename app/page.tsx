"use client";

import React, { useEffect, useState } from "react";
import { Crown, Medal, Award, Flame, LucideIcon } from "lucide-react";
import { Team, getTeams } from "./api/leaderBor";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;600;700;900&display=swap');`;

const POLL_INTERVAL_MS = 3000;

type Place = 1 | 2 | 3;

interface PodiumConfig {
  h: number;
  icon: LucideIcon;
  label: string;
  grad: string;
  ring: string;
  order: number;
  delay: string;
}

function PodiumSlot({ team, place }: { team: Team; place: Place }) {
  const configs: Record<Place, PodiumConfig> = {
    1: { h: 190, icon: Crown, label: "قهرمان کلاس", grad: "linear-gradient(180deg,#FFE9A8,#FFC857 55%,#B9852E)", ring: "#FFC857", order: 2, delay: "0s" },
    2: { h: 140, icon: Medal, label: "نایب قهرمان", grad: "linear-gradient(180deg,#F1F4F9,#C7CBD4 55%,#8A93A3)", ring: "#C7CBD4", order: 1, delay: "0.15s" },
    3: { h: 110, icon: Award, label: "مقام سوم", grad: "linear-gradient(180deg,#F0C9A6,#CD7F32 55%,#8A5423)", ring: "#CD7F32", order: 3, delay: "0.3s" },
  };
  const config = configs[place];
  const Icon = config.icon;
  const isChamp = place === 1;

  return (
    <div className="" style={{ order: config.order, display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 30%", position: "relative" }}>
      {isChamp && (
        <div style={{ position: "absolute", top: -6, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${10 + i * 15}%`,
                top: `${(i % 3) * -14}px`,
                fontSize: 10 + (i % 3) * 4,
                color: "#FFE9A8",
                animation: `twinkle 1.8s ease-in-out ${i * 0.22}s infinite`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          animation: isChamp ? "float 3s ease-in-out infinite" : "none",
          animationDelay: config.delay,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: isChamp ? 68 : 54,
            height: isChamp ? 68 : 54,
            borderRadius: "50%",
            background: config.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isChamp ? `0 0 0 4px #12101C, 0 0 28px ${config.ring}` : `0 0 0 3px #12101C, 0 0 12px ${config.ring}55`,
            animation: isChamp ? "glow 2.2s ease-in-out infinite" : "none",
          }}
        >
          <Icon size={isChamp ? 34 : 26} color="#12101C" strokeWidth={2.4} />
        </div>
        <div style={{ fontFamily: "Vazirmatn", fontWeight: 700, fontSize: 15, color: "#F4F1F9", marginTop: 8, textAlign: "center", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {team.name}
        </div>
        <div style={{ fontFamily: "Lalezar", fontSize: 22, color: config.ring, marginTop: 2 }}>
          {team.points} <span style={{ fontFamily: "Vazirmatn", fontSize: 12, color: "#A6A0C0" }}>امتیاز</span>
        </div>
        <div style={{ fontFamily: "Vazirmatn", fontSize: 11, color: "#8981A6", marginTop: 2 }}>{config.label}</div>
      </div>
      <div
        style={{
          width: "100%",
          height: config.h,
          background: config.grad,
          borderRadius: "14px 14px 0 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 10,
          boxShadow: `inset 0 3px 10px rgba(255,255,255,0.35), 0 -2px 20px ${config.ring}33`,
          position: "relative",
        }}
      >
        <span style={{ fontFamily: "Lalezar", fontSize: 34, color: "rgba(18,16,28,0.55)" }}>{place}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    let cancelled = false;
    let prevPoints: Record<string, number> = {};

    async function poll() {
      try {
        const data = await getTeams();
        if (cancelled) return;

        const next: Record<string, "up" | "down"> = {};
        data.forEach((t: any) => {
          if (prevPoints[t.id] !== undefined && prevPoints[t.id] !== t.points) {
            next[t.id] = t.points > prevPoints[t.id] ? "up" : "down";
          }
        });
        prevPoints = Object.fromEntries(data.map((t: any) => [t.id, t.points]));

        setTeams(data);
        setError(null);
        if (Object.keys(next).length) {
          setFlash(next);
          setTimeout(() => setFlash({}), 700);
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

  return (
    <div className="h-svh " dir="rtl" style={{ fontFamily: "Vazirmatn, sans-serif", minHeight: "100%", background: "radial-gradient(circle at 50% -10%, #241F3D 0%, #12101C 55%, #0A0912 100%)", padding: "28px 16px 40px", color: "#F4F1F9" }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.18); } }
        @keyframes twinkle { 0%,100% { opacity: 0.15; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes flashUp { 0% { background-color: rgba(52,211,153,0.35); } 100% { background-color: transparent; } }
        @keyframes flashDown { 0% { background-color: rgba(251,113,133,0.35); } 100% { background-color: transparent; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .row-flash-up { animation: flashUp 0.7s ease-out; }
        .row-flash-down { animation: flashDown 0.7s ease-out; }
        .team-row { animation: slideIn 0.4s ease both; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#B9A7FF", background: "rgba(124,92,252,0.12)", padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(124,92,252,0.35)" }}>
          <Flame size={13} /> رقابت زنده کلاس
        </div>
        <h1 style={{ fontFamily: "Lalezar", fontSize: 40, margin: "10px 0 2px", background: "linear-gradient(90deg,#FFC857,#F472B6,#7C5CFC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          میدان قهرمانان
        </h1>
        <p style={{ color: "#9C93BB", fontSize: 13, margin: 0 }}>هر پاسخ درست، یک قدم نزدیک‌تر به سکو 🔥</p>
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: "#9C93BB", fontSize: 13 }}>در حال بارگذاری...</p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "#FB7185", fontSize: 13 }}>{error}</p>
      )}

      {!loading && podium.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, maxWidth: 460, margin: "0 auto 30px" }}>
          {podium.map((t, i) => (
            <PodiumSlot key={t.id} team={t} place={(i + 1) as Place} />
          ))}
        </div>
      )}

      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        {rest.map((t, i) => {
          const rank = i + 4;
          return (
            <div
              key={t.id}
              className={`team-row ${flash[t.id] === "up" ? "row-flash-up" : flash[t.id] === "down" ? "row-flash-down" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "10px 14px",
                marginBottom: 8,
              }}
            >
              <div style={{ fontFamily: "Lalezar", fontSize: 18, color: "#7A7296", width: 24, textAlign: "center" }}>{rank}</div>
              <div style={{ width: 8, height: 32, borderRadius: 4, background: t.hue }} />
              <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.name}
              </div>
              <div style={{ fontFamily: "Lalezar", fontSize: 18, color: t.hue, minWidth: 30, textAlign: "center" }}>{t.points}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}