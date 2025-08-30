"use client";

import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Activity } from "../types";

// Supabase Setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default function LiveLogsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  // Fetch initial data
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/participants-activity");
      const data = await response.json();
      
      setActivities(
        (data.activities || []).sort(
          (a: Activity, b: Activity) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (!supabase) return;

    const channel = supabase
      .channel("live_logs_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participant_activity" },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        }
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    return () => {
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  const formatDateTime = (iso?: string) => {
    if (!iso) return "–";
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Kolkata",
    });
  };

  const getActivityColor = (activityName: string) => {
    const colors = {
      'Check-in': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Check-out': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Breakfast': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Lunch': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Dinner': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[activityName as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading Live Logs...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Live Activity Logs
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time participant activity monitoring
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={fetchActivities}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activities.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activities.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Today&apos;s Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(activities.map(a => a.participant_id)).size}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Participants</div>
            </div>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activity Stream
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Live updates from participant activities
            </p>
          </div>
          
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No participants found matching your criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.activity_name)}`}>
                            {activity.activity_name}
                          </span>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Participant:</span>
                            <div className="font-mono text-xs text-gray-900 dark:text-white">
                              {activity.participant_id}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                              {activity.name || "Unknown"}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                            <div className="text-gray-600 dark:text-gray-300 truncate">
                              {activity.email || "—"}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Time:</span>
                            <div className="text-gray-600 dark:text-gray-300">
                              {formatDateTime(activity.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        {activity.description && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-gray-500 dark:text-gray-400">Description:</span>
                            <div className="mt-1">{activity.description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
