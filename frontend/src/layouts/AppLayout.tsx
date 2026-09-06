import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/Button/Button";
import { logout } from "../api/auth";
import "./AppLayout.css";

export function AppLayout() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Job Tracker</h2>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/calendar">
            Calendar
          </NavLink>

          <NavLink to="/analytics">
            Analytics
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>

          <Button type="button" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}