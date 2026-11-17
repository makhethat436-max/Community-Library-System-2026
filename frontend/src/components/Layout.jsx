
import { NavLink, Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const role = currentUser?.role;

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedIn");

    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">

      {/* Left Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>Community Library</h2>
          <p>Management System</p>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          {(role === "Admin" || role === "Librarian") && (
            <>
              <NavLink to="/books">
                Books
              </NavLink>

              <NavLink to="/transactions">
                Transactions
              </NavLink>
            </>
          )}

          {role === "Admin" && (
            <NavLink to="/users">
              Users
            </NavLink>
          )}

        </nav>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* Right Side */}
      <div className="main-content">

        <header className="topbar">
          <h2>Library Dashboard</h2>

          <div className="top-user">
            <div className="top-user-info">
              <strong>{currentUser?.name || "User"}</strong>
              <span>{role || "Member"}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="footer">
          Community Library Management System
        </footer>

      </div>
    </div>
  );
}

export default Layout;
