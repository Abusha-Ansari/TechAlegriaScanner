import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LiveLogsPage from "@/components/logs/LiveLogsPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <LiveLogsPage />
    </ProtectedRoute>
  );
}
