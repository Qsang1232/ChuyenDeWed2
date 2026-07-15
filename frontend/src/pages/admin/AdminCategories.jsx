import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (e) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name || '', description: category.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', form);
        toast.success('Thêm danh mục mới thành công!');
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
      ? `Danh mục "${name}" đang có ${count} sản phẩm. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa danh mục "${name}"?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Đã xóa danh mục!');
      fetchData();
    } catch (e) {
      toast.error('Xóa thất bại.');
    }
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
        <h1 className="text-3xl font-black text-white">🏷️ Quản lý Danh mục</h1>
        <button
          onClick={openCreateForm}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        >
          + Thêm danh mục mới
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCategory ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text" placeholder="Tên danh mục" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
              <textarea
                placeholder="Mô tả danh mục (tùy chọn)" rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none resize-none"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              />
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all">
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const count = getProductCount(cat.name);
          return (
            <div key={cat.id} className="glass p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold">
                  📦 {count}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openEditForm(cat)}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-semibold border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                >
                  🗑 Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <span className="text-5xl block mb-4">🏷️</span>
          Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
