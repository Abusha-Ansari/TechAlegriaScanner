import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard = ({ title, children }: ChartCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <div className="h-60">{children}</div>
  </div>
);
