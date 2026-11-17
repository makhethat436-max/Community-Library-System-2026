
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  // Check if the user is logged in
  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user's role has permission
  if (
    allowedRoles &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
