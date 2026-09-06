import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

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
    <div className="flex min-h-screen bg-[#F8F5FC]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#17182F] px-5 py-7">
        
        {/* Logo */}
        <div className="mb-12 px-3">
          <h2 className="font-['Press_Start_2P'] text-sm leading-6 text-[#D0BCFF]">
            JOB
            <br />
            TRACKER
          </h2>

          <p className="mt-3 text-xs font-semibold text-[#8A8199]">
            Track it. Apply it. Get hired. ♡
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#7652B8] text-white shadow-[4px_4px_0px_#0D0E1F] translate-x-[-1px]"
                  : "text-[#B8B1C7] hover:bg-[#242342] hover:text-white"
              }`
            }
          >
            <span>▣</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#7652B8] text-white shadow-[4px_4px_0px_#0D0E1F]"
                  : "text-[#B8B1C7] hover:bg-[#242342] hover:text-white"
              }`
            }
          >
            <span>▦</span>
            Calendar
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#7652B8] text-white shadow-[4px_4px_0px_#0D0E1F]"
                  : "text-[#B8B1C7] hover:bg-[#242342] hover:text-white"
              }`
            }
          >
            <span>◒</span>
            Analytics
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#7652B8] text-white shadow-[4px_4px_0px_#0D0E1F]"
                  : "text-[#B8B1C7] hover:bg-[#242342] hover:text-white"
              }`
            }
          >
            <span>♡</span>
            Profile
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-[#302F4A] pt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#B8B1C7] transition-all hover:bg-[#242342] hover:text-[#E9A0C5]"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 bg-[#F8F5FC] p-8">
        <Outlet />
      </main>
    </div>
  );
}