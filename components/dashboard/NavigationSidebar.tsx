"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NavigationSidebar() {
  const router = useRouter();

  const navigationItems = [
    {
      name: "QR Scanner",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5.01M4 20h5.01" />
        </svg>
      ),
      path: "/scanner",
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Scan participant QR codes"
    },
    {
      name: "Activity Logs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: "/activity-logs",
      color: "bg-green-600 hover:bg-green-700",
      description: "View participant activities"
    },
    {
      name: "Entry/Exit Logs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      path: "/entry-exit-logs",
      color: "bg-orange-600 hover:bg-orange-700",
      description: "Real-time entry/exit tracking"
    },
    {
      name: "Outside Participants",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: "/participants-outside",
      color: "bg-red-600 hover:bg-red-700",
      description: "View participants currently outside"
    },
    {
      name: "Upload CSV",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      path: "/upload-csv",
      color: "bg-indigo-600 hover:bg-indigo-700",
      description: "Import participant data"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🚀 Quick Actions
      </h2>
      
      <div className="space-y-3">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-colors ${item.color} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          >
            {item.icon}
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="text-xs opacity-90">{item.description}</div>
            </div>
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          💡 Quick Tips
        </h3>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <p>• Use QR Scanner for participant check-ins</p>
          <p>• Monitor real-time logs for live tracking</p>
          <p>• Upload CSV to import participant data</p>
          <p>• Check Outside view for absent participants</p>
        </div>
      </div>
    </div>
  );
}
