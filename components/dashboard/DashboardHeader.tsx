"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  search,
  onSearchChange,
  onRefresh,
}: DashboardHeaderProps) => {
  const router = useRouter();

  return (
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
        <button
          onClick={() => {
            clearAuthToken();
            router.push('/login');
          }}
          className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
  );
};
