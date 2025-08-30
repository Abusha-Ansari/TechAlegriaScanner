"use client";

import React from "react";

interface ParticipantLog {
  participant_id: string;
  participant_name?: string;
  new_state: boolean;
  toggled_at: string;
  status_text: string;
}

interface ParticipantStatusDisplayProps {
  lastToggle: ParticipantLog | null;
  isSuccess: boolean;
  error?: string;
}

export const ParticipantStatusDisplay = ({ 
  lastToggle, 
  isSuccess, 
  error 
}: ParticipantStatusDisplayProps) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!lastToggle) {
    return null;
  }

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${
      isSuccess 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            lastToggle.new_state 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            {lastToggle.new_state ? (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {lastToggle.participant_name || "Participant"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {lastToggle.participant_id}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            lastToggle.new_state
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {lastToggle.new_state ? '🏢 Inside' : '🚪 Outside'}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDateTime(lastToggle.toggled_at)}
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✅ Status successfully updated to <strong>{lastToggle.status_text}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
