import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (e) {
      console.error('Lỗi khi tải đơn hàng', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      'PENDING': { label: '⏳ Chờ xác nhận', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
      'CONFIRMED': { label: '✅ Đã xác nhận', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      'SHIPPED': { label: '🚚 Đang giao', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
      'COMPLETED': { label: '🎉 Hoàn thành', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      'CANCELLED': { label: '❌ Đã hủy', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    };
    return map[status] || { label: status, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
  };

  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass p-12 rounded-2xl">
          <span className="text-6xl mb-6 block">🔒</span>
          <h2 className="text-3xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
          <p className="text-slate-400 mb-6">Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-400">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 font-semibold">
        <span className="text-xl">←</span> Về trang chủ
      </Link>
      <h2 className="text-3xl font-extrabold text-white mb-8">📜 Lịch sử Đơn hàng</h2>

      {orders.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <span className="text-6xl mb-6 block">📭</span>
          <h3 className="text-2xl font-bold text-white mb-4">Chưa có đơn hàng nào</h3>
          <p className="text-slate-400 mb-6">Hãy mua sắm và đặt đơn hàng đầu tiên của bạn!</p>
          <Link to="/" className="inline-block px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold">Đơn hàng #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-mono">Mã: {order.orderCode}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">
                      {order.totalAmount?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
