import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { History } from "lucide-react";
import Swal from "sweetalert2";
import Header from "../../components/Header";

const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";

const LoanHistory = () => {
  const [loans, setLoans] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchLoans = async () => {
    try {
      const userRes = await axios.get(`${LARAVEL_BACKEND_URL}/api/user`, {
        headers,
      });
      setUser(userRes.data);

      const res = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/loans?page=${currentPage}`,
        { headers }
      );
      const paginated = res.data.data;

      // Filter hanya status yang sudah selesai
      const filtered = (paginated.data || []).filter((loan) =>
        ["Dikembalikan", "Ditolak"].includes(loan.status)
      );

      setLoans(filtered);
      setLastPage(paginated.last_page || 1);
    } catch (err) {
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
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [currentPage]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return "bg-yellow-100 text-yellow-800";
      case "Dipinjam":
        return "bg-blue-100 text-blue-800";
      case "Dikembalikan":
        return "bg-green-100 text-green-800";
      case "Ditolak":
        return "bg-red-100 text-red-800";
      case "Terlambat":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col">
      {/* Ganti navbar dengan Header component */}
      <Header currentPage="loans" />

      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Riwayat Peminjaman
          </h2>
          {loans.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <History className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              Belum ada peminjaman yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      No.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Barang
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Jumlah
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Keperluan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Pinjam
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Jatuh Tempo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Kembali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loans.map((loan, idx) => (
                    <tr key={loan.id}>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {(currentPage - 1) * 10 + idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div>{loan.item?.name}</div>
                        <div className="text-xs text-gray-500">
                          {loan.item?.code}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {loan.quantity} unit
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {loan.purpose}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {formatDate(loan.loan_date)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {formatDate(loan.due_date)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {loan.return_date ? (
                          <div
                            className={
                              new Date(loan.return_date) >
                              new Date(loan.due_date)
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {formatDate(loan.return_date)}
                            {new Date(loan.return_date) >
                              new Date(loan.due_date) && (
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                Terlambat
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            loan.status
                          )}`}
                        >
                          {loan.status}
                        </span>
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
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm text-gray-600">
                Halaman <strong>{currentPage}</strong> dari{" "}
                <strong>{lastPage}</strong>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
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

export default LoanHistory;
