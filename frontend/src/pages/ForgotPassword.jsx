import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Nếu email tồn tại, mật khẩu mới đã được gửi vào email của bạn!');
      setEmail('');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md mb-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
          <span className="text-xl">←</span> Trở lại đăng nhập
        </Link>
      </div>
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Quên mật khẩu</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Nhập email của bạn và chúng tôi sẽ gửi mật khẩu mới cho bạn.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email của bạn" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full mt-2 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Gửi mật khẩu mới'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
