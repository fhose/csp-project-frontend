// src/components/Header.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User, LogOut, Clock, History, Home } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";

const Header = ({ currentPage = "homepage" }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await axios.get(`${LARAVEL_BACKEND_URL}/api/user`, { headers });
        setUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response?.status === 401) {
          handleUnauthorized();
        }
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    Swal.fire({
      icon: "error",
      title: "Sesi Habis",
      text: "Silakan login kembali.",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => navigate("/login", { replace: true }));
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${LARAVEL_BACKEND_URL}/api/logout`, {}, { headers });
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          
          Swal.fire({
            icon: "success",
            title: "Logout Berhasil",
            text: "Anda telah keluar dari sistem.",
            timer: 1500,
            showConfirmButton: false,
          });

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1600);
        }
      }
    });
  };

  // Get page title based on current page
  const getPageTitle = () => {
    switch (currentPage) {
      case "homepage":
        return "Inventory Management";
      case "active-loans":
        return "Peminjaman Aktif";
      case "loan-history":
        return "Riwayat Peminjaman";
      default:
        return "Inventory Management";
    }
  };

  return (
    <nav className="bg-white shadow-xl border-r border-gray-200 p-6 flex items-center flex-shrink-0">
      {/* Left: Logo & Title - Consistent with Dashboard.jsx */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventra</h2>
          <p className="text-xs text-gray-500">Inventory Management</p>
        </div>
      </div>

      {/* Center: Navigation Links - Consistent styling with Dashboard sidebar */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-2 items-center">
          {/* Homepage Link */}
          <Link
            to="/homepage"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentPage === "homepage"
                ? "bg-indigo-50 border border-indigo-200"
                : "hover:bg-gray-100"
            }`}
          >
            <Home className={`w-5 h-5 ${
              currentPage === "homepage"
                ? "text-indigo-600"
                : "text-gray-400 group-hover:text-indigo-600"
            }`} />
            <span className={`font-medium ${
              currentPage === "homepage"
                ? "text-indigo-600"
                : "text-gray-700 group-hover:text-indigo-600"
            }`}>
              Homepage
            </span>
          </Link>

          {/* Peminjaman Aktif Link */}
          <Link
            to="/active-loans"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentPage === "active-loans"
                ? "bg-indigo-50 border border-indigo-200"
                : "hover:bg-gray-100"
            }`}
          >
            <Clock className={`w-5 h-5 ${
              currentPage === "active-loans"
                ? "text-indigo-600"
                : "text-gray-400 group-hover:text-indigo-600"
            }`} />
            <span className={`font-medium ${
              currentPage === "active-loans"
                ? "text-indigo-600"
                : "text-gray-700 group-hover:text-indigo-600"
            }`}>
              Peminjaman Aktif
            </span>
          </Link>

          {/* Riwayat Peminjaman Link */}
          <Link
            to="/loans"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentPage === "loan-history"
                ? "bg-indigo-50 border border-indigo-200"
                : "hover:bg-gray-100"
            }`}
          >
            <History className={`w-5 h-5 ${
              currentPage === "loan-history"
                ? "text-indigo-600"
                : "text-gray-400 group-hover:text-indigo-600"
            }`} />
            <span className={`font-medium ${
              currentPage === "loan-history"
                ? "text-indigo-600"
                : "text-gray-700 group-hover:text-indigo-600"
            }`}>
              Riwayat Peminjaman
            </span>
          </Link>
        </div>
      </div>

      {/* Right: User Actions - Consistent with Dashboard.jsx */}
      <div className="flex gap-4 items-center">
        {/* User Info */}
        <div className="flex gap-2 items-center text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
          <User className="w-4 h-4" />
          <span className="font-medium">{user?.name || "User"}</span>
        </div>

        {/* Logout Button - Consistent with Dashboard.jsx styling */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
          <span className="font-medium text-gray-700 group-hover:text-red-600">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Header;