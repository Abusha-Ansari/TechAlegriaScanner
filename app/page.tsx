"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 1. DYNAMIC IMPORTS & SETUP
// Grouped for cleanliness. `dynamic` is used to code-split recharts for faster page loads.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
// const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
// const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
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
// const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
//   ssr: false,
// });

// Supabase Setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Chart Colors
const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 2. TYPE DEFINITIONS
// Centralized types for data models.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
  name?: string; // Participant name, might be joined
  email?: string; // Participant email, might be joined
  created_at: string;
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 3. HELPER & UI COMPONENTS
// Breaking the UI into smaller components makes the main component cleaner
// and improves reusability.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// A simple card for displaying key stats.
const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col">
    <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    <span className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
      {value}
    </span>
  </div>
);

// A container for charts to standardize styling.
const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <div className="h-60">{children}</div>
  </div>
);

// The header component containing title, search, and refresh controls.
const DashboardHeader = ({
  search,
  onSearchChange,
  onRefresh,
}: {
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
}) => (
  <header className="mb-8">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Event Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Live participant and activity overview
        </p>
      </div>
      <div className="flex gap-2 items-center w-full md:w-auto">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, id, or email..."
          className="w-full md:w-64 px-3 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  </header>
);

// The table for displaying filtered activities.
type ActivityFilterTableProps = {
  activities: Activity[];
  activityTypes: string[];
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  formatTime: (iso?: string) => string;
};

const ActivityFilterTable: React.FC<ActivityFilterTableProps> = ({
  activities,
  activityTypes,
  selectedType,
  onTypeChange,
  formatTime,
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Real-Time Activity Log
      </h3>
      <div className="flex items-center gap-2">
        <select
          value={selectedType || ""}
          onChange={(e) => onTypeChange(e.target.value || null)}
          className="px-2 py-1.5 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Activities</option>
          {activityTypes.map((type: string) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing: {activities.length}
        </span>
      </div>
    </div>
    <div className="overflow-x-auto max-h-[500px]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Participant ID
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Name
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Activity
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.slice(0, 100).map((a: Activity) => (
            <tr key={a.id}>
              <td className="py-2 px-3 font-mono text-xs">
                {a.participant_id}
              </td>
              <td className="py-2 px-3">{a.name || "—"}</td>
              <td className="py-2 px-3">{a.activity_name}</td>
              <td className="py-2 px-3 whitespace-nowrap">
                {formatTime(a.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 4. MAIN DASHBOARD COMPONENT
// This is the primary component that holds state and orchestrates the UI.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default function AdminDashboard() {
  // ~~~ STATE MANAGEMENT ~~~
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // const [showTeamsExpanded, setShowTeamsExpanded] = useState<Record<string, boolean>>({});
  const [selectedActivityType, setSelectedActivityType] = useState<
    string | null
  >(null);

  // ~~~ DATA FETCHING & REAL-TIME SUBSCRIPTIONS ~~~
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch("/api/participants"),
        fetch("/api/participants-activity"),
      ]);
      const pJson = await pRes.json();
      const aJson = await aRes.json();

      setParticipants(pJson.participants || []);
      setActivities(
        (aJson.activities || []).sort(
          (a: Activity, b: Activity) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    if (!supabase) return;

    const channel = supabase
      .channel("public:participant_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participant_activity" },
        (payload) => setActivities((prev) => [payload.new as Activity, ...prev])
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "participant_activity" },
        (payload) =>
          setActivities((prev) =>
            prev.map((a) =>
              a.id === payload.new.id ? (payload.new as Activity) : a
            )
          )
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "participant_activity" },
        (payload) =>
          setActivities((prev) => prev.filter((a) => a.id !== payload.old.id))
      )
      .subscribe();

    return () => {
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  // ~~~ MEMOIZED DATA DERIVATIONS ~~~
  // Using `useMemo` prevents expensive recalculations on every render.

  // const activitiesByParticipant = useMemo(() => {
  //   return activities.reduce((acc, activity) => {
  //       const participantActivities = acc.get(activity.participant_id) || [];
  //       participantActivities.push(activity);
  //       acc.set(activity.participant_id, participantActivities);
  //       return acc;
  //   }, new Map<string, Activity[]>());
  // }, [activities]);

  const activityTypeCounts = useMemo(() => {
    const counts = activities.reduce((acc, a) => {
      acc.set(a.activity_name, (acc.get(a.activity_name) || 0) + 1);
      return acc;
    }, new Map<string, number>());
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [activities]);

  const activityOverTime = useMemo(() => {
    const counts = activities.reduce((acc, a) => {
      const day = new Date(a.created_at).toISOString().slice(0, 10);
      acc.set(day, (acc.get(day) || 0) + 1);
      return acc;
    }, new Map<string, number>());
    return Array.from(counts.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [activities]);

  // const checkInCount = useMemo(() => activities.filter(a => a.activity_name.toLowerCase().includes('checkin') || a.activity_name.toLowerCase().includes('check-in')).length, [activities]);
  // const checkOutCount = useMemo(() => activities.filter(a => a.activity_name.toLowerCase().includes('checkout') || a.activity_name.toLowerCase().includes('check-out')).length, [activities]);
  // const breakfastCount = useMemo(() => activities.filter(a => a.activity_name.toLowerCase().includes('breakfast')).length, [activities]);
  // const lunchCount = useMemo(() => activities.filter(a => a.activity_name.toLowerCase().includes('lunch')).length, [activities]);
  // const dinnerCount = useMemo(() => activities.filter(a => a.activity_name.toLowerCase().includes('dinner')).length, [activities]);
  const allActivityCounts = useMemo(() => {
    // Use .reduce() to transform the activities array into an object of counts.
    // e.g., { 'Check-in': 50, 'Lunch': 45, ... }
    const counts = activities.reduce((acc, activity) => {
      const name = activity.activity_name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert the object into an array for easy mapping in JSX.
    // e.g., [ { name: 'Check-in', value: 50 }, { name: 'Lunch', value: 45 }, ... ]
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const filteredActivityData = useMemo(() => {
    return activities.filter(
      (a) => !selectedActivityType || a.activity_name === selectedActivityType
    );
  }, [activities, selectedActivityType]);

  const activityTypesList = useMemo(
    () => Array.from(new Set(activities.map((a) => a.activity_name))),
    [activities]
  );

  // ~~~ HELPER FUNCTIONS ~~~
  const formatDateTime = (iso?: string) => {
    if (!iso) return "–";
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  // ~~~ RENDER LOGIC ~~~
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <DashboardHeader
          search={search}
          onSearchChange={setSearch}
          onRefresh={fetchAllData}
        />

        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <section className="xl:col-span-2 flex flex-col gap-6">
            {/* Stat Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Participants" value={participants.length} />
              <StatCard title="Unique Teams" value={new Set(participants.map(p => p.team_id)).size} />
              <StatCard title="Total Check-ins" value={checkInCount} />
              <StatCard title="Total Check-outs" value={checkOutCount} />
              <StatCard title="Total Activities" value={activities.length} />
              <StatCard title="Total Breakfasts" value={breakfastCount} />
              <StatCard title="Total Lunches" value={lunchCount} />
              <StatCard title="Total Dinners" value={dinnerCount} />
            </div> */}
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Static cards that are calculated differently */}
              <StatCard
                title="Total Participants"
                value={participants.length}
              />
              <StatCard
                title="Unique Teams"
                value={new Set(participants.map((p) => p.team_id)).size}
              />

              {/* Dynamically generate a stat card for every unique activity found in the data */}
              {allActivityCounts.map(({ name, value }) => (
                <StatCard
                  key={name}
                  title={name}
                  value={`${value} / ${participants.length}`}
                />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ChartCard title="Activity Over Time">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityOverTime}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="day"
                        stroke="currentColor"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="currentColor"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "black",
                          border: "none",
                          color: "white",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="lg:col-span-2">
                <ChartCard title="Activity Types">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeCounts}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {activityTypeCounts.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      {/* <Legend iconSize={10} /> */}
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>

            {/* Real-time Activity Table */}
            <ActivityFilterTable
              activities={filteredActivityData}
              activityTypes={activityTypesList}
              selectedType={selectedActivityType}
              onTypeChange={setSelectedActivityType}
              formatTime={formatDateTime}
            />
          </section>

          {/* Sidebar Column */}
          <aside className="col-span-1 flex flex-col gap-6">
            {/* Top Active Participants */}
            {/* Implement Sidebar Components here if needed */}
          </aside>
        </main>
      </div>
    </div>
  );
}
