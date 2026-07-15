import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { level: 1, label: 'Yếu', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Khá', color: 'bg-yellow-400' };
    if (score <= 4) return { level: 4, label: 'Mạnh', color: 'bg-emerald-400' };
    return { level: 5, label: 'Rất mạnh', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Mật khẩu phải từ 6 ký tự, gồm ít nhất 1 chữ cái và 1 số.');
      return;
    }
    if (phone && !/^0\d{9}$/.test(phone)) {
      toast.error('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', { 
        username, email, password, role: 'USER',
        fullName: fullName || null,
        phone: phone || null,
        address: address || null
      });
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error('Đăng ký thất bại: ' + (error.response?.data?.message || error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="w-full max-w-lg mb-4 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
          <span className="text-xl">←</span> Về trang chủ
        </Link>
      </div>
      <div className="glass p-8 rounded-2xl w-full max-w-lg mx-4">
        <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Tạo tài khoản</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">Tham gia Kicks VN để mua sắm dễ dàng hơn</p>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          {/* Account Info Section */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs font-black">1</span>
              Thông tin tài khoản
            </h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Tên đăng nhập (3-50 ký tự)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                required
                minLength={3}
                maxLength={50}
              />
              <input 
                type="email" 
                placeholder="Email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
              {/* Password with toggle */}
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password Strength Bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                    Độ mạnh: {strength.label}
                  </p>
                </div>
              )}
              {/* Confirm password with toggle */}
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Nhập lại mật khẩu" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pr-12"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-lg"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-400 font-semibold">⚠ Mật khẩu không khớp</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Personal Info Section */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs font-black">2</span>
              Thông tin cá nhân <span className="text-slate-500 font-normal normal-case">(không bắt buộc)</span>
            </h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Họ và tên" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
              <input 
                type="tel" 
                placeholder="Số điện thoại (VD: 0912345678)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                maxLength={10}
              />
              <input 
                type="text" 
                placeholder="Địa chỉ giao hàng" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-2 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Tạo tài khoản'
            )}
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
