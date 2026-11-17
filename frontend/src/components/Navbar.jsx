
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  let currentUser = {};

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "{}"
    );
  } catch (error) {
    currentUser = {};
  }

  const role = currentUser.role;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");

    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Community Library</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>

        {(role === "Admin" || role === "Librarian") && (
          <>
            <NavLink to="/books">Books</NavLink>
            <NavLink to="/transactions">Transactions</NavLink>
          </>
        )}

        {role === "Admin" && (
          <NavLink to="/users">Users</NavLink>
        )}
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}

export default Navbar;
