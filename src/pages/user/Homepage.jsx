// src/pages/Homepage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  Package,
  MapPin,
  Hash,
  Eye,
  ShoppingCart,
  History,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../../components/Header";

const LARAVEL_BACKEND_URL = "http://127.0.0.1:8000";

const Homepage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Client-side pagination untuk filtered items
  const [itemsPerPage] = useState(12);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Client-side pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, itemsRes] = await Promise.all([
          axios.get(`${LARAVEL_BACKEND_URL}/api/user`, { headers }),
          axios.get(
            `${LARAVEL_BACKEND_URL}/api/items?per_page=100`,
            { headers }
          ),
        ]);

        setUser(userRes.data);
        const paginated = itemsRes.data.data;
        const itemsData = paginated.data || itemsRes.data.data || [];
        setItems(itemsData);
        setFilteredItems(itemsData);
        setTotalItems(itemsData.length);
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire(
          "Error",
          "Gagal memuat data. Pastikan Anda sudah login.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCondition) {
      filtered = filtered.filter((item) => item.condition === filterCondition);
    }

    if (filterLocation) {
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [items, searchTerm, filterCondition, filterLocation]);

  const handleLoanRequest = async (formData) => {
    setLoanLoading(true);
    try {
      const response = await axios.post(
        `${LARAVEL_BACKEND_URL}/api/loans`,
        formData,
        { headers }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text:
          response.data.message || "Permintaan peminjaman berhasil diajukan!",
        confirmButtonText: "OK",
        confirmButtonColor: "#3B82F6",
      });

      setShowLoanForm(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Loan request error:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal mengajukan permintaan peminjaman";

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoanLoading(false);
    }
  };

  const uniqueLocations = [...new Set(items.map((item) => item.location))];

  const getConditionBadge = (condition) => {
    const badges = {
      TERSEDIA: { color: "bg-green-100 text-green-800", text: "Tersedia" },
      DALAM_PERBAIKAN: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Dalam Perbaikan",
      },
      RUSAK: { color: "bg-red-100 text-red-800", text: "Rusak" },
    };
    return (
      badges[condition] || {
        color: "bg-gray-100 text-gray-800",
        text: condition,
      }
    );
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">
            Memuat inventaris...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Header Component - Tidak Diubah */}
      <Header currentPage="homepage" />

      {/* Main Content - Optimized untuk 1 halaman */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 h-full flex flex-col">
          {/* Header Section - Kompak */}
          <section className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Katalog Barang
              </h2>
              <p className="text-sm text-gray-600">
                Temukan dan pinjam barang yang Anda butuhkan
              </p>
            </div>
          </section>

          {/* Search & Filter Section - Kompak */}
          <section className="mb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Filter dan Pencarian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="search-item"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Pencarian
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="search-item"
                      type="text"
                      placeholder="Cari nama barang atau kode..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Condition */}
                <div>
                  <label
                    htmlFor="filter-condition"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Kondisi Barang
                  </label>
                  <select
                    id="filter-condition"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm"
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                  >
                    <option value="" className="text-gray-900">
                      Semua Kondisi
                    </option>
                    <option value="TERSEDIA" className="text-gray-900">
                      Tersedia
                    </option>
                    <option value="DALAM_PERBAIKAN" className="text-gray-900">
                      Dalam Perbaikan
                    </option>
                    <option value="RUSAK" className="text-gray-900">
                      Rusak
                    </option>
                  </select>
                </div>

                {/* Filter Location */}
                <div>
                  <label
                    htmlFor="filter-location"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Lokasi
                  </label>
                  <select
                    id="filter-location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  >
                    <option value="" className="text-gray-900">
                      Semua Lokasi
                    </option>
                    {uniqueLocations.map((location) => (
                      <option
                        key={location}
                        value={location}
                        className="text-gray-900"
                      >
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-xs text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(filteredItems.length, currentItems.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900">
                  {filteredItems.length}
                </span>{" "}
                barang
              </div>
            </div>
          </section>

          {/* Items Grid - Flex-1 untuk mengisi sisa space */}
          <section className="flex-1 min-h-0 flex flex-col">
            {currentItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Tidak ada barang ditemukan
                  </h3>
                  <p className="text-sm text-gray-500">
                    Coba ubah kriteria pencarian atau filter Anda
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onViewDetail={setSelectedItem}
                        onRequestLoan={() => {
                          setSelectedItem(item);
                          setShowLoanForm(true);
                        }}
                        getConditionBadge={getConditionBadge}
                      />
                    ))}
                  </div>
                </div>

                {/* Pagination - Di bagian bawah */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-700">
                          Halaman {currentPage} dari {totalPages}
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
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && !showLoanForm && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRequestLoan={() => setShowLoanForm(true)}
          getConditionBadge={getConditionBadge}
        />
      )}

      {/* Loan Form Modal */}
      {showLoanForm && selectedItem && (
        <LoanFormModal
          item={selectedItem}
          user={user}
          onClose={() => {
            setShowLoanForm(false);
            setSelectedItem(null);
          }}
          onSubmit={handleLoanRequest}
          loading={loanLoading}
          getConditionBadge={getConditionBadge}
        />
      )}
    </div>
  );
};

// Item Card Component - Dirapikan
const ItemCard = ({ item, onViewDetail, onRequestLoan, getConditionBadge }) => {
  const badge = getConditionBadge(item.condition);
  const isAvailable = item.condition === "TERSEDIA" && item.quantity > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight cursor-help"
            title={item.name}
          >
            {item.name?.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
          </h3>
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${badge.color}`}
          >
            {badge.text}
          </span>
        </div>

        {/* Code */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Hash className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <code className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
            {item.code}
          </code>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span 
            className="text-xs text-gray-600 truncate cursor-help"
            title={item.location}
          >
            {item.location?.length > 20 ? `${item.location.substring(0, 20)}...` : item.location}
          </span>
        </div>

        {/* Stock */}
        <div className="mb-3">
          <span className="text-xs text-gray-500">Stok: </span>
          <span className="text-xs font-medium text-gray-900">
            {item.quantity} unit
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onViewDetail(item)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Detail
          </button>

          <button
            onClick={() => onRequestLoan()}
            disabled={!isAvailable}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors ${
              isAvailable
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            {isAvailable ? "Pinjam" : "N/A"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Item Detail Modal Component - Dirapikan
const ItemDetailModal = ({
  item,
  onClose,
  onRequestLoan,
  getConditionBadge,
}) => {
  const badge = getConditionBadge(item.condition);
  const isAvailable = item.condition === "TERSEDIA" && item.quantity > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header Modal dengan Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Detail Barang</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Name & Status */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {item.name}
              </h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}
              >
                {badge.text}
              </span>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Kode Barang
                </label>
                <code className="text-lg text-gray-900 bg-gray-100 px-3 py-1 rounded">
                  {item.code}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Stok Tersedia
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {item.quantity} unit
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Lokasi
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <p className="text-lg text-gray-900">{item.location}</p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Deskripsi
                </label>
                <p className="text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Availability Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {isAvailable ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {isAvailable ? "Tersedia untuk dipinjam" : "Tidak tersedia"}
                </span>
              </div>
              {!isAvailable && (
                <p className="text-sm text-gray-600">
                  Barang sedang tidak tersedia untuk dipinjam saat ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={onRequestLoan}
            disabled={!isAvailable}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isAvailable
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAvailable ? "Ajukan Peminjaman" : "Tidak Tersedia"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loan Form Modal Component - Dirapikan dan Fix Text Color
const LoanFormModal = ({
  item,
  user,
  onClose,
  onSubmit,
  loading,
  getConditionBadge,
}) => {
  const badge = getConditionBadge(item.condition);
  const today = new Date();

  const [loanDate, setLoanDate] = useState(today);
  const [dueDate, setDueDate] = useState(
    new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  );
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");

  const maxDueDate = new Date(loanDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isAvailable = item.condition === "TERSEDIA" && item.quantity > 0;

  const penaltyUntil = user?.penalty_until
    ? new Date(user.penalty_until)
    : null;
  const isUnderPenalty = penaltyUntil && today < penaltyUntil;

  const handleSubmit = () => {
    onSubmit({
      item_id: item.id,
      loan_date: loanDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      quantity,
      purpose,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header Modal dengan Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Konfirmasi Peminjaman
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Item Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Kode:</strong> {item.code}
              </p>
              <p>
                <strong>Lokasi:</strong> {item.location}
              </p>
              <p>
                <strong>Stok:</strong> {item.available_quantity ?? item.quantity} unit
              </p>
              <p>
                <strong>Kondisi:</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
                >
                  {badge.text}
                </span>
              </p>
            </div>
          </div>

          {/* Informasi penalti */}
          {isUnderPenalty && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
              <strong>Peminjaman tidak bisa dilakukan.</strong> Anda sedang
              dalam masa penalti sampai{" "}
              <strong>{penaltyUntil.toLocaleDateString("id-ID")}</strong>.
            </div>
          )}

          {!isUnderPenalty && (
            <>
              {/* Loan Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pinjam
                </label>
                <DatePicker
                  selected={loanDate}
                  onChange={(date) => {
                    setLoanDate(date);
                    if (date > dueDate) {
                      setDueDate(date);
                    }
                  }}
                  minDate={today}
                  dateFormat="dd MMMM yyyy"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Kembali
                </label>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  minDate={loanDate}
                  maxDate={maxDueDate}
                  dateFormat="dd MMMM yyyy"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 7 hari dari tanggal pinjam
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Unit
                </label>
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keperluan
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={3}
                  placeholder="Jelaskan keperluan peminjaman Anda"
                ></textarea>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>

          {!isUnderPenalty && (
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !loanDate ||
                !dueDate ||
                quantity < 1 ||
                quantity > item.quantity ||
                purpose.trim() === ""
              }
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Mengajukan..." : "Ajukan Peminjaman"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;