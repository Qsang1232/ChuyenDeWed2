import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', basePrice: '', description: '', imageUrl: '' });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success('Upload ảnh thành công!');
    } catch (err) {
      toast.error('Upload ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({ name: '', brand: '', basePrice: '', description: '', imageUrl: '' });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      brand: product.brand || '',
      basePrice: product.basePrice?.toString() || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, basePrice: parseFloat(form.basePrice) };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', payload);
        toast.success('Thêm sản phẩm mới thành công!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (e) {
      toast.error('Thao tác thất bại. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Đã xóa sản phẩm!');
      fetchProducts();
    } catch (e) {
      toast.error('Xóa thất bại.');
    }
  };

  // Helper: chuẩn hóa URL ảnh (từ upload service hoặc URL ngoài)
  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Relative path từ file upload (/api/uploads/...) → thêm gateway host
    return `http://localhost:8900${url}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-400">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">📦 Quản lý Sản phẩm</h1>
        <button
          onClick={openCreateForm}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        >
          + Thêm sản phẩm mới
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text" placeholder="Tên sản phẩm" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
              <input
                type="text" placeholder="Thương hiệu (Nike, Adidas...)"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
                value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
              />
              <input
                type="number" placeholder="Giá (VNĐ)" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
                value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})}
              />

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-white font-semibold text-sm block">📸 Hình ảnh sản phẩm</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-slate-400 cursor-pointer hover:border-emerald-500 hover:text-emerald-400 transition-all">
                    <span>📁 Chọn ảnh từ máy</span>
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải ảnh lên...
                  </div>
                )}
                {form.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={getImageSrc(form.imageUrl)} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setForm({...form, imageUrl: ''})} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-400">✕</button>
                  </div>
                )}
                <input
                  type="text" placeholder="Hoặc nhập URL hình ảnh"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                />
              </div>

              <textarea
                placeholder="Mô tả sản phẩm" rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none resize-none"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              />
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all">
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Ảnh</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Tên</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Thương hiệu</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Giá</th>
              <th className="text-right p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  {product.imageUrl ? (
                    <img src={getImageSrc(product.imageUrl)} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-xl">👟</div>
                  )}
                </td>
                <td className="p-4 text-white font-semibold">{product.name}</td>
                <td className="p-4 text-slate-400">{product.brand || '—'}</td>
                <td className="p-4 text-emerald-400 font-bold">{product.basePrice?.toLocaleString()}đ</td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEditForm(product)}
                      className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-semibold border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      🗑 Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-slate-500">Chưa có sản phẩm nào.</div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
