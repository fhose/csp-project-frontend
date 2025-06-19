// src/pages/ActiveLoans.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  ArrowRightCircle,
  Calendar,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import Header from "../../components/Header";

const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";

const ActiveLoans = () => {
  const [loans, setLoans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userRes = await axios.get(`${LARAVEL_BACKEND_URL}/api/user`, {
        headers,
      });
      setUser(userRes.data);

      // Fetch loans data
      const res = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/loans/active?page=${currentPage}`,
        { headers }
      );
      setLoans(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        Swal.fire({
          icon: "error",
          title: "Sesi Habis",
          text: "Silakan login kembali.",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => navigate("/login", { replace: true }));
      } else {
        Swal.fire("Error", "Gagal memuat data aktif.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleExtend = async (loanId) => {
    const confirm = await Swal.fire({
      title: "Ajukan Perpanjangan",
      text: "Anda yakin ingin mengajukan perpanjangan peminjaman selama 7 hari?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ajukan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.post(
        `${LARAVEL_BACKEND_URL}/api/loans/${loanId}/request-extension`,
        {},
        { headers }
      );
      Swal.fire("Berhasil", res.data.message, "success");
      fetchData();
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal mengajukan perpanjangan.",
        "error"
      );
    }
  };

  const handleReturn = async (loanId) => {
    const confirm = await Swal.fire({
      title: "Kembalikan Barang",
      text: "Apakah Anda yakin ingin mengembalikan barang ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Kembalikan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const loan = loans.find((l) => l.id === loanId);

      const res = await axios.patch(
        `${LARAVEL_BACKEND_URL}/api/loans/${loanId}`,
        {
          status: "Dikembalikan",
        },
        { headers }
      );

      Swal.fire("Berhasil", res.data.message, "success");
      fetchData();
    } catch (err) {
      console.error("Return error:", err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal mengembalikan barang.",
        "error"
      );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status, dueDate) => {
    if (status === "Dipinjam" && isOverdue(dueDate)) {
      return "bg-red-100 text-red-800"; // terlambat
    }

    switch (status) {
      case "Dipinjam":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col">
      {/* Ganti navbar dengan Header component */}
      <Header currentPage="active-loans" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Peminjaman Aktif
            </h2>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-600 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <p>Memuat data...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p>Tidak ada peminjaman aktif saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Barang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Keperluan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tanggal Pinjam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Jatuh Tempo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Perpanjangan
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loans.map((loan, idx) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(currentPage - 1) * 10 + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{loan.item?.name}</div>
                        {loan.item?.code && (
                          <div className="text-xs text-gray-500">
                            {loan.item?.code}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {loan.quantity} unit
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs truncate" title={loan.purpose}>
                          {loan.purpose}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(loan.loan_date)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue(loan.due_date) ? "text-red-600" : ""
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(loan.due_date)}
                          {isOverdue(loan.due_date) && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 rounded ml-1">
                              Terlambat
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            loan.status,
                            loan.due_date
                          )}`}
                        >
                          {loan.status === "Dipinjam" &&
                          isOverdue(loan.due_date)
                            ? "Terlambat"
                            : loan.status}
                        </span>
                      </td>

                      {/* 🔸 Perpanjangan */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {loan.is_extended ? (
                          <span className="text-green-600 text-xs font-medium">
                            Disetujui
                          </span>
                        ) : loan.extension_requested &&
                          loan.extension_approved === false ? (
                          <span className="text-red-600 text-xs font-medium">
                            Ditolak
                          </span>
                        ) : loan.extension_requested ? (
                          <span className="text-yellow-600 text-xs font-medium">
                            Menunggu Persetujuan
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Belum Diajukan
                          </span>
                        )}
                      </td>

                      {/* 🔸 Aksi */}
                      <td className="px-4 py-3 text-sm space-y-1">
                        {loan.status === "Dipinjam" &&
                          (!loan.extension_requested ||
                            (loan.extension_requested &&
                              loan.extension_approved === false)) && (
                            <button
                              onClick={() => handleExtend(loan.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs transition-colors w-full"
                            >
                              <ArrowRightCircle className="w-3 h-3" />
                              Perpanjang
                            </button>
                          )}
                        {(loan.status === "Dipinjam" ||
                          loan.status === "Terlambat") && (
                          <button
                            onClick={() => handleReturn(loan.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs transition-colors w-full"
                          >
                            <RotateCw className="w-3 h-3" />
                            Kembalikan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Sebelumnya
              </button>
              <span className="flex items-center text-sm text-gray-600">
                Halaman <strong className="mx-1">{currentPage}</strong> dari{" "}
                <strong className="mx-1">{lastPage}</strong>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActiveLoans;
