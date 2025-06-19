import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Mail, Lock, User, LogIn } from "lucide-react";
import apiClient, { showSwal, showValidationErrors } from "../../api/apiClient";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Authentication Guard - Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const validateToken = async () => {
      if (token && role) {
        try {
          await apiClient.get("/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Token valid → redirect berdasarkan role
          if (role === "mahasiswa") {
            navigate("/homepage", { replace: true });
          } else if (["admin", "asisten"].includes(role)) {
            navigate("/dashboard", { replace: true });
          }
        } catch (err) {
          console.warn(
            "Token tidak valid atau expired, redirect tetap di halaman login."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        }
      }
    };

    validateToken();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/login", {
        email,
        password,
      });

      if (res.data && res.data.token) {
        const role = res.data.data.role;
        const userName = res.data.data.name;

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.data.role);

        // Show success notification
        showSwal(
          "Login Berhasil!",
          `Selamat datang kembali, ${userName}!`,
          "success"
        );

        // Delay redirect untuk user bisa lihat notifikasi
        setTimeout(() => {
          // Redirect sesuai role
          if (role === "mahasiswa") {
            navigate("/homepage");
          } else if (["admin", "asisten"].includes(role)) {
            navigate("/dashboard");
          } else {
            navigate("/login");
          }
        }, 1500);
      } else {
        throw new Error("Token tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        showValidationErrors(err);
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex">
      {/* Left Side - Branding/Info */}
      <div className="hidden lg:flex lg:w-2/5 text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-600 animate-pulse opacity-50"></div>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(45deg, rgba(99, 102, 241, 0.8), rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.7))",
              animation: "slowMove 20s ease-in-out infinite alternate",
            }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 mb-12">
            <Package className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Inventra</h1>
              <p className="text-indigo-100 text-lg font-medium">
                One Portal for Lab Inventory & Loans
              </p>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                Selamat Datang!
              </h2>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Kelola peminjaman barang laboratorium dengan mudah dan efisien.
                Sistem terintegrasi untuk mahasiswa, asisten, dan administrator.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Package className="w-10 h-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Inventra</h1>
            </div>
            <p className="text-gray-600 text-lg">
              One Portal for Lab Inventory & Loans
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Masuk ke Akun
              </h2>
              <p className="text-gray-600 text-lg">
                Masukkan email dan password Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Masuk...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-lg">Belum punya akun?</p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-8 py-3 text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-sm"
                >
                  <User className="w-5 h-5" />
                  Daftar sebagai Mahasiswa
                </Link>
                <p className="text-sm text-gray-500 mt-4 font-medium">
                  Khusus untuk mahasiswa yang belum memiliki akun
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium">
              © 2025 Inventra. Lab Inventory Management System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
