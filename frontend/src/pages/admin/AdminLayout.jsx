import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'ADMIN') {
      toast.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    setUsername(localStorage.getItem('username') || 'Admin');
  }, [navigate]);

  const menuItems = [
    { path: '/admin', label: '📊 Tổng quan', icon: '📊' },
    { path: '/admin/products', label: '📦 Quản lý Sản phẩm', icon: '📦' },
    { path: '/admin/categories', label: '🏷️ Quản lý Danh mục', icon: '🏷️' },
    { path: '/admin/brands', label: '🏭 Quản lý Hãng giày', icon: '🏭' },
    { path: '/admin/orders', label: '🧾 Quản lý Đơn hàng', icon: '🧾' },
    { path: '/admin/users', label: '👥 Quản lý Tài khoản', icon: '👥' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0f17] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            ⚙️ Admin Panel
          </h2>
          <p className="text-slate-500 text-sm mt-1">Xin chào, {username}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                location.pathname === item.path
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            ← Quay lại Trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
