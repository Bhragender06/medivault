import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/auth/AuthProvider";
import { AdminRoute, ProtectedRoute } from "@/auth/ProtectedRoute";
import { useAuth } from "@/auth/AuthProvider";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import UploadRecord from "./pages/UploadRecord";
import ShareRecord from "./pages/ShareRecord";
import HealthRecords from "./pages/HealthRecords";
import PartnerNetwork from "./pages/PartnerNetwork";
import AccountSettings from "./pages/AccountSettings";
import SecurityLogs from "./pages/SecurityLogs";
import ConsentManager from "./pages/ConsentManager";
import IssueRecords from "./pages/IssueRecords";
import AdminRegistrations from "./pages/AdminRegistrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Redirects /dashboard to the correct role-based dashboard */
function RoleBasedDashboard() {
  const { user } = useAuth();
  const role = user?.role ?? localStorage.getItem("userRole");
  if (role === "patient") return <Navigate to="/patient-dashboard" replace />;
  return <Navigate to="/doctor-dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-aware dashboard redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dashboards */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Core Flows */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/share"
              element={
                <ProtectedRoute>
                  <ShareRecord />
                </ProtectedRoute>
              }
            />

            <Route path="/records"           element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
            <Route path="/partners"          element={<PartnerNetwork />} />
            <Route path="/settings"          element={<AccountSettings />} />
            <Route path="/security-settings" element={<AccountSettings />} />
            <Route path="/verification"      element={<SecurityLogs />} />
            <Route path="/vault"             element={<ConsentManager />} />
            <Route path="/analytics"         element={<IssueRecords />} />
            <Route path="/issue-records"     element={<IssueRecords />} />
            <Route path="/support"           element={<DoctorDashboard />} />

            <Route
              path="/admin/registrations"
              element={
                <AdminRoute>
                  <AdminRegistrations />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
