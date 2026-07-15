import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const currentUser = localStorage.getItem('username');

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const fetchUsers = async (pageIndex = 0, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await api.get('/users/admin', {
        params: { page: pageIndex, size: 10, search: searchQuery }
      });
      // Handle both Page<User> (res.data.content) and List<User> (res.data) in case backend hasn't updated yet
      if (res.data.content !== undefined) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        setUsers(res.data);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers(0, search);
  };

  const toggleRole = async (user) => {
    if (user.username === currentUser) {
      toast.warning('Bạn không thể tự thay đổi quyền của chính mình!');
      return;
    }
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Bạn có chắc muốn cấp quyền ${newRole} cho tài khoản ${user.username}?`)) return;

    try {
      await api.put(`/users/admin/${user.id}/role`, { role: newRole });
      toast.success('Cập nhật quyền thành công!');
      fetchUsers(page, search);
    } catch (error) {
      toast.error(error.response?.data || 'Lỗi khi cập nhật quyền!');
    }
  };

  const toggleStatus = async (user) => {
    if (user.username === currentUser) {
      toast.warning('Bạn không thể tự khoá tài khoản của chính mình!');
      return;
    }
    const action = user.isActive === false ? 'MỞ KHOÁ' : 'KHOÁ';
    if (!window.confirm(`XÁC NHẬN: Bạn muốn ${action} tài khoản ${user.username}?`)) return;

    try {
      await api.put(`/users/admin/${user.id}/status`);
      toast.success(`Đã ${action.toLowerCase()} tài khoản thành công!`);
      fetchUsers(page, search);
    } catch (error) {
      toast.error(error.response?.data || 'Lỗi khi thay đổi trạng thái!');
    }
  };

  const viewDetails = async (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    try {
      const res = await api.get(`/orders/user/${user.id}`);
      setUserOrders(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử đơn hàng!');
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="text-white relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">👥 Quản lý Tài khoản</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Tìm kiếm tài khoản..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500 min-w-[250px]"
          />
          <button type="submit" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors">
            Tìm
          </button>
        </form>
      </div>
      
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-slate-300 font-semibold">ID</th>
                <th className="p-4 text-slate-300 font-semibold">Tài khoản</th>
                <th className="p-4 text-slate-300 font-semibold">Quyền</th>
                <th className="p-4 text-slate-300 font-semibold text-center">Trạng thái</th>
                <th className="p-4 text-slate-300 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Đang tải...</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-emerald-400">
                      {user.username} {user.username === currentUser && '(Bạn)'}
                    </div>
                    <div className="text-sm text-slate-400">{user.email || 'No email'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {user.isActive === false ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold">BỊ KHOÁ</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold">HOẠT ĐỘNG</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button 
                      onClick={() => viewDetails(user)}
                      className="px-3 py-1.5 bg-slate-500/20 text-slate-300 hover:bg-slate-500/40 rounded transition-colors text-sm font-semibold"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => toggleRole(user)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition-colors text-sm font-semibold"
                    >
                      {user.role === 'ADMIN' ? 'Set USER' : 'Set ADMIN'}
                    </button>
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={`px-3 py-1.5 rounded transition-colors text-sm font-semibold ${
                        user.isActive === false 
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' 
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                      }`}
                    >
                      {user.isActive === false ? 'Mở khoá' : 'Khoá'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Không tìm thấy tài khoản nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
            >
              Trang trước
            </button>
            <span className="px-3 py-1 text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <button 
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Modal User Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1d2d] rounded-2xl border border-white/10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-amber-400">Chi tiết Tài khoản: {selectedUser.username}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-sm text-slate-400">Họ tên</p>
                  <p className="font-semibold">{selectedUser.fullName || '---'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-semibold">{selectedUser.email || '---'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Số điện thoại</p>
                  <p className="font-semibold">{selectedUser.phone || '---'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Địa chỉ</p>
                  <p className="font-semibold">{selectedUser.address || '---'}</p>
                </div>
              </div>

              <h4 className="text-lg font-bold mb-4">Lịch sử Đơn hàng</h4>
              {loadingOrders ? (
                <div className="text-center py-4">Đang tải đơn hàng...</div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.map(order => (
                    <div key={order.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-amber-500 font-bold">{order.orderCode}</span>
                        <span className={`px-2 py-1 text-xs rounded font-bold ${
                          order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                          order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                      <p className="font-bold text-emerald-400">Tổng tiền: ${order.totalAmount}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-4 bg-white/5 rounded-xl">
                  Chưa có đơn hàng nào.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
