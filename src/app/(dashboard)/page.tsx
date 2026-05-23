"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  FilePlus,
  Send,
  PlusCircle,
  QrCode,
  MapPin,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);

  // Shared state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Admin state
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isPinned: false,
    isAlumniTarget: false,
  });

  // Officer state
  const [tasksUnderReview, setTasksUnderReview] = useState<any[]>([]);
  const [manualPoints, setManualPoints] = useState({
    userId: "",
    points: 10,
    reason: "",
  });

  // Member state
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [qrToken, setQrToken] = useState("");
  const [qrMessage, setQrMessage] = useState({ text: "", type: "" });
  const [myTransactions, setMyTransactions] = useState<any[]>([]);

  // Applicant state
  const [myApp, setMyApp] = useState<any>(null);
  const [onboardingList, setOnboardingList] = useState([
    { id: 1, text: "Sign and submit code of conduct", completed: true },
    { id: 2, text: "Join the official Slack/Discord workspace", completed: false },
    { id: 3, text: "Attend orientation assembly next Friday", completed: false },
    { id: 4, text: "Complete organization profile info", completed: false },
  ]);

  const role = session?.user?.role;
  const userId = session?.user?.id;

  const refreshDashboardData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch common data
      const resAnn = await fetch("/api/announcements");
      const dataAnn = await resAnn.json();
      setAnnouncements(dataAnn);

      const resEv = await fetch("/api/events");
      const dataEv = await resEv.json();
      setEvents(dataEv);

      const resMem = await fetch("/api/members");
      const dataMem = await resMem.json();
      setMembers(dataMem);

      if (role === "ADMIN") {
        const resFin = await fetch("/api/finance/summary");
        const dataFin = await resFin.json();
        setFinanceSummary(dataFin);

        const resApps = await fetch("/api/applications");
        const dataApps = await resApps.json();
        setApplications(dataApps);
      }

      if (role === "OFFICER") {
        // Fetch tasks under review
        const resTasks = await fetch("/api/tasks");
        const dataTasks = await resTasks.json();
        setTasksUnderReview(
          dataTasks.filter((t: any) => t.status === "UNDER_REVIEW")
        );
      }

      if (role === "MEMBER") {
        // Fetch user's assigned tasks
        const resTasks = await fetch("/api/tasks");
        const dataTasks = await resTasks.json();
        setMyTasks(dataTasks.filter((t: any) => t.assigneeId === userId));

        // Fetch point history
        const me = dataMem.find((u: any) => u.id === userId);
        if (me) {
          // Fetch point transactions (we can mock transactions or query member point history if we add an api)
          // For now, fetch all members to compute rank
          const sorted = [...dataMem].sort(
            (a: any, b: any) => b.totalPoints - a.totalPoints
          );
          const myRank = sorted.findIndex((u: any) => u.id === userId) + 1;
          setFinanceSummary({ myRank });
        }
      }

      if (role === "APPLICANT") {
        const resApps = await fetch("/api/applications");
        const dataApps = await resApps.json();
        const app = dataApps.find((a: any) => a.userId === userId);
        setMyApp(app);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      refreshDashboardData();
    }
  }, [authStatus, role, userId]);

  // Handle post announcement (Admin)
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });
      if (res.ok) {
        setNewAnnouncement({
          title: "",
          content: "",
          isPinned: false,
          isAlumniTarget: false,
        });
        refreshDashboardData();
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle review liquidation (Admin)
  const handleReviewLiquidation = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/finance/liquidate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        refreshDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle applicant status update (Admin/Officer)
  const handleReviewApplication = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        refreshDashboardData();
        if (status === "OFFERED") {
          confetti({ particleCount: 100, spread: 80 });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual points award (Officer)
  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPoints.userId || !manualPoints.reason || manualPoints.points <= 0)
      return;
    try {
      const res = await fetch("/api/members/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: manualPoints.userId,
          points: Number(manualPoints.points),
          reason: manualPoints.reason,
        }),
      });
      if (res.ok) {
        setManualPoints({ userId: "", points: 10, reason: "" });
        refreshDashboardData();
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle task approval (Officer)
  const handleApproveTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      if (res.ok) {
        refreshDashboardData();
        confetti({ particleCount: 60, colors: ["#6366f1", "#10b981"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle member check-in simulator (Member)
  const handleCheckInSubmit = async (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!qrToken) return;
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: qrToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrMessage({
          text: "Checked in successfully! +10 points gained.",
          type: "success",
        });
        setQrToken("");
        refreshDashboardData();
        confetti({ particleCount: 150, spread: 80, colors: ["#10b981", "#14b8a6"] });
      } else {
        setQrMessage({
          text: data.error || "Failed check-in.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setQrMessage({ text: "Network error occurred.", type: "error" });
    }
  };

  // Accept applicant offer (Applicant)
  const handleAcceptOffer = async () => {
    if (!myApp) return;
    try {
      const res = await fetch(`/api/applications/${myApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OFFERED" }), // This triggers MEMBER promotion
      });
      if (res.ok) {
        confetti({ particleCount: 150, spread: 100 });
        window.location.reload(); // Reload session role
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOnboarding = (id: number) => {
    setOnboardingList(
      onboardingList.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // --- RENDER ROLES ---

  // 1. ADMIN DASHBOARD
  if (role === "ADMIN") {
    const pendingLiq =
      financeSummary?.liquidations?.filter((l: any) => l.status === "PENDING") ||
      [];
    const pendingApps =
      applications?.filter((a: any) => a.status === "APPLIED") || [];

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-4 border-indigo-500/10">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Remaining Funds</p>
              <h3 className="text-xl font-bold text-white mt-1">
                ${financeSummary?.remainingFunds?.toFixed(2) || "0.00"}
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 border-emerald-500/10">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Liquidations</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {pendingLiq.length} Pending
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 border-sky-500/10">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Applicants</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {pendingApps.length} Screenings
              </h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 border-amber-500/10">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Active Members</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {members.filter((m) => m.isActive).length}/{members.length}
              </h3>
            </div>
          </GlassCard>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action area: Left & Middle columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Announcements Composer */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <FilePlus className="h-5 w-5 text-indigo-400" />
                Publish Global Announcement
              </h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Title</label>
                  <input
                    type="text"
                    required
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter announcement heading"
                    className="glass-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write announcements details..."
                    className="glass-input text-sm resize-none"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.isPinned}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          isPinned: e.target.checked,
                        })
                      }
                      className="rounded border-slate-800 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                    />
                    Pin Announcement
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.isAlumniTarget}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          isAlumniTarget: e.target.checked,
                        })
                      }
                      className="rounded border-slate-800 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                    />
                    Target Alumni Database
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition duration-200"
                >
                  <Send className="h-4 w-4" />
                  Publish Announcement
                </button>
              </form>
            </GlassCard>

            {/* Pending Liquidations Review List */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">
                Liquidation Submissions ({pendingLiq.length})
              </h3>
              {pendingLiq.length === 0 ? (
                <p className="text-sm text-slate-500">No pending liquidations to review.</p>
              ) : (
                <div className="space-y-4">
                  {pendingLiq.map((liq: any) => (
                    <div
                      key={liq.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            ${Number(liq.amount).toFixed(2)}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                            {liq.user.committee?.name || "General"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{liq.description}</p>
                        <p className="text-[10px] text-slate-500">
                          Submitted by {liq.user.name} ({liq.user.email})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={liq.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 mr-2 underline"
                        >
                          View Receipt
                        </a>
                        <button
                          onClick={() =>
                            handleReviewLiquidation(liq.id, "APPROVED")
                          }
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-xs transition duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleReviewLiquidation(liq.id, "REJECTED")
                          }
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-semibold px-3 py-1.5 rounded-lg text-xs transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Applicants & Active Feed */}
          <div className="space-y-8">
            {/* Pending Applicants Review */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">
                Recruitment Pipeline ({pendingApps.length})
              </h3>
              {pendingApps.length === 0 ? (
                <p className="text-sm text-slate-500">No applicants in applied stage.</p>
              ) : (
                <div className="space-y-4">
                  {pendingApps.map((app: any) => (
                    <div
                      key={app.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.user.name}</h4>
                        <p className="text-xs text-slate-400">{app.user.course} - Year {app.user.yearLevel}</p>
                      </div>
                      <div className="p-2.5 bg-black/25 rounded-lg text-xs text-slate-400 font-mono">
                        Pref Comm: {app.formResponse?.preferredCommittee}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleReviewApplication(app.id, "SCREENING")
                          }
                          className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/25 text-indigo-300 font-semibold py-1 rounded text-xs transition duration-200"
                        >
                          Screen
                        </button>
                        <button
                          onClick={() =>
                            handleReviewApplication(app.id, "REJECTED")
                          }
                          className="flex-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-red-400 font-semibold py-1 rounded text-xs transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Pinned Announcements */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Pinned Board</h3>
              <div className="space-y-4">
                {announcements
                  .filter((a: any) => a.isPinned)
                  .map((ann: any) => (
                    <div
                      key={ann.id}
                      className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-2"
                    >
                      <h4 className="text-sm font-bold text-indigo-300">{ann.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3">{ann.content}</p>
                    </div>
                  ))}
                {announcements.filter((a: any) => a.isPinned).length === 0 && (
                  <p className="text-sm text-slate-500">No pinned announcements.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // 2. OFFICER DASHBOARD
  if (role === "OFFICER") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* Left Column: Tasks Under Review & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tasks Under Review */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-400" />
              Tasks Under Review ({tasksUnderReview.length})
            </h3>
            {tasksUnderReview.length === 0 ? (
              <p className="text-sm text-slate-500">
                No committee tasks submitted for review.
              </p>
            ) : (
              <div className="space-y-4">
                {tasksUnderReview.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      <p className="text-xs text-slate-400">Assignee: {task.assignee?.name}</p>
                      {task.deliverable && (
                        <a
                          href={task.deliverable}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:underline"
                        >
                          View Deliverable File
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleApproveTask(task.id)}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-semibold px-4 py-1.5 rounded-lg text-xs transition duration-200"
                    >
                      Approve & Award +15pts
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Upcoming Event Registrations */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Event RSVPs</h3>
            <div className="space-y-4">
              {events
                .filter((e: any) => new Date(e.startTime) > new Date())
                .map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                      <p className="text-xs text-slate-400">{ev.location}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(ev.startTime).toLocaleDateString()} at{" "}
                        {new Date(ev.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-semibold">
                        {ev.registrations.filter((r: any) => r.rsvpStatus).length} RSVP'd
                      </span>
                    </div>
                  </div>
                ))}
              {events.filter((e: any) => new Date(e.startTime) > new Date()).length ===
                0 && <p className="text-sm text-slate-500">No upcoming events scheduled.</p>}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Log points & Quick Info */}
        <div className="space-y-8">
          {/* Manual Points Logger */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-400" />
              Award Member Points
            </h3>
            <form onSubmit={handleAwardPoints} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Select Member</label>
                <select
                  required
                  value={manualPoints.userId}
                  onChange={(e) =>
                    setManualPoints({ ...manualPoints, userId: e.target.value })
                  }
                  className="glass-input text-sm bg-[#11121c] border border-white/10"
                >
                  <option value="" disabled>
                    Choose a member...
                  </option>
                  {members
                    .filter((m) => m.role === "MEMBER")
                    .map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Points Value</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={manualPoints.points}
                  onChange={(e) =>
                    setManualPoints({
                      ...manualPoints,
                      points: Number(e.target.value),
                    })
                  }
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Layout creation for poster"
                  value={manualPoints.reason}
                  onChange={(e) =>
                    setManualPoints({ ...manualPoints, reason: e.target.value })
                  }
                  className="glass-input text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition duration-200"
              >
                Log Points
              </button>
            </form>
          </GlassCard>

          {/* Announcements Pinned Feed */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Official Notices</h3>
            <div className="space-y-4">
              {announcements.slice(0, 3).map((ann: any) => (
                <div
                  key={ann.id}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1"
                >
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">
                    {ann.isPinned && <span className="text-xs text-indigo-400">📌</span>}
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // 3. MEMBER DASHBOARD
  if (role === "MEMBER") {
    // Find GA check-in token for simulation
    const ongoingEvent = events.find(
      (e: any) =>
        new Date(e.startTime) <= new Date() && new Date(e.endTime) >= new Date()
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* Left column: My tasks, Events checklist */}
        <div className="lg:col-span-2 space-y-8">
          {/* Member Tasks checklist */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">My Assigned Tasks</h3>
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-500">You don't have any assigned tasks.</p>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      <p className="text-xs text-slate-400">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                          {task.status}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.status !== "DONE" && task.status !== "UNDER_REVIEW" && (
                      <button
                        onClick={async () => {
                          const deliverable = prompt("Enter deliverable file URL:");
                          if (deliverable) {
                            await fetch(`/api/tasks/${task.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                status: "UNDER_REVIEW",
                                deliverable,
                              }),
                            });
                            refreshDashboardData();
                          }
                        }}
                        className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-400 font-semibold px-3 py-1.5 rounded-lg text-xs transition duration-200"
                      >
                        Submit Work
                      </button>
                    )}
                    {task.status === "UNDER_REVIEW" && (
                      <span className="text-xs text-amber-400 font-semibold">Under Review</span>
                    )}
                    {task.status === "DONE" && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Upcoming events RSVP checker */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Events Workspace</h3>
            <div className="space-y-4">
              {events.slice(0, 3).map((ev: any) => {
                const registered = ev.registrations.find((r: any) => r.userId === userId);
                const isRsvpd = registered?.rsvpStatus;

                return (
                  <div
                    key={ev.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        {ev.location}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`/api/events/${ev.id}/rsvp`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rsvpStatus: !isRsvpd }),
                        });
                        refreshDashboardData();
                      }}
                      className={`
                        font-semibold px-4 py-1.5 rounded-lg text-xs transition duration-200 border
                        ${
                          isRsvpd
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
                        }
                      `}
                    >
                      {isRsvpd ? "RSVP'd ✓" : "RSVP Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right column: leaderboard position, QR scan simulation */}
        <div className="space-y-8">
          {/* Points & leaderboard standings */}
          <GlassCard className="text-center space-y-4">
            <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Leaderboard Rank
            </h4>
            <div className="inline-flex items-baseline justify-center gap-1 text-white">
              <span className="text-4xl font-extrabold text-indigo-400">
                #{financeSummary?.myRank || "-"}
              </span>
              <span className="text-slate-500 text-sm">standing</span>
            </div>
            <p className="text-xs text-slate-400">
              Increase points by check-ins (+10) and task completions (+15).
            </p>
          </GlassCard>

          {/* QR Scan Simulator */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-400 animate-pulse" />
              Event Check-In Console
            </h3>
            {ongoingEvent ? (
              <div className="space-y-4">
                <p className="text-xs text-indigo-300 font-semibold">
                  Event: {ongoingEvent.title} (Scanning Active)
                </p>
                <form
                  onSubmit={(e) => handleCheckInSubmit(e, ongoingEvent.id)}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="Enter scanned QR token hash"
                    className="glass-input text-xs w-full"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition duration-200"
                  >
                    Submit Scan Token
                  </button>
                </form>

                {qrMessage.text && (
                  <div
                    className={`
                    p-3 rounded-lg text-xs font-semibold text-center
                    ${
                      qrMessage.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }
                  `}
                  >
                    {qrMessage.text}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active event check-ins right now. Scan rotating QR console from the Events tab organizer dashboard.
              </p>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  // 4. ALUMNI DASHBOARD
  if (role === "ALUMNI") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* Left Column: Governing Documents & Newsletters */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Advisor Bulletin</h3>
            <div className="space-y-4">
              {announcements
                .filter((a: any) => a.isAlumniTarget)
                .map((ann: any) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2"
                  >
                    <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                    <p className="text-xs text-slate-400">{ann.content}</p>
                    <p className="text-[10px] text-slate-500">
                      Posted on {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              {announcements.filter((a: any) => a.isAlumniTarget).length === 0 && (
                <p className="text-sm text-slate-500">No specific alumni updates posted.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Constitutional Archives</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">CampusNode By-Laws 2026</h4>
                  <p className="text-slate-500 text-[10px]">Governance parameters</p>
                </div>
                <a
                  href="https://example.com/constitution"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Open PDF File
                </a>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">SOP Finance Turnovers</h4>
                  <p className="text-slate-500 text-[10px]">Liquidations guidelines</p>
                </div>
                <a
                  href="https://example.com/sop-finance"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Open PDF File
                </a>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: historical totals */}
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Annual Legacy report
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Registered Members</span>
                <span className="font-bold text-white">{members.length}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Completed Events</span>
                <span className="font-bold text-white">
                  {
                    events.filter((e: any) => new Date(e.endTime) < new Date())
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Committee Workspaces</span>
                <span className="font-bold text-white">5 Committees</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // 5. APPLICANT DASHBOARD
  if (role === "APPLICANT") {
    const pipelineStages = [
      { key: "APPLIED", name: "Submitted", desc: "Application form logged." },
      { key: "SCREENING", name: "Screening", desc: "Executive board review." },
      {
        key: "INTERVIEW_SCHEDULED",
        name: "Interview",
        desc: "Schedule details via email.",
      },
      { key: "OFFERED", name: "Offered", desc: "Admission offer details." },
    ];

    const currentStageIndex = pipelineStages.findIndex(
      (s) => s.key === myApp?.status
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* Left Column: Form & Checklist */}
        <div className="lg:col-span-2 space-y-8">
          {/* Application Status Tracker */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-6">
              Recruitment Process Status
            </h3>
            {myApp ? (
              <div className="relative">
                {/* Status Nodes */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {pipelineStages.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={stage.key} className="space-y-2">
                        <div
                          className={`
                          mx-auto h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border
                          ${
                            isCompleted
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                              : "bg-[#11121c] border-white/10 text-slate-500"
                          }
                          ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#090a0f]" : ""}
                        `}
                        >
                          {idx + 1}
                        </div>
                        <h4 className="text-xs font-semibold text-white">
                          {stage.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 hidden md:block">
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Offer Action Banner */}
                {myApp.status === "OFFERED" && (
                  <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Congratulations! You've been offered membership.
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Accept the offer to instantly transition to an Active Member workspace.
                      </p>
                    </div>
                    <button
                      onClick={handleAcceptOffer}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition duration-200"
                    >
                      Accept Membership Offer
                    </button>
                  </div>
                )}

                {/* Rejection Banner */}
                {myApp.status === "REJECTED" && (
                  <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h4 className="text-sm font-bold text-red-400">Application Closed</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Thank you for your interest in joining. The recruitment team has closed your review for this term.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  You haven't submitted your membership application. Please fill out details below:
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as any;
                    const pref = target.pref.value;
                    const stmt = target.stmt.value;
                    const res = await fetch("/api/applications", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        formResponse: {
                          preferredCommittee: pref,
                          statementOfPurpose: stmt,
                        },
                      }),
                    });
                    if (res.ok) {
                      refreshDashboardData();
                      confetti({ particleCount: 50 });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">
                      Committee Preference
                    </label>
                    <select name="pref" required className="glass-input text-xs bg-[#11121c]">
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">
                      Why do you want to join? (Statement of Purpose)
                    </label>
                    <textarea
                      name="stmt"
                      required
                      rows={4}
                      placeholder="Share your goals and qualifications..."
                      className="glass-input text-xs resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition duration-200"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </GlassCard>

          {/* Onboarding Tasks (Enabled if offered) */}
          {myApp?.status === "OFFERED" && (
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Onboarding Checklist</h3>
              <div className="space-y-3">
                {onboardingList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleOnboarding(item.id)}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      readOnly
                      className="rounded border-slate-800 bg-white/5 text-indigo-600"
                    />
                    <span
                      className={`text-xs ${
                        item.completed ? "line-through text-slate-500" : "text-slate-300"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Admission Tips */}
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Recruitment Guidelines
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed space-y-2">
              Please monitor your university inbox regularly. Once screening finishes, candidates will be invited for a brief 10-minute online synchronised interview.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return null;
}
