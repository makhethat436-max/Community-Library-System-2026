
import { useEffect, useState } from "react";

function Users() {
  const API_URL = "http://127.0.0.1:5000/api/users";

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [role, setRole] = useState("Member");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearForm = () => {
    setName("");
    setMembershipId("");
    setRole("Member");
    setPassword("");
    setEditingId(null);
  };

  const saveUser = async (e) => {
    e.preventDefault();

    if (!name.trim() || !membershipId.trim()) {
      alert("Please enter the name and membership ID.");
      return;
    }

    if (editingId === null && !password.trim()) {
      alert("Please enter a password for the new user.");
      return;
    }

    if (password && password.length < 6) {
      alert("Password must have at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: name.trim(),
        membership_id: membershipId.trim(),
        role
      };

      if (password.trim()) {
        userData.password = password;
      }

      const response = await fetch(
        editingId !== null
          ? `${API_URL}/${editingId}`
          : API_URL,
        {
          method: editingId !== null ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save user.");
      }

      alert(data.message || "User saved successfully.");

      clearForm();
      await fetchUsers();

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setName(user.name);
    setMembershipId(user.membership_id);
    setRole(user.role);
    setPassword("");
    setEditingId(user.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteUser = async (id) => {
    const user = users.find(user => user.id === id);

    if (!user) return;

    if (
      user.role === "Admin" &&
      users.filter(user => user.role === "Admin").length === 1
    ) {
      alert("The last Admin cannot be deleted.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${user.name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete user.");
      }

      alert(data.message || "User deleted successfully.");

      if (editingId === id) {
        clearForm();
      }

      await fetchUsers();

    } catch (error) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchText = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchText) ||
      String(user.membership_id).toLowerCase().includes(searchText) ||
      user.role.toLowerCase().includes(searchText)
    );
  });

  const totalAdmins = users.filter(
    user => user.role === "Admin"
  ).length;

  const totalLibrarians = users.filter(
    user => user.role === "Librarian"
  ).length;

  const totalMembers = users.filter(
    user => user.role === "Member"
  ).length;

  return (
    <div className="users-page">

      <div className="users-heading">
        <div>
          <h1>User Management</h1>
          <p>
            Manage library accounts, membership details and user roles.
          </p>
        </div>
      </div>

      <div className="user-summary">

        <div className="user-summary-card">
          <span>Total Users</span>
          <h2>{users.length}</h2>
          <p>All registered accounts</p>
        </div>

        <div className="user-summary-card">
          <span>Administrators</span>
          <h2>{totalAdmins}</h2>
          <p>System administrators</p>
        </div>

        <div className="user-summary-card">
          <span>Librarians</span>
          <h2>{totalLibrarians}</h2>
          <p>Library staff accounts</p>
        </div>

        <div className="user-summary-card">
          <span>Members</span>
          <h2>{totalMembers}</h2>
          <p>Registered library members</p>
        </div>

      </div>

      <div className="user-form-section">

        <div className="user-section-heading">
          <div>
            <h2>
              {editingId !== null ? "Update User" : "Add New User"}
            </h2>
            <p>
              Enter the user's account information below.
            </p>
          </div>
        </div>

        <form onSubmit={saveUser} className="user-form-grid">

          <div className="user-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="user-field">
            <label>Membership ID</label>
            <input
              type="text"
              placeholder="Enter membership ID"
              value={membershipId}
              onChange={e => setMembershipId(e.target.value)}
              required
            />
          </div>

          <div className="user-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={
                editingId !== null
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={editingId === null}
            />
          </div>

          <div className="user-field">
            <label>User Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="Member">Member</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="user-form-actions">

            <button
              type="submit"
              className="user-save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId !== null
                  ? "Update User"
                  : "Add User"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="user-cancel-btn"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      <div className="user-list-section">

        <div className="user-list-heading">

          <div>
            <h2>Registered Users</h2>
            <p>View, search and manage library accounts.</p>
          </div>

          <input
            type="text"
            className="user-search"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

        </div>

        {filteredUsers.length === 0 ? (

          <div className="user-empty-state">
            <h3>No users found</h3>
            <p>
              Add a new user or change your search.
            </p>
          </div>

        ) : (

          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>

                    <td>{user.name}</td>
                    <td>{user.membership_id}</td>

                    <td>
                      <span
                        className={`user-role-badge ${user.role.toLowerCase()}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="user-actions">

                      <button
                        type="button"
                        className="user-edit-btn"
                        onClick={() => editUser(user)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="user-delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>

        )}

        <p className="user-total">
          Showing {filteredUsers.length} of {users.length} users
        </p>

      </div>

    </div>
  );
}

export default Users;
