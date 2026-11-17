import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            membership_id: membershipId.trim(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid membership ID or password.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid membership ID or password.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "Admin") {
        navigate("/dashboard");
      } else if (data.user.role === "Librarian") {
        navigate("/books");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={login}>
        <h2>Community Library System</h2>
        <p>Please log in to continue</p>

        {error && <p className="error-message">{error}</p>}

        <label>Membership ID</label>
        <input
          type="text"
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
          placeholder="Enter membership ID"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;