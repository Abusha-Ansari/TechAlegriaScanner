"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UploadResponse {
  message: string;
  rowsInserted: number;
  insertedIds: string[];
}

interface UploadError {
  error: string;
  details?: string | object;
}

export default function CSVUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError("");
        setUploadResult(null);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError("");
        setUploadResult(null);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError("Please select a valid CSV file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setUploading(true);
    setError("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data as UploadResponse);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = data as UploadError;
        setError(errorData.error || 'Upload failed');
      }
    } catch {
      setError('Network error: Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
                  Upload Participants CSV
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Import participant data from CSV file
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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
        <div className="space-y-6">
          {/* CSV Format Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              📋 CSV Format Requirements
            </h2>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p>Your CSV file must contain the following columns (exact names):</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Team ID</strong> - Unique identifier for the team</li>
                <li><strong>Team Name</strong> - Name of the team</li>
                <li><strong>Candidate role</strong> - Role of the participant</li>
                <li><strong>Candidate&apos;s Name</strong> - Full name of the participant</li>
                <li><strong>Candidate&apos;s Email</strong> - Email address of the participant</li>
              </ul>
              <p className="mt-3 text-xs">
                💡 Participant IDs will be auto-generated in format: HC001001, HC001002, etc.
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload CSV File
            </h2>

            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                {file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Selected: {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Size: {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={clearFile}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                      disabled={uploading}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV files only, max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload CSV'
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {uploadResult.message}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Successfully imported {uploadResult.rowsInserted} participants
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => router.push('/')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      View Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/scanner')}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Start Scanning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
