import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandRes, prodRes] = await Promise.all([
        api.get('/brands'),
        api.get('/products'),
      ]);
      setBrands(brandRes.data);
      setProducts(prodRes.data);
    } catch (e) {
      toast.error('Lỗi khi tải danh sách hãng giày');
    } finally {
      setLoading(false);
    }
  };

  const getProductCount = (brandName) => {
    return products.filter(p => p.brand === brandName).length;
  };

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
      setForm(prev => ({ ...prev, logoUrl: res.data.url }));
      toast.success('Upload logo thành công!');
    } catch (err) {
      toast.error('Upload logo thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const openCreateForm = () => {
    setEditingBrand(null);
    setForm({ name: '', description: '', logoUrl: '' });
    setShowForm(true);
  };

  const openEditForm = (brand) => {
    setEditingBrand(brand);
    setForm({ 
      name: brand.name || '', 
      description: brand.description || '',
      logoUrl: brand.logoUrl || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, form);
        toast.success('Cập nhật hãng giày thành công!');
      } else {
        await api.post('/brands', form);
        toast.success('Thêm hãng giày mới thành công!');
      }
      setShowForm(false);
      fetchData();
    } catch (e) {
      const msg = e.response?.data || 'Thao tác thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id, name) => {
    const count = getProductCount(name);
    const confirmMsg = count > 0
      ? `Hãng "${name}" đang có ${count} sản phẩm. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa hãng "${name}"?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success('Đã xóa hãng giày!');
      fetchData();
    } catch (e) {
      toast.error('Xóa thất bại.');
    }
  };

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
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
        <h1 className="text-3xl font-black text-white">🏭 Quản lý Hãng giày</h1>
        <button
          onClick={openCreateForm}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        >
          + Thêm hãng mới
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingBrand ? '✏️ Sửa hãng giày' : '➕ Thêm hãng giày mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text" placeholder="Tên hãng (Nike, Adidas...)" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
              
              <div className="space-y-3">
                <label className="text-white font-semibold text-sm block">🖼️ Logo Hãng</label>
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
                {form.logoUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 w-24 h-24 flex items-center justify-center bg-white/5">
                    <img src={getImageSrc(form.logoUrl)} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button type="button" onClick={() => setForm({...form, logoUrl: ''})} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-400">✕</button>
                  </div>
                )}
                <input
                  type="text" placeholder="Hoặc nhập URL hình ảnh"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})}
                />
              </div>

              <textarea
                placeholder="Mô tả hãng (tùy chọn)" rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none resize-none"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              />
              
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all">
                  {editingBrand ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => {
          const count = getProductCount(brand.name);
          return (
            <div key={brand.id} className="glass p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                    {brand.logoUrl ? (
                      <img src={getImageSrc(brand.logoUrl)} alt={brand.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">🏷️</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {brand.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold w-fit">
                      📦 {count} SP
                    </div>
                  </div>
                </div>
              </div>
              {brand.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{brand.description}</p>
              )}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openEditForm(brand)}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-semibold border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(brand.id, brand.name)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                >
                  🗑 Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {brands.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <span className="text-5xl block mb-4">🏭</span>
          Chưa có hãng giày nào. Hãy tạo hãng đầu tiên!
        </div>
      )}
    </div>
  );
}

export default AdminBrands;
