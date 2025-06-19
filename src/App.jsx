import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Items from "./pages/admin/Items";
import Homepage from "./pages/user/Homepage";
import Register from "./pages/auth/Register";
import LoanHistory from "./pages/user/LoanHistory";
import ActiveLoans from "./pages/user/ActiveLoans";

function App() {
  return (
    <Routes>
      {/* ⬅️ Redirect root ke /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ⬅️ Login (Publik) */}
      <Route path="/login" element={<Login />} />
      {/* ⬅️ Register (Publik) */}
      <Route path="/register" element={<Register />} />

      {/* ⬅️ Homepage (mahasiswa, admin, asisten) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "asisten", "mahasiswa"]} />
        }
      >
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/active-loans" element={<ActiveLoans />} />
        <Route path="/loans" element={<LoanHistory />} />
      </Route>

      {/* ⬅️ Dashboard dan Items (admin & asisten) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "asisten"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/items" element={<Items />} />
      </Route>

      {/* Catch-all route (redirect ke login jika path tidak ditemukan) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
