export type Participant = {
  id: string;
  team_id: string;
  team_name: string;
  candidate_name: string;
  candidate_role: string;
  candidate_email: string;
  participant_id: string;
};

export type Activity = {
  id: string;
  participant_id: string;
  activity_name: string;
  description?: string;
  name?: string; // Participant name, might be joined
  email?: string; // Participant email, might be joined
  created_at: string;
};

export type ParticipantLog = {
  id: string;
  participant_id: string;
  is_inside: boolean;
  toggled_at: string;
  participants_data?: {
    candidate_name: string;
    candidate_email: string;
    team_name: string;
    candidate_role: string;
  } | null;
};

export type OutsideParticipant = {
  participant_id: string;
  candidate_name: string;
  candidate_email: string;
  team_name: string;
  candidate_role: string;
  team_id: string;
  last_seen: string | null;
  status: 'outside' | 'never_scanned';
};
