import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function Home() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}