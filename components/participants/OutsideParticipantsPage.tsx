"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OutsideParticipant } from "../types";

export default function OutsideParticipantsPage() {
  const [participants, setParticipants] = useState<OutsideParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_count: 0,
    scanned_outside: 0,
    never_scanned: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Fetch participants currently outside
  const fetchOutsideParticipants = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/participants-outside");
      const data = await response.json();
      
      if (response.ok) {
        setParticipants(data.participants || []);
        setStats({
          total_count: data.total_count || 0,
          scanned_outside: data.scanned_outside || 0,
          never_scanned: data.never_scanned || 0
        });
      } else {
        console.error("Failed to fetch outside participants:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch outside participants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutsideParticipants();
  }, []);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Never scanned";
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'outside') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          🚪 Outside
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          ❓ Never Scanned
        </span>
      );
    }
  };

  // Filter participants based on search term only (no status filter needed since we only show outside participants)
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.participant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.team_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading Outside Participants...
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
                  Participants Outside
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View all participants currently outside the premises
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/scanner')}
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
              >
                QR Scanner
              </button>
              <button
                onClick={fetchOutsideParticipants}
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.total_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Participants Currently Outside</div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, ID, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participants Currently Outside
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredParticipants.length} participants currently outside
            </p>
          </div>
          
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No participants are currently outside</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant.participant_id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {participant.candidate_name}
                            </h3>
                            {getStatusBadge(participant.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div>
                              <span className="font-medium">ID:</span> 
                              <span className="font-mono ml-1">{participant.participant_id}</span>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> 
                              <span className="ml-1">{participant.candidate_email}</span>
                            </div>
                            <div>
                              <span className="font-medium">Team:</span> 
                              <span className="ml-1">{participant.team_name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Role:</span> 
                              <span className="ml-1">{participant.candidate_role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <div className="font-medium">Last Seen</div>
                        <div>{formatDateTime(participant.last_seen)}</div>
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
