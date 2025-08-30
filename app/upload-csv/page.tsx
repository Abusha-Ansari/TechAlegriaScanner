import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CSVUploadPage from "@/components/upload/CSVUploadPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <CSVUploadPage />
    </ProtectedRoute>
  );
}
