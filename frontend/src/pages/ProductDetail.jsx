import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const sizes = [38, 39, 40, 41, 42, 43, 44];

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8900${url}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Vui lòng chọn size trước khi thêm vào giỏ hàng!');
      return;
    }
    
    try {
      const cartItem = {
        productId: product.id?.toString() || product._id,
        name: `${product.name} - Size ${selectedSize}`,
        price: product.basePrice
      };

      await api.post('/orders/cart', cartItem);
      
      // Fallback for UI counter update
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success('Đã thêm vào giỏ hàng thành công!');
    } catch (e) {
      toast.error('Vui lòng đăng nhập trước khi thêm vào giỏ!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-400">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Đang tải thông tin sản phẩm... ⚡</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold text-white mb-4">Không tìm thấy sản phẩm!</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-emerald-500 rounded-lg text-white font-bold hover:bg-emerald-400">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 font-semibold">
        <span className="text-xl">←</span> Về trang chủ
      </Link>
      <div className="glass p-6 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Product Image Section */}
        <div className="relative aspect-square bg-[#0f111a]/50 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 group">
          {product.imageUrl ? (
            <img 
              src={getImageSrc(product.imageUrl)} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="text-9xl">👟</div>
          )}
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col h-full justify-center">
          {product.brand && (
            <div className="text-emerald-400 font-black tracking-widest uppercase text-sm mb-2">
              {product.brand}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
            {product.basePrice?.toLocaleString()}đ
          </div>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </p>

          {/* Size Selector */}
          <div className="mb-10">
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span>📏 Chọn Size</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    selectedSize === size 
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110 border-none' 
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black uppercase tracking-wide hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
