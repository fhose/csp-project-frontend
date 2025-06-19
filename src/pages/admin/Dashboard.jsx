// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Home, Package, LogOut, Building2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient, { showSwal } from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per halaman

  const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";
  const navigate = useNavigate();

  // Pagination calculations
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const formatToWIB = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [userRes, dashboardRes] = await Promise.all([
          axios.get(`${LARAVEL_BACKEND_URL}/api/user`, { headers }),
          axios.get(`${LARAVEL_BACKEND_URL}/api/dashboard`, { headers }),
        ]);

        setUser(userRes.data);
        setStats(dashboardRes.data.stats || {});
        setActivities(dashboardRes.data.recent_activities || []);
      } catch (err) {
        console.error("Fetch dashboard error:", err);
        setError("Gagal memuat data dashboard. Pastikan Anda sudah login.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Reset to page 1 if current page exceeds total pages after data changes
  useEffect(() => {
    if (activities.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [activities.length, currentPage, totalPages]);

  const handleAction = async (loanId, action) => {
    setActionLoading(loanId);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const endpoint = action === "approve" ? "approve" : "reject";
      const response = await axios.post(
        `${LARAVEL_BACKEND_URL}/api/loans/${loanId}/${endpoint}`,
        {},
        { headers }
      );

      showSwal("Berhasil", response.data.message, "success");

      const dashboardRes = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/dashboard`,
        { headers }
      );
      setActivities(dashboardRes.data.recent_activities || []);
      setStats(dashboardRes.data.stats || {});
    } catch (err) {
      console.error(`Error ${action}ing loan:`, err);
      Swal.fire(
        "Gagal",
        `Gagal ${action === "approve" ? "menyetujui" : "menolak"} pinjaman`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveExtension = async (loanId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await axios.post(
        `${LARAVEL_BACKEND_URL}/api/loans/${loanId}/approve-extension`,
        {},
        { headers }
      );

      showSwal("Berhasil", res.data.message, "success");
      // Refresh data
      const dashboardRes = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/dashboard`,
        { headers }
      );
      setActivities(dashboardRes.data.recent_activities || []);
      setStats(dashboardRes.data.stats || []);
    } catch (err) {
      console.error("Error approve extension:", err);
      Swal.fire("Gagal", "Gagal menyetujui perpanjangan.", "error");
    }
  };

  const handleRejectExtension = async (loanId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await axios.post(
        `${LARAVEL_BACKEND_URL}/api/loans/${loanId}/reject-extension`,
        {},
        { headers }
      );

      showSwal("Ditolak", res.data.message, "info");
      // Refresh data
      const dashboardRes = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/dashboard`,
        { headers }
      );
      setActivities(dashboardRes.data.recent_activities || []);
      setStats(dashboardRes.data.stats || []);
    } catch (err) {
      console.error("Error reject extension:", err);
      Swal.fire("Gagal", "Gagal menolak perpanjangan.", "error");
    }
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
          const token = localStorage.getItem("token");
          const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          };

          await axios.post(
            `${LARAVEL_BACKEND_URL}/api/logout`,
            {},
            { headers }
          );
        } catch (err) {
          console.error("Logout gagal:", err);
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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">
            Memuat dashboard...
          </p>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-indigo-100">
          <p className="text-xl font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      {/* Sidebar - Kompak */}
      <aside className="w-60 bg-white shadow-xl border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo Section - Diperkecil */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Inventra</h2>
                <p className="text-xs text-gray-500">Inventory Management</p>
              </div>
            </div>
          </div>

          {/* Navigation - Kompak */}
          <nav className="flex-1 p-3 space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 group"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-sm text-indigo-600">Dashboard</span>
            </a>
            <a
              href="/items"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <Package className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
              <span className="font-medium text-sm text-gray-700 group-hover:text-indigo-600">
                Kelola Barang
              </span>
            </a>
          </nav>

          {/* Logout Section - Kompak */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                Swal.fire({
                  title: "Apakah Anda yakin ingin logout?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Ya, Logout",
                  cancelButtonText: "Batal",
                }).then((result) => {
                  if (result.isConfirmed) {
                    handleLogout();
                  }
                });
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 group w-full"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              <span className="font-medium text-sm text-gray-700 group-hover:text-red-600">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Optimized untuk 1 halaman */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 h-full flex flex-col">
          {/* Header - Lebih kompak */}
          <header className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Dashboard Admin
              </h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Selamat datang,{" "}
                  <span className="font-semibold text-indigo-600">
                    {user.name}
                  </span>
                </p>
              )}
            </div>
          </header>

          {/* Statistik Cards - Lebih kompak */}
          <section className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Statistik Sistem
              </h2>
              <div className="grid grid-cols-5 gap-3">
                <StatCard
                  label="Total Barang"
                  value={stats.total_items ?? "-"}
                  bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                  icon="📦"
                />
                <StatCard
                  label="Mahasiswa Terdaftar"
                  value={stats.total_users ?? "-"}
                  bgColor="bg-gradient-to-br from-green-500 to-green-600"
                  icon="👥"
                />
                <StatCard
                  label="Barang Dipinjam"
                  value={stats.items_on_loan ?? "-"}
                  bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  icon="📋"
                />
                <StatCard
                  label="Barang Rusak"
                  value={stats.items_needing_repair ?? "-"}
                  bgColor="bg-gradient-to-br from-red-500 to-red-600"
                  icon="🔧"
                />
                <StatCard
                  label="Pinjaman Terlambat"
                  value={stats.overdue_loans ?? "-"}
                  bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                  icon="⏰"
                />
              </div>
            </div>
          </section>

          {/* Aktivitas Terbaru - Flex-1 untuk mengisi sisa space */}
          <section className="flex-1 min-h-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3">
                <h2 className="text-lg font-bold text-white">
                  Aktivitas Peminjaman Terakhir
                </h2>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Mahasiswa
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Barang
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Keperluan
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Perpanjangan
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentActivities.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-2">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {activities.length === 0 ? "Belum ada aktivitas terbaru" : "Tidak ada data di halaman ini"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activities.length === 0 
                                ? "Peminjaman akan muncul di sini setelah mahasiswa mengajukan"
                                : `Menampilkan halaman ${currentPage} dari ${totalPages}`
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentActivities.map((loan, idx) => (
                        <tr
                          key={loan.id || idx}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-2 py-2">
                            <div 
                              className="text-xs font-medium text-gray-900 cursor-help"
                              title={loan.user?.name || "-"}
                            >
                              {loan.user?.name?.length > 15 
                                ? `${loan.user.name.substring(0, 15)}...` 
                                : loan.user?.name || "-"}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div 
                              className="text-xs text-gray-700 cursor-help"
                              title={loan.item?.name || "-"}
                            >
                              {loan.item?.name?.length > 20 
                                ? `${loan.item.name.substring(0, 20)}...` 
                                : loan.item?.name || "-"}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-xs text-gray-700">
                              {formatToWIB(loan.loan_date)}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-xs text-gray-700">
                              {loan.quantity ?? "-"}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div 
                              className="text-xs text-gray-700 cursor-help" 
                              title={loan.purpose || "-"}
                            >
                              {loan.purpose?.length > 15 
                                ? `${loan.purpose.substring(0, 15)}...` 
                                : loan.purpose || "-"}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-xs">
                              {loan.is_extended ? (
                                <span className="text-green-600 font-medium">
                                  Diterima
                                </span>
                              ) : loan.extension_requested &&
                                loan.extension_approved === null ? (
                                <span className="text-yellow-600 font-medium">
                                  Menunggu
                                </span>
                              ) : loan.extension_requested &&
                                loan.extension_approved === false ? (
                                <span className="text-red-600 font-medium">
                                  Ditolak
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Belum
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                loan.status === "Menunggu Konfirmasi"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : loan.status === "Dipinjam"
                                  ? "bg-green-100 text-green-700"
                                  : loan.status === "Dikembalikan"
                                  ? "bg-blue-100 text-blue-700"
                                  : loan.status === "Terlambat"
                                  ? "bg-red-100 text-red-700"
                                  : loan.status === "Ditolak"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="space-y-1">
                              {loan.status === "Menunggu Konfirmasi" && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleAction(loan.id, "approve")
                                    }
                                    disabled={actionLoading === loan.id}
                                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {actionLoading === loan.id
                                      ? "..."
                                      : "Setujui"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction(loan.id, "reject")
                                    }
                                    disabled={actionLoading === loan.id}
                                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {actionLoading === loan.id
                                      ? "..."
                                      : "Tolak"}
                                  </button>
                                </div>
                              )}
                              {loan.extension_requested &&
                                loan.extension_approved === null && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        handleApproveExtension(loan.id)
                                      }
                                      className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all duration-200 font-medium text-xs"
                                    >
                                      Setujui Perpanjangan
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectExtension(loan.id)
                                      }
                                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all duration-200 font-medium text-xs"
                                    >
                                      Tolak Perpanjangan
                                    </button>
                                  </div>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {activities.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      Menampilkan {startIndex + 1} - {Math.min(endIndex, activities.length)} dari {activities.length} aktivitas
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                currentPage === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// StatCard yang lebih kompak
const StatCard = ({ label, value, bgColor, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className={`${bgColor} px-3 py-3 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold mb-0.5">{value}</p>
          <p className="text-xs opacity-90 font-medium">{label}</p>
        </div>
        <div className="text-lg opacity-80">{icon}</div>
      </div>
    </div>
  </div>
);

export default Dashboard;