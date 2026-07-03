import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (e) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
      fetchOrders();
    } catch (e) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'CONFIRMED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'SHIPPED': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'COMPLETED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'CANCELLED': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <h1 className="text-3xl font-black text-white">🧾 Quản lý Đơn hàng</h1>
        <div className="text-slate-400 text-sm">Tổng: {orders.length} đơn hàng</div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">ID</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Mã đơn</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">User ID</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Tổng tiền</th>
              <th className="text-left p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Trạng thái</th>
              <th className="text-right p-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-slate-500 font-mono text-sm">#{order.id}</td>
                <td className="p-4 text-white font-mono text-sm">{order.orderCode?.substring(0, 8)}...</td>
                <td className="p-4 text-slate-400">{order.userId || '—'}</td>
                <td className="p-4 text-emerald-400 font-bold">{order.totalAmount?.toLocaleString()}đ</td>
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-slate-500">Chưa có đơn hàng nào.</div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
