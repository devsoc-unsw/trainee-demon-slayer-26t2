import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { CalendarPage } from "../pages/CalendarPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}