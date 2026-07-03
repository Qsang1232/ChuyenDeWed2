import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken: 'dummy' });
    } catch(e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#0f111a]/80 backdrop-blur-lg border-b border-white/10 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl">👟</span>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all">
            Kicks VN
          </h1>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm giày..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors">
              🔍
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {token && (
            <Link to="/my-orders" className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
              📜 Đơn hàng
            </Link>
          )}

          <Link to="/cart" className="relative group">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <span className="text-lg">🛒</span>
              <span className="font-semibold text-white hidden sm:inline">Giỏ hàng</span>
            </div>
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f111a] shadow-lg animate-bounce">
                {cartCount}
              </div>
            )}
          </Link>

          {token ? (
            <div className="flex items-center gap-2">
              {role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-sm"
                >
                  ⚙️ Admin
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-5 py-2 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

