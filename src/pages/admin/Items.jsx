import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Home,
  Package,
  LogOut,
  MapPin,
  FileText,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";

const Items = () => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    location: "",
    condition: "",
    quantity: 1,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per halaman

  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/items?per_page=100`,
        { headers }
      );

      const paginated = res.data?.data;
      const itemsData = paginated?.data || [];

      setItems(itemsData);
      setTotalItems(paginated?.total || itemsData.length);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Gagal memuat barang");
    } finally {
      setLoading(false);
    }
  };

  const fetchConditions = async () => {
    try {
      const res = await axios.get(
        `${LARAVEL_BACKEND_URL}/api/item-conditions`,
        { headers }
      );
      setConditions(res.data.data);
    } catch (err) {
      console.error("Gagal memuat kondisi:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchConditions();
  }, []);

  // Reset to page 1 if current page exceeds total pages after data changes
  useEffect(() => {
    if (items.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, currentPage, totalPages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        location: form.location,
        condition: form.condition,
        quantity: parseInt(form.quantity),
      };

      if (editingItem) {
        // Cek apakah sedang dipinjam
        const isOnLoan =
          editingItem.loans && editingItem.loans.some((l) => !l.return_date);
        if (isOnLoan) {
          setError("Barang ini sedang dipinjam dan tidak dapat diedit.");
          return;
        }

        await axios.put(
          `${LARAVEL_BACKEND_URL}/api/items/${editingItem.id}`,
          payload,
          { headers }
        );

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data barang berhasil diperbarui",
          confirmButtonColor: "#4f46e5",
        });
      } else {
        await axios.post(`${LARAVEL_BACKEND_URL}/api/items`, payload, {
          headers,
        });

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Barang baru berhasil ditambahkan",
          confirmButtonColor: "#4f46e5",
        });
      }

      setShowForm(false);
      setForm({
        name: "",
        code: "",
        description: "",
        location: "",
        condition: "",
        quantity: 1,
      });
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      if (err.response?.status === 422) {
        setError("Validasi gagal. Pastikan semua data diisi dengan benar.");
      } else if (err.response?.status === 409) {
        setError("Kode barang sudah digunakan. Harap gunakan kode unik.");
      } else {
        setError("Gagal menyimpan data.");
      }
    }
  };

  const handleEdit = (item) => {
    // Cek apakah sedang dipinjam
    const isOnLoan = item.loans && item.loans.some((l) => !l.return_date);
    if (isOnLoan) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Dapat Diedit",
        text: "Barang ini sedang dipinjam dan tidak dapat diedit.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    setEditingItem(item);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description || "",
      location: item.location,
      condition: item.condition,
      quantity: item.quantity,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const isOnLoan = item.loans && item.loans.some((l) => !l.return_date);
    if (isOnLoan) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Dapat Dihapus",
        text: "Barang ini sedang dipinjam dan tidak dapat dihapus.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Barang "${item.name}" akan dihapus permanen`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${LARAVEL_BACKEND_URL}/api/items/${id}`, {
          headers,
        });
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Barang berhasil dihapus.",
          confirmButtonColor: "#4f46e5",
        });
        fetchItems();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Gagal menghapus barang.",
          confirmButtonColor: "#4f46e5",
        });
      }
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
          await axios.post(`${LARAVEL_BACKEND_URL}/api/logout`, {}, { headers });
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
            window.location.href = "/login";
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
            Memuat data barang...
          </p>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      {/* Sidebar - Konsisten dengan Dashboard */}
      <aside className="w-60 bg-white shadow-xl border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo Section - Kompak */}
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
              <span className="font-medium text-sm text-gray-700 group-hover:text-indigo-600">
                Dashboard
              </span>
            </a>
            <a
              href="/items"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 group"
            >
              <Package className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-sm text-indigo-600">Kelola Barang</span>
            </a>
          </nav>

          {/* Logout Section - Kompak */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
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
          {/* Header - Kompak */}
          <header className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Kelola Barang
              </h1>
              <p className="text-sm text-gray-600">
                Manajemen inventaris barang yang tersedia untuk dipinjam
              </p>
            </div>
          </header>

          {/* Action Bar - Kompak */}
          <section className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                  <span className="text-indigo-700 font-semibold text-sm">
                    Total: {totalItems} barang
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchItems}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-xs border border-gray-200"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setForm({
                        name: "",
                        code: "",
                        description: "",
                        location: "",
                        condition: "",
                        quantity: 1,
                      });
                      setEditingItem(null);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-xs shadow-sm"
                  >
                    <Plus size={14} />
                    Tambah Barang
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Items Table - Flex-1 untuk mengisi sisa space */}
          <section className="flex-1 min-h-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3">
                <h2 className="text-lg font-bold text-white">Daftar Barang</h2>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Nama Barang
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Kode
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Kondisi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-2">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {items.length === 0 ? "Belum ada barang" : "Tidak ada data di halaman ini"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {items.length === 0 
                                ? "Tambahkan barang pertama Anda untuk memulai"
                                : `Menampilkan halaman ${currentPage} dari ${totalPages}`
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-3 py-2">
                            <div 
                              className="text-xs font-medium text-gray-900 cursor-help"
                              title={item.name}
                            >
                              {item.name?.length > 25 
                                ? `${item.name.substring(0, 25)}...` 
                                : item.name}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">
                              {item.code}
                            </code>
                          </td>
                          <td className="px-3 py-2">
                            <div
                              className="text-xs text-gray-600 cursor-help"
                              title={item.description || "-"}
                            >
                              {item.description?.length > 20 
                                ? `${item.description.substring(0, 20)}...` 
                                : item.description || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span 
                                className="text-xs text-gray-700 cursor-help"
                                title={item.location || "-"}
                              >
                                {item.location?.length > 15 
                                  ? `${item.location.substring(0, 15)}...` 
                                  : item.location || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                item.condition === "TERSEDIA"
                                  ? "bg-green-100 text-green-700"
                                  : item.condition === "DALAM_PERBAIKAN"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : item.condition === "RUSAK"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.condition === "TERSEDIA"
                                ? "Tersedia"
                                : item.condition === "DALAM_PERBAIKAN"
                                ? "Perbaikan"
                                : item.condition === "RUSAK"
                                ? "Rusak"
                                : item.condition}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-xs">
                              <span className="font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <span className="text-gray-500 ml-1">unit</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-white bg-blue-600 hover:bg-blue-700 rounded transition-all duration-200"
                                title="Edit barang"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-white bg-red-600 hover:bg-red-700 rounded transition-all duration-200"
                                title="Hapus barang"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {items.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      Menampilkan {startIndex + 1} - {Math.min(endIndex, items.length)} dari {items.length} barang
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

      {/* Modal Form - Dirapikan */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setForm({
                      name: "",
                      code: "",
                      description: "",
                      location: "",
                      condition: "",
                      quantity: 1,
                    });
                  }}
                  className="text-white hover:text-gray-200 hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nama & Kode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white text-sm"
                    placeholder="Nama barang"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Kode Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white text-sm"
                    placeholder="Kode barang"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deskripsi <FileText className="inline w-3.5 h-3.5 ml-1 text-gray-400" />
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white resize-none text-sm"
                  placeholder="Deskripsi barang (opsional)"
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Lokasi <MapPin className="inline w-3.5 h-3.5 ml-1 text-gray-400" /> <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white text-sm"
                  placeholder="Lokasi penyimpanan"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              {/* Kondisi & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Kondisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white text-sm"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    required
                  >
                    <option value="">-- Pilih Kondisi --</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Jumlah Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white text-sm"
                    min="1"
                    placeholder="Jumlah stok"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium text-sm"
                >
                  {editingItem ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;