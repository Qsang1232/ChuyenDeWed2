import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#0a0c14] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">👟</span>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Kicks VN
              </h2>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Nền tảng mua sắm giày sneaker hàng đầu Việt Nam. Cam kết 100% chính hãng với chính sách đổi trả linh hoạt.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Trang chủ</Link></li>
              <li><Link to="/cart" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Giỏ hàng</Link></li>
              <li><Link to="/my-orders" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Đơn hàng của tôi</Link></li>
              <li><Link to="/login" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Đăng nhập</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Chính sách</h3>
            <ul className="space-y-3">
              <li><span className="text-slate-500 text-sm">🔄 Đổi trả trong 30 ngày</span></li>
              <li><span className="text-slate-500 text-sm">🛡️ Bảo hành 12 tháng</span></li>
              <li><span className="text-slate-500 text-sm">🚚 Miễn phí vận chuyển đơn &gt; 1 triệu</span></li>
              <li><span className="text-slate-500 text-sm">💯 Cam kết chính hãng 100%</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="text-slate-500 text-sm flex items-center gap-2">📧 contact@kicksvn.com</li>
              <li className="text-slate-500 text-sm flex items-center gap-2">📞 1900-xxxx-xx</li>
              <li className="text-slate-500 text-sm flex items-center gap-2">📍 TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">f</a>
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">ig</a>
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">yt</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">© 2026 Kicks VN. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <span>💳 VISA</span>
            <span>💳 MasterCard</span>
            <span>💳 Momo</span>
            <span>💳 ZaloPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
