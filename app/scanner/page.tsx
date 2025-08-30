"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { QRScanner } from "@/components/scanner/QRScanner";
import { ParticipantStatusDisplay } from "@/components/scanner/ParticipantStatusDisplay";

interface ParticipantLog {
  participant_id: string;
  participant_name?: string;
  new_state: boolean;
  toggled_at: string;
  status_text: string;
}

export default function ScannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastToggle, setLastToggle] = useState<ParticipantLog | null>(null);
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleScan = async (participantId: string) => {
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participant_id: participantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle participant status");
      }

      setLastToggle(data);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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
                    Participant Scanner
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle participant inside/outside status
                  </p>
                </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Participant Scanner
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle participant inside/outside status
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/logs')}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                View Logs
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div>
            <QRScanner onScan={handleScan} isLoading={isLoading} />
          </div>

          {/* Status Display Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Last Status Change
              </h2>
              <ParticipantStatusDisplay 
                lastToggle={lastToggle}
                isSuccess={isSuccess}
                error={error}
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                📱 How to Use
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Enter participant ID manually or scan QR code</li>
                <li>• First scan marks participant as &quot;outside&quot; (entering premises)</li>
                <li>• Subsequent scans toggle between &quot;inside&quot; and &quot;outside&quot;</li>
                <li>• All status changes are logged with timestamps</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                🚀 Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/logs')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  📊 View Activity Logs
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  📈 Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
