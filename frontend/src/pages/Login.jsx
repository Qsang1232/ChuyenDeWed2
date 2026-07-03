import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('username', username);
      localStorage.setItem('role', res.data.role);
      
      // Dispatch an event so Navbar can update
      window.dispatchEvent(new Event('authChange'));
      
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
          <span className="text-xl">←</span> Về trang chủ
        </Link>
      </div>
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            required
          />
          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 mt-2">
            Đăng nhập
          </button>
        </form>
        <p className="text-slate-400 text-center mt-6">
          Chưa có tài khoản? <Link to="/register" className="text-emerald-400 font-semibold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
