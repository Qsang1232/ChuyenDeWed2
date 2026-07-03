import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, password, role });
      alert('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      alert('Đăng ký thất bại: ' + (error.response?.data || error.message));
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
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Đăng ký</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#151923] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 mt-2">
            Tạo tài khoản
          </button>
        </form>
        <p className="text-slate-400 text-center mt-6">
          Đã có tài khoản? <Link to="/login" className="text-emerald-400 font-semibold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
