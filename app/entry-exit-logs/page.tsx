import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RealtimeLogsPage from "@/components/logs/RealtimeLogsPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <RealtimeLogsPage />
    </ProtectedRoute>
  );
}
