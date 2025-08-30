"use client";

import React, { useState } from "react";

interface QRScannerProps {
  onScan: (participantId: string) => void;
  isLoading?: boolean;
}

export const QRScanner = ({ onScan, isLoading = false }: QRScannerProps) => {
  const [manualInput, setManualInput] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          QR Code Scanner
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Scan participant QR code to toggle inside/outside status
        </p>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label htmlFor="participant-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Participant ID
          </label>
          <input
            id="participant-id"
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Enter participant ID (e.g., HC00101)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!manualInput.trim() || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            "Toggle Status"
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p className="mb-1">💡 <strong>How it works:</strong></p>
          <p>• First scan: Participant marked as &quot;outside&quot; (entering premises)</p>
          <p>• Subsequent scans: Status toggles between &quot;inside&quot; and &quot;outside&quot;</p>
        </div>
      </div>
    </div>
  );
};
