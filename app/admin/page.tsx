"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, Trash2, LogOut, Lock, Loader2, Pencil } from "lucide-react";
import { Team, getTeams, addTeam, renameTeam, adjustPoints, deleteTeam } from '../api/leaderBor';
import { loginAdmin, logoutAdmin, isAdminLoggedIn } from '../api/admin'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;600;700;900&display=swap');`;

const btnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#F4F1F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginAdmin(password)) {
            onSuccess();
        } else {
            setError(true);
        }
    };

    return (
        <div dir="rtl" className="h-svh" style={{ fontFamily: "Vazirmatn, sans-serif", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% -10%, #241F3D 0%, #12101C 55%, #0A0912 100%)", padding: 20 }}>
            <style>{FONT_IMPORT}</style>
            <form onSubmit={submit} style={{ width: 280, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Lock size={20} color="#B9A7FF" />
                </div>
                <h2 style={{ fontFamily: "Lalezar", fontSize: 24, color: "#F4F1F9", margin: "0 0 4px" }}>ورود ادمین</h2>
                <p style={{ color: "#9C93BB", fontSize: 12, margin: "0 0 16px" }}>رمز پنل مدیریت کلاس رو وارد کن</p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder="رمز عبور"
                    autoFocus
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${error ? "#FB7185" : "rgba(255,255,255,0.15)"}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        color: "#F4F1F9",
                        fontFamily: "Vazirmatn",
                        fontSize: 14,
                        outline: "none",
                        marginBottom: 10,
                    }}
                />
                {error && <p style={{ color: "#FB7185", fontSize: 12, margin: "0 0 10px" }}>رمز اشتباه است</p>}
                <button
                    type="submit"
                    style={{ width: "100%", background: "linear-gradient(90deg,#7C5CFC,#22D3EE)", border: "none", borderRadius: 10, padding: "10px 0", color: "#0A0912", fontFamily: "Vazirmatn", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                    ورود
                </button>
            </form>
        </div>
    );
}

export default function AdminPanel() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checked, setChecked] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        setLoggedIn(isAdminLoggedIn());
        setChecked(true);
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getTeams();
            setTeams(data);
            setError(null);
        } catch {
            setError("اتصال به سرور برقرار نشد");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedIn) load();
    }, [loggedIn]);

    const withBusy = async (id: string, fn: () => Promise<void>) => {
        setBusyIds((s) => new Set(s).add(id));
        try {
            await fn();
        } catch {
            setError("عملیات ناموفق بود، دوباره امتحان کن");
        } finally {
            setBusyIds((s) => {
                const next = new Set(s);
                next.delete(id);
                return next;
            });
        }
    };

    const handleAdjust = (team: Team, delta: number) =>
        withBusy(team.id, async () => {
            const updated = await adjustPoints(team, delta);
            setTeams((ts) => ts.map((t) => (t.id === team.id ? updated : t)));
        });

    const handleRename = (id: string, name: string) =>
        withBusy(id, async () => {
            const updated = await renameTeam(id, name);
            setTeams((ts) => ts.map((t) => (t.id === id ? updated : t)));
        });

    const handleDelete = (id: string) =>
        withBusy(id, async () => {
            await deleteTeam(id);
            setTeams((ts) => ts.filter((t) => t.id !== id));
        });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || adding) return;
        setAdding(true);
        try {
            const created = await addTeam(newName);
            setTeams((ts) => [...ts, created]);
            setNewName("");
            setError(null);
        } catch {
            setError("افزودن گروه ناموفق بود");
        } finally {
            setAdding(false);
        }
    };

    if (!checked) return null;

    if (!loggedIn) {
        return <LoginScreen onSuccess={() => setLoggedIn(true)} />;
    }

    const sorted = [...teams].sort((a, b) => b.points - a.points);

    return (
        <div dir="rtl" className="h-svh" style={{ fontFamily: "Vazirmatn, sans-serif", minHeight: "100%", background: "radial-gradient(circle at 50% -10%, #241F3D 0%, #12101C 55%, #0A0912 100%)", padding: "24px 16px 40px", color: "#F4F1F9" }}>
            <style>{FONT_IMPORT}</style>

            <div style={{ maxWidth: 460, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h1 style={{ fontFamily: "Lalezar", fontSize: 26, margin: 0, color: "#F4F1F9" }}>پنل مدیریت گروه‌ها</h1>
                <button
                    onClick={() => { logoutAdmin(); setLoggedIn(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.35)", color: "#FCA5AF", borderRadius: 999, padding: "6px 12px", fontFamily: "Vazirmatn", fontSize: 12, cursor: "pointer" }}
                >
                    <LogOut size={13} /> خروج
                </button>
            </div>

            {error && (
                <p style={{ maxWidth: 460, margin: "0 auto 12px", color: "#FB7185", fontSize: 13, textAlign: "center" }}>{error}</p>
            )}

            {loading ? (
                <p style={{ textAlign: "center", color: "#9C93BB", fontSize: 13 }}>در حال بارگذاری...</p>
            ) : (
                <div style={{ maxWidth: 460, margin: "0 auto" }}>
                    {sorted.map((t, i) => {
                        const isEditing = editingId === t.id;
                        const isBusy = busyIds.has(t.id);
                        return (
                            <div
                                key={t.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 14,
                                    padding: "10px 14px",
                                    marginBottom: 8,
                                    opacity: isBusy ? 0.6 : 1,
                                }}
                            >
                                <div style={{ fontFamily: "Lalezar", fontSize: 16, color: "#7A7296", width: 20, textAlign: "center" }}>{i + 1}</div>
                                <div style={{ width: 8, height: 30, borderRadius: 4, background: t.hue }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            defaultValue={t.name}
                                            onBlur={(e) => { handleRename(t.id, e.target.value || t.name); setEditingId(null); }}
                                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                            style={{ background: "transparent", border: "none", borderBottom: "1px solid #7C5CFC", color: "#F4F1F9", fontFamily: "Vazirmatn", fontSize: 14, fontWeight: 700, outline: "none", width: "100%" }}
                                        />
                                    ) : (
                                        <div onClick={() => setEditingId(t.id)} style={{ fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {t.name} <Pencil size={11} style={{ opacity: 0.4 }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontFamily: "Lalezar", fontSize: 16, color: t.hue, minWidth: 26, textAlign: "center" }}>{t.points}</div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {isBusy ? (
                                        <div style={btnStyle}><Loader2 size={14} className="spin" /></div>
                                    ) : (
                                        <>
                                            <button onClick={() => handleAdjust(t, -1)} style={btnStyle}><Minus size={14} /></button>
                                            <button onClick={() => handleAdjust(t, 1)} style={btnStyle}><Plus size={14} /></button>
                                            <button onClick={() => handleDelete(t.id)} style={{ ...btnStyle, color: "#FB7185" }}><Trash2 size={14} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="اسم گروه جدید..."
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "9px 12px", color: "#F4F1F9", fontFamily: "Vazirmatn", fontSize: 13, outline: "none" }}
                        />
                        <button
                            type="submit"
                            disabled={adding || !newName.trim()}
                            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(124,92,252,0.18)", border: "1px solid #7C5CFC", color: "#C9BEFF", borderRadius: 10, padding: "0 16px", fontFamily: "Vazirmatn", fontWeight: 600, fontSize: 13, cursor: adding ? "default" : "pointer", opacity: adding || !newName.trim() ? 0.6 : 1 }}
                        >
                            {adding ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} افزودن
                        </button>
                    </form>
                </div>
            )}

            <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}