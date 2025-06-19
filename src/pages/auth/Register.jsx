import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus, ArrowLeft } from "lucide-react";
import apiClient, { showSwal, showValidationErrors } from "../../api/apiClient";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "mahasiswa" ? "/homepage" : "/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setError("");

    if (!formData.name.trim()) return setError("Nama wajib diisi");
    if (!formData.email.trim()) return setError("Email wajib diisi");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return setError("Email tidak valid");

    if (!formData.password || formData.password.length < 6)
      return setError("Password minimal 6 karakter");

    if (formData.password !== formData.password_confirmation)
      return setError("Password tidak cocok");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        role: "mahasiswa",
      };

      await apiClient.post("/register", payload);

      showSwal(
        "Pendaftaran Berhasil!",
        `Akun ${formData.name} berhasil dibuat. Silakan login.`,
        "success"
      );

      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        showValidationErrors(err);
      } else if (err.response?.status === 409) {
        setError("Email sudah terdaftar.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Daftar Akun Mahasiswa
          </h2>
          <p className="text-gray-600">Lengkapi data untuk mendaftar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg border-gray-200 bg-gray-50"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg border-gray-200 bg-gray-50"
                placeholder="nama@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg border-gray-200 bg-gray-50"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
              <input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg border-gray-200 bg-gray-50"
                placeholder="Ulangi password"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin border-b-2 border-white w-5 h-5 rounded-full"></div>
                Mendaftar...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Daftar Sekarang
              </>
            )}
          </button>
        </form>

        {/* Link ke Login */}
        <div className="text-center mt-6 border-t pt-4">
          <p className="text-gray-600 mb-2">Sudah punya akun?</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
