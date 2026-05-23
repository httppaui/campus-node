"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Award,
  CheckSquare,
  Calendar,
  FolderOpen,
  DollarSign,
  LogOut,
  Menu,
  X,
  Bell,
  Zap,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [points, setPoints] = useState(0);

  // Redirect to home if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Dynamically fetch points from database/API to keep it sync'd
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/members`)
        .then((res) => res.json())
        .then((data) => {
          const me = data.find((u: any) => u.id === session.user.id);
          if (me) setPoints(me.totalPoints);
        })
        .catch(console.error);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090a0f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="font-medium text-slate-400">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user.role;
  const isApplicant = role === "APPLICANT";

  // Build navigation items based on role
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI", "APPLICANT"],
    },
    {
      name: "Directory",
      href: "/members",
      icon: Users,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"],
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Award,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"],
    },
    {
      name: "Task Board",
      href: "/tasks",
      icon: CheckSquare,
      roles: ["ADMIN", "OFFICER", "MEMBER"],
    },
    {
      name: "Events Hub",
      href: "/events",
      icon: Calendar,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"],
    },
    {
      name: "Documents Hub",
      href: "/documents",
      icon: FolderOpen,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"],
    },
    {
      name: "Finance Center",
      href: "/finance",
      icon: DollarSign,
      roles: ["ADMIN", "OFFICER", "MEMBER", "ALUMNI"],
    },
  ];

  const allowedNavs = navItems.filter((item) => item.roles.includes(role));

  const roleLabels: Record<string, string> = {
    ADMIN: "Exec Board",
    OFFICER: "Officer",
    MEMBER: "Active Member",
    ALUMNI: "Alumni Advisor",
    APPLICANT: "Applicant",
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090a0f] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="radial-bg"></div>

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-x-0 border-t-0 z-20 w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white shadow-glow-primary">
            C
          </div>
          <span className="font-display font-bold text-lg text-white">
            Campus<span className="text-indigo-400">Node</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white hover:text-indigo-400 transition"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } 
        md:translate-x-0 md:relative md:flex flex-col w-64 glass-panel border-y-0 border-l-0 
        transition-transform duration-300 ease-in-out z-30 h-full justify-between shrink-0
      `}
      >
        {/* Upper Sidebar */}
        <div className="flex flex-col flex-1 py-8 px-6 overflow-y-auto">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white text-lg shadow-glow-primary">
              C
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Campus<span className="text-indigo-400">Node</span>
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-6 relative">
            <p className="text-xs text-slate-500 font-medium">Logged in as</p>
            <h4 className="text-sm font-bold text-white truncate mt-1">
              {session.user.name || session.user.email}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded-full font-semibold">
                {roleLabels[role] || role}
              </span>
              {!isApplicant && role !== "ALUMNI" && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                  <Zap className="h-2.5 w-2.5 fill-current" />
                  {points} pts
                </span>
              )}
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {allowedNavs.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-glow-primary/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Panel (desktop only) */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-black/10 backdrop-blur-sm z-10 shrink-0">
          <div>
            <h1 className="text-xl font-display font-bold text-white capitalize">
              {pathname.substring(1) || "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500">
              Welcome back to your organization workspace.
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <button className="relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-background"></span>
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Page Router Children */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
