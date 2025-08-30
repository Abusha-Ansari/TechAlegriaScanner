interface StatCardProps {
  title: string;
  value: number | string;
}

export const StatCard = ({ title, value }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col">
    <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    <span className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
      {value}
    </span>
  </div>
);
