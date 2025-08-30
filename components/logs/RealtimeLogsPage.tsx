"use client";

import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ParticipantLog } from "../types";

// Supabase Setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default function RealtimeLogsPage() {
  const [logs, setLogs] = useState<ParticipantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  // Fetch initial data
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/participant-logs");
      const data = await response.json();
      
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch participant logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (!supabase) return;

    const channel = supabase
      .channel("realtime_participant_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants_log" },
        async (payload) => {
          // Fetch the complete log entry with participant data
          const { data: newLogWithParticipant } = await supabase
            .from('participants_log')
            .select(`
              id,
              participant_id,
              is_inside,
              toggled_at,
              participants_data (
                candidate_name,
                candidate_email,
                team_name,
                candidate_role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newLogWithParticipant) {
            setLogs((prev) => [newLogWithParticipant as unknown as ParticipantLog, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "participants_log" },
        async (payload) => {
          // Fetch the updated log entry with participant data
          const { data: updatedLogWithParticipant } = await supabase
            .from('participants_log')
            .select(`
              id,
              participant_id,
              is_inside,
              toggled_at,
              participants_data (
                candidate_name,
                candidate_email,
                team_name,
                candidate_role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (updatedLogWithParticipant) {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id ? updatedLogWithParticipant as unknown as ParticipantLog : log
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "participants_log" },
        (payload) =>
          setLogs((prev) => prev.filter((log) => log.id !== payload.old.id))
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

  const getStatusColor = (isInside: boolean) => {
    return isInside
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusIcon = (isInside: boolean) => {
    return isInside ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading Realtime Logs...
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
                  Realtime Participant Logs
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Live participant entry/exit monitoring
                </p>
              </div>
            </div>
            
            {/* Connection Status & Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={fetchLogs}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {logs.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {logs.filter(log => log.is_inside).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Inside Logs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {logs.filter(log => !log.is_inside).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Outside Logs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {logs.filter(log => new Date(log.toggled_at).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Today&apos;s Logs</div>
            </div>
          </div>
        </div>

        {/* Logs Stream */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participant Entry/Exit Log
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time updates from participant scans
            </p>
          </div>
          
          <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No participant logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(log.is_inside)}`}>
                          {getStatusIcon(log.is_inside)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {log.participants_data?.candidate_name || "Unknown Participant"}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.is_inside)}`}>
                              {log.is_inside ? '🏢 Inside' : '🚪 Outside'}
                            </span>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Latest
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div>
                              <span className="font-medium">ID:</span> 
                              <span className="font-mono ml-1">{log.participant_id}</span>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> 
                              <span className="ml-1">{log.participants_data?.candidate_email || "—"}</span>
                            </div>
                            <div>
                              <span className="font-medium">Team:</span> 
                              <span className="ml-1">{log.participants_data?.team_name || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(log.toggled_at)}
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
