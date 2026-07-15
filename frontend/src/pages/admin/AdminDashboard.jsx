import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0, categories: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/all'),
        api.get('/categories'),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;
      const categories = categoriesRes.data;
      const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pending = orders.filter(o => o.status === 'PENDING').length;

      setStats({
        products: products.length,
        orders: orders.length,
        revenue,
        pending,
        categories: categories.length,
      });

      // Get 5 most recent orders
      setRecentOrders(orders.slice(-5).reverse());
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'text-yellow-400 bg-yellow-500/10',
      'CONFIRMED': 'text-blue-400 bg-blue-500/10',
      'SHIPPED': 'text-purple-400 bg-purple-500/10',
      'COMPLETED': 'text-emerald-400 bg-emerald-500/10',
      'CANCELLED': 'text-red-400 bg-red-500/10',
    };
    return styles[status] || 'text-gray-400 bg-gray-500/10';
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
      <h1 className="text-3xl font-black text-white mb-8">📊 Tổng quan hệ thống</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💰</div>
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tổng doanh thu</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
            {stats.revenue.toLocaleString()}đ
          </h3>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧾</div>
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tổng đơn hàng</p>
          <h3 className="text-3xl font-black text-white mt-1">{stats.orders}</h3>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Sản phẩm</p>
          <h3 className="text-3xl font-black text-white mt-1">{stats.products}</h3>
        </div>

        <Link to="/admin/categories" className="glass p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏷️</div>
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Danh mục</p>
          <h3 className="text-3xl font-black text-purple-400 mt-1">{stats.categories}</h3>
        </Link>

        <div className="glass p-6 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⏳</div>
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Chờ xử lý</p>
          <h3 className="text-3xl font-black text-yellow-400 mt-1">{stats.pending}</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/admin/products" className="glass p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-4 group">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📦</div>
          <div>
            <h3 className="text-white font-bold text-lg">Quản lý sản phẩm</h3>
            <p className="text-slate-500 text-sm">Thêm, sửa, xóa sản phẩm giày</p>
          </div>
        </Link>
        <Link to="/admin/categories" className="glass p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all flex items-center gap-4 group">
          <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏷️</div>
          <div>
            <h3 className="text-white font-bold text-lg">Quản lý danh mục</h3>
            <p className="text-slate-500 text-sm">Thêm, sửa, xóa danh mục sản phẩm</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="glass p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all flex items-center gap-4 group">
          <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🧾</div>
          <div>
            <h3 className="text-white font-bold text-lg">Quản lý đơn hàng</h3>
            <p className="text-slate-500 text-sm">Xem và cập nhật trạng thái đơn</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">🕐 Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors">
            Xem tất cả →
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-4 text-slate-400 text-sm font-semibold">Mã đơn</th>
              <th className="text-left p-4 text-slate-400 text-sm font-semibold">Tổng tiền</th>
              <th className="text-left p-4 text-slate-400 text-sm font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-mono text-sm">#{order.id} — {order.orderCode?.substring(0, 8)}...</td>
                <td className="p-4 text-emerald-400 font-bold">{order.totalAmount?.toLocaleString()}đ</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan="3" className="text-center py-8 text-slate-500">Chưa có đơn hàng nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
