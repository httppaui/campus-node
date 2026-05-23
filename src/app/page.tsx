"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, Users, Layers, Award, FileText, CalendarCheck, Zap } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleDevLogin = async (email: string, role: string) => {
    setLoadingRole(role);
    try {
      await signIn("credentials", {
        email,
        role,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      console.error(err);
      setLoadingRole(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090a0f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="font-medium text-slate-400">Loading CampusNode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Background Radial Glows */}
      <div className="radial-bg"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white text-xl shadow-glow-primary">
            C
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Campus<span className="text-indigo-400">Node</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-mono">
            v1.0.0-MVP
          </span>
        </div>
      </header>

      {/* Main Hero & Login */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-indigo-300 text-sm font-medium">
            <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
            University Org Unified Workspace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Elevate Your Student <br className="hidden sm:inline" />
            Organization <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-300">Operations</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            CampusNode replaces scattered spreadsheets, message threads, and documents with a single high-performance workspace. Track attendance dynamically, manage tasks, control budgets, and grow your institutional memory.
          </p>

          {/* Core Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Role-Based Access</h3>
                <p className="text-sm text-slate-400">Tailored UI dashboards for Admin, Officers, and Members.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Kanban Task Board</h3>
                <p className="text-sm text-slate-400">Track tasks per committee with files and deadlines.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Rotating QR Check-in</h3>
                <p className="text-sm text-slate-400">Anti-exploit 15-second rotating HMAC secure verify.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gamified Rankings</h3>
                <p className="text-sm text-slate-400">Automated leaderboard, point logs, and badges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Login card */}
        <div className="lg:col-span-5 flex justify-center">
          <GlassCard className="w-full max-w-md border-indigo-500/10 shadow-glow-primary/5">
            <h2 className="text-2xl font-display font-bold text-white text-center mb-2">
              Access CampusNode
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              Sign in with your university account to access your workspace.
            </p>

            {/* Google Authentication Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-md transition-transform active:scale-95 duration-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.3-3.69 3.69l3.11 2.42c1.82-1.68 2.94-4.15 2.94-7.96z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.11-2.42c-.9.6-2.01.97-3.24.97-3.13 0-5.78-2.11-6.73-4.96L3.71 17.1c1.97 3.92 6.01 6.63 10.68 6.63z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.68A7.17 7.17 0 0 1 4.8 12c0-.94.16-1.86.47-2.68L2.1 6.84A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.37l4.02-3.12l-.01.43z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0C7.32 0 3.28 2.71 1.31 6.63l4.02 3.12c.95-2.85 3.6-4.96 6.67-4.96z"
                />
              </svg>
              Sign in with Google (.edu)
            </button>

            {/* Development Mock Backdoor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f1016] px-3 py-1 rounded text-slate-500 font-mono">
                  Reviewer Persona Switcher
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-indigo-400 font-semibold text-center uppercase tracking-wider mb-2">
                Click to instantly log in as any role
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!!loadingRole}
                  onClick={() => handleDevLogin("admin@g.edu", "ADMIN")}
                  className="glass-panel text-left p-3 rounded-xl hover:border-indigo-500/40 hover:bg-white/5 transition flex flex-col items-start text-xs disabled:opacity-50"
                >
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Admin
                    {loadingRole === "ADMIN" && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </span>
                  <span className="text-slate-400 mt-1">Alex Admin (Exec)</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">admin@g.edu</span>
                </button>

                <button
                  disabled={!!loadingRole}
                  onClick={() => handleDevLogin("officer@g.edu", "OFFICER")}
                  className="glass-panel text-left p-3 rounded-xl hover:border-indigo-500/40 hover:bg-white/5 transition flex flex-col items-start text-xs disabled:opacity-50"
                >
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Officer
                    {loadingRole === "OFFICER" && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </span>
                  <span className="text-slate-400 mt-1">Olly Officer (PR)</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">officer@g.edu</span>
                </button>

                <button
                  disabled={!!loadingRole}
                  onClick={() => handleDevLogin("member@g.edu", "MEMBER")}
                  className="glass-panel text-left p-3 rounded-xl hover:border-indigo-500/40 hover:bg-white/5 transition flex flex-col items-start text-xs disabled:opacity-50"
                >
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Member
                    {loadingRole === "MEMBER" && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </span>
                  <span className="text-slate-400 mt-1">Max Member (Mktg)</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">member@g.edu</span>
                </button>

                <button
                  disabled={!!loadingRole}
                  onClick={() => handleDevLogin("alumni@g.edu", "ALUMNI")}
                  className="glass-panel text-left p-3 rounded-xl hover:border-indigo-500/40 hover:bg-white/5 transition flex flex-col items-start text-xs disabled:opacity-50"
                >
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Alumni
                    {loadingRole === "ALUMNI" && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </span>
                  <span className="text-slate-400 mt-1">Alice Alumni (Advis)</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">alumni@g.edu</span>
                </button>
              </div>

              <button
                disabled={!!loadingRole}
                onClick={() => handleDevLogin("applicant@g.edu", "APPLICANT")}
                className="w-full glass-panel text-left p-3 rounded-xl hover:border-indigo-500/40 hover:bg-white/5 transition flex items-center justify-between text-xs disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Applicant Pipeline
                    {loadingRole === "APPLICANT" && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </span>
                  <span className="text-slate-400 mt-0.5">Andy Applicant (Recruit)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">applicant@g.edu</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-black/20 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CampusNode Project. Designed with Premium Executive Aesthetics.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-indigo-400 transition">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
