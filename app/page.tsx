"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";


const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});

const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
import { Legend } from "recharts";

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});

// Use env vars for Supabase keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

type Participant = {
  id: string;
  team_id: string;
  team_name: string;
  candidate_name: string;
  candidate_role: string;
  candidate_email: string;
  participant_id: string;
};

type Activity = {
  id: string;
  participant_id: string;
  activity_name: string;
  description?: string;
  name?: string;
  email?: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [showTeamsExpanded, setShowTeamsExpanded] = useState<
    Record<string, boolean>
  >({});

  const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

  // Fetch initial data from your nextjs backend endpoints
  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await fetch("/api/participants");
      const pJson = await pRes.json();
      const participantsData: Participant[] = pJson.participants || [];

      const aRes = await fetch("/api/participants-activity");
      const aJson = await aRes.json();
      const activitiesData: Activity[] = aJson.activities || [];

      setParticipants(participantsData);
      setActivities(
        activitiesData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (e) {
      console.error("fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // real-time subscription via Supabase
    if (!supabase) return;

    const channel = supabase
      .channel("public:participant_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participant_activity" },
        (payload) => {
          const newRecord = payload.new as Activity;
          setActivities((prev) => [newRecord, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "participant_activity" },
        (payload) => {
          const updated = payload.new as Activity;
          setActivities((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "participant_activity" },
        (payload) => {
          const removed = payload.old as Activity;
          setActivities((prev) => prev.filter((a) => a.id !== removed.id));
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  // Derived metrics
  const totalParticipants = participants.length;
  const uniqueTeams = new Set(participants.map((p) => p.team_id)).size;

  // Activity counts per participant
  const activitiesByParticipant = useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach((a) => {
      const arr = map.get(a.participant_id) || [];
      arr.push(a);
      map.set(a.participant_id, arr);
    });
    return map;
  }, [activities]);

  // Last activity for participant
  const lastActivityByParticipant = useMemo(() => {
    const map = new Map<string, Activity | null>();
    participants.forEach((p) => {
      const arr = activitiesByParticipant.get(p.participant_id) || [];
      map.set(p.participant_id, arr.length ? arr[0] : null);
    });
    return map;
  }, [participants, activitiesByParticipant]);

  // Counts for check-in / check-out style tracking
  const checkInCount = activities.filter(
    (a) =>
      a.activity_name.toLowerCase().includes("check-in") ||
      a.activity_name.toLowerCase().includes("checkin")
  ).length;
  const checkOutCount = activities.filter(
    (a) =>
      a.activity_name.toLowerCase().includes("check-out") ||
      a.activity_name.toLowerCase().includes("checkout")
  ).length;

  // Top active participants
  const participantActivityCounts = useMemo(() => {
    const counts: { name: string; id: string; count: number }[] = [];
    participants.forEach((p) => {
      const count = activitiesByParticipant.get(p.participant_id)?.length || 0;
      counts.push({ name: p.candidate_name, id: p.participant_id, count });
    });
    counts.sort((a, b) => b.count - a.count);
    return counts.slice(0, 10);
  }, [participants, activitiesByParticipant]);

  // Activity type counts
  const activityTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) =>
      map.set(a.activity_name, (map.get(a.activity_name) || 0) + 1)
    );
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [activities]);

  // Activity over time (group by day)
  const activityOverTime = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) => {
      const day = new Date(a.created_at).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [activities]);

  // Filtering & searching
  const filteredParticipants = participants.filter((p) => {
    const q = search.toLowerCase();
    if (q) {
      const match =
        p.candidate_name.toLowerCase().includes(q) ||
        p.participant_id.toLowerCase().includes(q) ||
        p.candidate_email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (teamFilter && p.team_id !== teamFilter) return false;
    return true;
  });

  const teams = useMemo(() => {
    const map = new Map<string, Participant[]>();
    participants.forEach((p) => {
      const arr = map.get(p.team_id) || [];
      arr.push(p);
      map.set(p.team_id, arr);
    });
    return Array.from(map.entries()).map(([team_id, members]) => ({
      team_id,
      team_name: members[0]?.team_name || "",
      members,
    }));
  }, [participants]);

  // helper: format time
  const fmt = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  if(loading){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Event Admin Dashboard
            </h1>
            <p className="text-sm opacity-80 mt-1">
              Live participant & activity overview
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name / id / email"
              className="px-3 py-2 rounded-md border bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1f2937] shadow-sm"
            />
            <button
              onClick={fetchAll}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Stats + charts */}
        <section className="col-span-1 lg:col-span-2 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Participants" value={totalParticipants} />
            <StatCard title="Unique Teams" value={uniqueTeams} />
            <StatCard title="Check-ins" value={checkInCount} />
            <StatCard title="Check-outs" value={checkOutCount} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2 bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
              <h3 className="font-medium mb-2">Activity Over Time</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityOverTime}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366F1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
              <h3 className="font-medium mb-2">Top Activities</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityTypeCounts}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
            <h3 className="font-medium mb-2">Live Activity Feed</h3>
            {loading ? (
              <p className="text-sm opacity-70">Loading...</p>
            ) : (
              <div className="max-h-64 overflow-auto divide-y">
                {activities
                  .filter(
                    (a) => !activityFilter || a.activity_name === activityFilter
                  )
                  .slice(0, 200)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="p-3 flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">
                          {a.name || a.participant_id}{" "}
                          <span className="text-xs opacity-70">
                            ({a.participant_id})
                          </span>
                        </div>
                        <div className="text-sm opacity-80">
                          {a.activity_name} — {a.description || ""}
                        </div>
                        <div className="text-xs opacity-60">
                          {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="text-xs opacity-60">
                        {new Date(a.created_at).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Participant Table */}
          <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm h-64 overflow-scroll">
            <h3 className="font-medium mb-2">Participants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-sm text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2 px-3">Participant ID</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Team</th>
                    <th className="py-2 px-3">Last Activity</th>
                    <th className="py-2 px-3">Last Seen</th>
                    <th className="py-2 px-3">Activity Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p) => {
                    const last = lastActivityByParticipant.get(
                      p.participant_id
                    );
                    const count =
                      activitiesByParticipant.get(p.participant_id)?.length ||
                      0;
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 px-3">{p.participant_id}</td>
                        <td className="py-2 px-3">{p.candidate_name}</td>
                        <td className="py-2 px-3">{p.candidate_role}</td>
                        <td className="py-2 px-3">
                          {p.team_name || p.team_id}
                        </td>
                        <td className="py-2 px-3">
                          {last?.activity_name || "—"}
                        </td>
                        <td className="py-2 px-3">
                          {last ? fmt(last.created_at) : "—"}
                        </td>
                        <td className="py-2 px-3">{count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right column: Teams & Top participants */}
        <aside className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
            <h3 className="font-medium mb-2">Top Active Participants</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {participantActivityCounts.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="opacity-80">{p.count}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
            <h3 className="font-medium mb-2">Teams</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {teams.map((t) => (
                <div
                  key={t.team_id}
                  className="border rounded-md overflow-hidden"
                >
                  <button
                    className="w-full text-left px-3 py-2 flex justify-between items-center bg-slate-50 dark:bg-[#0b1118]"
                    onClick={() =>
                      setShowTeamsExpanded((s) => ({
                        ...s,
                        [t.team_id]: !s[t.team_id],
                      }))
                    }
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {t.team_name || t.team_id}
                      </div>
                      <div className="text-xs opacity-70">
                        {t.members.length} members
                      </div>
                    </div>
                    <div className="text-xs opacity-70">
                      {showTeamsExpanded[t.team_id] ? "−" : "+"}
                    </div>
                  </button>
                  {showTeamsExpanded[t.team_id] && (
                    <div className="p-3">
                      {t.members.map((m) => {
                        const last = lastActivityByParticipant.get(
                          m.participant_id
                        );
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between py-2 border-b last:border-b-0"
                          >
                            <div>
                              <div className="text-sm">{m.candidate_name}</div>
                              <div className="text-xs opacity-70">
                                {m.participant_id} • {m.candidate_role}
                              </div>
                            </div>
                            <div className="text-xs opacity-70">
                              {last
                                ? `${last.activity_name} • ${new Date(
                                    last.created_at
                                  ).toLocaleTimeString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                  })}`
                                : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-sm">
  <h3 className="font-medium mb-2">Activity Types</h3>
  <div style={{ height: 220 }}>
   
    <ResponsiveContainer width="100%" height="100%">
      
      <PieChart>
        <Pie
          data={activityTypeCounts}
          dataKey="value"
          nameKey="name"
          outerRadius={70}
          label
        >
          {activityTypeCounts.map((entry, index) => (

            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

        </aside>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl shadow-sm flex flex-col">
      <span className="text-xs opacity-70">{title}</span>
      <span className="text-2xl font-semibold mt-2">{value}</span>
    </div>
  );
}
