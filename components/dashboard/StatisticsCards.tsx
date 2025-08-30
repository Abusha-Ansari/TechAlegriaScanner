import { StatCard } from "../ui/StatCard";

type Participant = {
  id: string;
  team_id: string;
  team_name: string;
  candidate_name: string;
  candidate_role: string;
  candidate_email: string;
  participant_id: string;
};

interface ActivityCount {
  name: string;
  value: number;
}

interface StatisticsCardsProps {
  participants: Participant[];
  allActivityCounts: ActivityCount[];
}

export const StatisticsCards = ({ participants, allActivityCounts }: StatisticsCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
    {/* Static cards that are calculated differently */}
    <StatCard
      title="Total Participants"
      value={participants.length}
    />
    <StatCard
      title="Unique Teams"
      value={new Set(participants.map((p) => p.team_id)).size}
    />

    {/* Dynamically generate a stat card for every unique activity found in the data */}
    {allActivityCounts.map(({ name, value }) => (
      <StatCard
        key={name}
        title={name}
        value={`${value} / ${participants.length}`}
      />
    ))}
  </div>
);
