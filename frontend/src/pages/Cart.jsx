import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function Cart() {
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/orders/cart');
        setCart(res.data);
      } catch(e) {
        // Fallback to local storage if not logged in
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
      }
    };
    fetchCart();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.warning('Giỏ hàng trống!');
    
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Bạn cần đăng nhập để đặt hàng!');

    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return toast.warning('Vui lòng điền đầy đủ thông tin giao hàng!');
    }

    setPlacingOrder(true);
    try {
      // Sync localStorage cart lên session backend (nếu có hàng trong localStorage)
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        // Xóa cart session cũ rồi add lại từ localStorage
        await api.delete('/orders/cart').catch(() => {});
        for (const item of localCart) {
          await api.post('/orders/cart', {
            productId: item.id,
            name: item.name,
            price: item.basePrice || item.price
          }).catch(() => {});
        }
      }

      const response = await api.post('/orders/checkout');
      const orderCode = response.data.orderCode;

      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Đặt hàng thành công! Mã đơn: ' + orderCode);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Lỗi khi đặt hàng', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };
  
  const handleClearCart = async () => {
    try {
      await api.delete('/orders/cart');
    } catch(e){}
    localStorage.removeItem('cart');
    setCart([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + (item.price || item.basePrice || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 font-semibold">
        <span className="text-xl">←</span> Về trang chủ
      </Link>
      <div className="glass p-8 rounded-2xl">
        <h2 className="text-3xl font-extrabold text-white mb-8">🛒 Giỏ hàng của bạn</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-lg">
            Giỏ hàng đang trống. Hãy quay lại mua sắm nhé!
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center text-2xl">👟</div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <div className="text-sm text-slate-400">Mã: {item.id}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {(item.price || item.basePrice || 0).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Info Form */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">📍 Thông tin giao hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Họ và tên người nhận" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder="Số điện thoại" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện)" 
                  className="w-full md:col-span-2 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-right">
              <h3 className="text-xl text-slate-300 mb-6">
                Tổng cộng: <span className="text-3xl font-bold text-emerald-400 ml-2">{total.toLocaleString()}đ</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button 
                  className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                  onClick={handleClearCart}
                >
                  🗑 Xóa giỏ hàng
                </button>
                <button 
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout} 
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Đang xử lý...' : '💳 Tiến hành thanh toán'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
