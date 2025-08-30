"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Participant, Activity } from "../types";
import { DashboardHeader } from "./DashboardHeader";
import { StatisticsCards } from "./StatisticsCards";
import { ChartCard } from "../ui/ChartCard";
import { ActivityOverTimeChart } from "../charts/ActivityOverTimeChart";
import { ActivityTypesChart } from "../charts/ActivityTypesChart";
import { ActivityFilterTable } from "./ActivityFilterTable";

// Supabase Setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default function AdminDashboard() {
  // ~~~ STATE MANAGEMENT ~~~
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const allActivityCounts = useMemo(() => {
    const counts = activities.reduce((acc, activity) => {
      const name = activity.activity_name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
            {/* Statistics Cards */}
            <StatisticsCards
              participants={participants}
              allActivityCounts={allActivityCounts}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ChartCard title="Activity Over Time">
                  <ActivityOverTimeChart data={activityOverTime} />
                </ChartCard>
              </div>
              <div className="lg:col-span-2">
                <ChartCard title="Activity Types">
                  <ActivityTypesChart data={activityTypeCounts} />
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
