import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../components/Button/Button";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Job Tracker</h2>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <Button type="submit">
            Login
          </Button>

          <NavLink to="/calendar">
            Calendar
          </NavLink>

          <NavLink to="/analytics">
            Analytics
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>
        </nav>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}