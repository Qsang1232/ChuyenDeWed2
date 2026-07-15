import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse token from URL query string
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Mật khẩu phải từ 6 ký tự, gồm ít nhất 1 chữ cái và 1 số.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold text-rose-500 mb-4">Link khôi phục không hợp lệ</h2>
        <Link to="/forgot-password" className="text-emerald-400 hover:underline">Gửi lại link mới</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Tạo mật khẩu mới</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Mật khẩu mới" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
            required
          />
          <input 
            type="password" 
            placeholder="Nhập lại mật khẩu mới" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full mt-2 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
