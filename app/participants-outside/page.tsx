import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OutsideParticipantsPage from "@/components/participants/OutsideParticipantsPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <OutsideParticipantsPage />
    </ProtectedRoute>
  );
}
