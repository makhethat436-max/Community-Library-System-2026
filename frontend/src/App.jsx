
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard: All logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        {/* Books and Transactions: Admin and Librarian */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin", "Librarian"]} />
          }
        >
          <Route element={<Layout />}>
            <Route path="/books" element={<Books />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
        </Route>

        {/* Users: Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<Layout />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
