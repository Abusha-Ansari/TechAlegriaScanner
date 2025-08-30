import React from "react";

type Activity = {
  id: string;
  participant_id: string;
  activity_name: string;
  description?: string;
  name?: string;
  email?: string;
  created_at: string;
};

interface ActivityFilterTableProps {
  activities: Activity[];
  activityTypes: string[];
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  formatTime: (iso?: string) => string;
}

export const ActivityFilterTable: React.FC<ActivityFilterTableProps> = ({
  activities,
  activityTypes,
  selectedType,
  onTypeChange,
  formatTime,
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Real-Time Activity Log
      </h3>
      <div className="flex items-center gap-2">
        <select
          value={selectedType || ""}
          onChange={(e) => onTypeChange(e.target.value || null)}
          className="px-2 py-1.5 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Activities</option>
          {activityTypes.map((type: string) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing: {activities.length}
        </span>
      </div>
    </div>
    <div className="overflow-x-auto max-h-[500px]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Participant ID
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Name
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Activity
            </th>
            <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.slice(0, 100).map((a: Activity) => (
            <tr key={a.id}>
              <td className="py-2 px-3 font-mono text-xs">
                {a.participant_id}
              </td>
              <td className="py-2 px-3">{a.name || "—"}</td>
              <td className="py-2 px-3">{a.activity_name}</td>
              <td className="py-2 px-3 whitespace-nowrap">
                {formatTime(a.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
