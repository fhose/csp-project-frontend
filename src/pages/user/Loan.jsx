// src/pages/Loan.jsx
import { useEffect, useState } from 'react';
import apiClient, { showSwal, showValidationErrors } from '../../api/apiClient';


const Loan = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({ loan_date: '', return_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const res = await apiClient.get('/items');
        setItems(res.data);
      } catch (err) {
        console.error('Gagal ambil data items:', err);
        setError('Gagal memuat data barang. Pastikan Anda sudah login.');
        showSwal('Gagal', 'Tidak dapat memuat data barang.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const openLoanForm = (item) => {
    setSelectedItem(item);
    setForm({ loan_date: '', return_date: '', reason: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/loans', {
        item_id: selectedItem.id,
        ...form,
      });
      showSwal('Berhasil', 'Peminjaman berhasil diajukan.', 'success');
      setSelectedItem(null);
    } catch (err) {
      showValidationErrors(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white p-4">Memuat data barang...</div>;

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Daftar Barang Tersedia</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white text-black rounded-xl shadow-md p-4 space-y-2 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-700">Kondisi: {item.condition}</p>
              <p className="text-sm text-gray-700">Stok: {item.stock}</p>
            </div>
            <button
              onClick={() => openLoanForm(item)}
              className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Ajukan Peminjaman
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-full max-w-lg relative">
            <button
              className="absolute top-2 right-4 text-xl font-bold"
              onClick={() => setSelectedItem(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Ajukan Peminjaman: {selectedItem.name}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Pinjam</label>
                <input
                  type="date"
                  required
                  value={form.loan_date}
                  onChange={(e) => setForm({ ...form, loan_date: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Kembali</label>
                <input
                  type="date"
                  required
                  value={form.return_date}
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alasan Peminjaman</label>
                <textarea
                  required
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loan;
