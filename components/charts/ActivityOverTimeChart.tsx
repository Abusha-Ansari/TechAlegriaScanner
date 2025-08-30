import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

interface ActivityOverTimeData {
  day: string;
  count: number;
}

interface ActivityOverTimeChartProps {
  data: ActivityOverTimeData[];
}

export const ActivityOverTimeChart = ({ data }: ActivityOverTimeChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={data}
      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
    >
      <XAxis
        dataKey="day"
        stroke="currentColor"
        fontSize={12}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        stroke="currentColor"
        fontSize={12}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "black",
          border: "none",
          color: "white",
        }}
      />
      <Line
        type="monotone"
        dataKey="count"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);
