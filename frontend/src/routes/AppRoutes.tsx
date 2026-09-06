import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { CalendarPage } from "../pages/CalendarPage";
import { DashboardPage } from "../pages/DashboardPage";
import LoginPage  from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage"
import ProtectedRoute from "./ProtectedRoute";
import { ApplicationsPage } from "../pages/ApplicationsPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}