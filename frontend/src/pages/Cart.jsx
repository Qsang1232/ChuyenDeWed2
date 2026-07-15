import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function Cart() {
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

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
            productId: item.productId || item.id,
            name: item.name,
            price: item.basePrice || item.price,
            gender: item.gender,
            size: item.size,
            quantity: item.quantity || 1
          }).catch(() => {});
        }
      }

      const response = await api.post('/orders/checkout', { 
        shippingInfo, 
        couponCode: appliedCoupon ? appliedCoupon.code : null 
      });
      const orderCode = response.data.orderCode;
      const amount = response.data.totalAmount;

      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Đang chuyển hướng sang trang thanh toán VNPay...');
      
      try {
        const paymentRes = await api.get(`/payment/create?amount=${amount}&orderCode=${orderCode}`);
        if (paymentRes.data && paymentRes.data.url) {
          window.location.href = paymentRes.data.url;
          return;
        }
      } catch (paymentErr) {
        console.error('Lỗi lấy URL thanh toán', paymentErr);
      }

      // Fallback redirect if payment fails
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Lỗi khi đặt hàng', error);
      let backendMessage = error.response?.data;
      if (backendMessage && typeof backendMessage === 'object' && backendMessage.message) {
        backendMessage = backendMessage.message;
      }
      if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
        alert(backendMessage);
        toast.error(backendMessage);
      } else {
        alert('Đặt hàng thất bại. Vui lòng thử lại.');
        toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
      }
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

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    const newQuantity = (newCart[index].quantity || 1) + delta;
    if (newQuantity < 1) return;
    if (newCart[index].maxStock && newQuantity > newCart[index].maxStock) {
      toast.error(`Số lượng tối đa có thể đặt là ${newCart[index].maxStock}`);
      return;
    }
    newCart[index].quantity = newQuantity;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeCartItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + ((item.price || item.basePrice || 0) * (item.quantity || 1)), 0);
  
  const discountAmount = appliedCoupon 
    ? Math.min(total * (appliedCoupon.discountPercentage / 100), appliedCoupon.maxDiscount || Infinity) 
    : 0;
  
  const finalTotal = total - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await api.get(`/orders/coupons/${couponCode.trim()}`);
      setAppliedCoupon(res.data);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.response?.data || 'Mã giảm giá không hợp lệ');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

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
                <div key={item.productId || item.id || index} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center text-2xl">👟</div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <div className="text-sm text-slate-400">Mã: {item.productId || item.id}</div>
                      {item.size && <div className="text-sm text-slate-400">Phân loại: Size {item.size} - {item.gender === 'Men' ? 'Nam' : 'Nữ'}</div>}
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(index, -1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-l-lg transition-colors"
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-white font-semibold text-sm">
                            {item.quantity || 1}
                          </span>
                          <button 
                            onClick={() => updateQuantity(index, 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-r-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeCartItem(index)}
                          className="text-red-400 text-sm hover:text-red-300 transition-colors underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {((item.price || item.basePrice || 0) * (item.quantity || 1)).toLocaleString()}đ
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
            
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-end gap-6">
              
              {/* Coupon Section */}
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-bold text-white mb-4">🎟 Mã giảm giá</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:outline-none transition-colors uppercase"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <button 
                      onClick={handleRemoveCoupon}
                      className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/40 transition-colors"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {applyingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-emerald-400 text-sm mt-2">
                    ✅ Đã áp dụng giảm {appliedCoupon.discountPercentage}% (Tối đa {appliedCoupon.maxDiscount.toLocaleString()}đ)
                  </p>
                )}
              </div>

              <div className="text-right w-full md:w-auto">
                <div className="text-lg text-slate-400 mb-2">
                  Tạm tính: <span>{total.toLocaleString()}đ</span>
                </div>
                {appliedCoupon && (
                  <div className="text-lg text-emerald-400 mb-2 font-semibold">
                    Giảm giá: <span>-{discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <h3 className="text-2xl text-slate-300 mb-6">
                  Tổng thanh toán: <span className="text-4xl font-bold text-emerald-400 ml-2">{Math.max(0, finalTotal).toLocaleString()}đ</span>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
