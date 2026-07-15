import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const MEN_SIZES = [39, 40, 41, 42, 43, 44, 45];
const WOMEN_SIZES = [35, 36, 37, 38, 39, 40, 41];
const MAX_STOCK = 200; // For progress bar scaling

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const sizes = selectedGender === 'Men' ? MEN_SIZES : WOMEN_SIZES;
  const currentStock = product 
    ? (selectedGender === 'Men' ? product.stockQuantityMen : product.stockQuantityWomen) || 0
    : 0;
  const totalStock = product 
    ? ((product.stockQuantityMen || 0) + (product.stockQuantityWomen || 0))
    : 0;

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8900${url}`;
  };

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`).catch(() => ({ data: [] }))
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      toast.error('Vui lòng đăng nhập để đánh giá!');
      return;
    }
    setSubmittingReview(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const payload = {
        ...newReview,
        username: userObj?.username || userObj?.email || 'Khách hàng'
      };

      const res = await api.post(`/products/${id}/reviews`, payload);
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Gửi đánh giá thành công!');
      
      // Update local product average rating
      setProduct(prev => ({
        ...prev,
        reviewCount: (prev.reviewCount || 0) + 1,
        averageRating: ((prev.averageRating || 0) * (prev.reviewCount || 0) + payload.rating) / ((prev.reviewCount || 0) + 1)
      }));
    } catch (error) {
      toast.error('Không thể gửi đánh giá!');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setSelectedSize(null); // Reset size when changing gender
    setQuantity(1); // Reset quantity
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Vui lòng chọn size trước khi thêm vào giỏ hàng!');
      return;
    }
    if (currentStock <= 0) {
      toast.error('Sản phẩm này đã hết hàng cho phân loại được chọn!');
      return;
    }
    
    // Kiểm tra số lượng hiện tại trong giỏ hàng để tránh vượt quá tồn kho
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex(
      item => (item.productId === product.id?.toString() || item.productId === product._id || item.id === product.id) &&
              item.size === selectedSize &&
              item.gender === selectedGender
    );
    const existingQuantity = existingItemIndex >= 0 ? (cart[existingItemIndex].quantity || 1) : 0;
    
    if (existingQuantity + quantity > currentStock) {
      toast.error(`Không thể thêm. Bạn đã có ${existingQuantity} sản phẩm trong giỏ, tồn kho chỉ còn ${currentStock}.`);
      return;
    }
    
    try {
      const cartItem = {
        productId: product.id?.toString() || product._id,
        name: `${product.name} - Size ${selectedSize} (${selectedGender === 'Men' ? 'Nam' : 'Nữ'})`,
        price: product.basePrice,
        gender: selectedGender,
        size: selectedSize,
        quantity: quantity,
        maxStock: currentStock
      };

      await api.post('/orders/cart', cartItem);
      
      // Fallback for UI counter update
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
      } else {
        cart.push(cartItem);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success('Đã thêm vào giỏ hàng thành công!');
    } catch (e) {
      if (e.response?.status === 401 || !localStorage.getItem('token')) {
        toast.error('Vui lòng đăng nhập trước khi thêm vào giỏ!');
      } else {
        toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
      }
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
      <div className="glass p-6 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Image Section */}
        <div className="relative aspect-square bg-[#0f111a]/50 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 group sticky top-24">
          {product.imageUrl ? (
            <img 
              src={getImageSrc(product.imageUrl)} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'; 
              }}
            />
          ) : (
            <div className="text-9xl">👟</div>
          )}
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent mix-blend-overlay pointer-events-none"></div>
          {/* Out of Stock Overlay */}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-2xl font-black text-red-400 uppercase tracking-widest">Hết hàng</span>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {product.brand && (
              <span className="text-emerald-400 font-black tracking-widest uppercase text-sm">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-slate-300 font-semibold">
                {product.category}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
            {product.basePrice?.toLocaleString()}đ
          </div>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </p>

          {/* Total Stock Summary */}
          <div className="glass p-5 rounded-2xl mb-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              📊 Tồn kho tổng
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Men Stock */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-400 font-semibold">👨 Nam</span>
                  <span className={`text-sm font-bold ${(product.stockQuantityMen || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {product.stockQuantityMen || 0}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((product.stockQuantityMen || 0) / MAX_STOCK) * 100)}%` }}
                  />
                </div>
              </div>
              {/* Women Stock */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-400 font-semibold">👩 Nữ</span>
                  <span className={`text-sm font-bold ${(product.stockQuantityWomen || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {product.stockQuantityWomen || 0}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((product.stockQuantityWomen || 0) / MAX_STOCK) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <span className="text-slate-400 text-sm">Tổng: </span>
              <span className={`text-lg font-black ${totalStock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalStock}
              </span>
              <span className="text-slate-400 text-sm"> sản phẩm</span>
            </div>
          </div>

          {/* Gender Selector */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span>🚻 Chọn Giới Tính</span>
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleGenderChange('Men')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${
                  selectedGender === 'Men' 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                👨 Nam
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedGender === 'Men' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  Size {MEN_SIZES[0]}-{MEN_SIZES[MEN_SIZES.length-1]}
                </span>
              </button>
              <button
                onClick={() => handleGenderChange('Women')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${
                  selectedGender === 'Women' 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                👩 Nữ
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedGender === 'Women' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  Size {WOMEN_SIZES[0]}-{WOMEN_SIZES[WOMEN_SIZES.length-1]}
                </span>
              </button>
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-10">
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span>📏 Chọn Size ({selectedGender === 'Men' ? 'Nam' : 'Nữ'})</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={currentStock <= 0}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    selectedSize === size 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg scale-110 border-none' 
                      : currentStock <= 0
                        ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {/* Stock Display for selected gender */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Tồn kho ({selectedGender === 'Men' ? 'Nam' : 'Nữ'}):</span>
              <span className={`font-bold ${currentStock > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {currentStock > 0 ? `${currentStock} sản phẩm` : '❌ Hết hàng'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-white font-bold uppercase tracking-wider text-sm">Số lượng:</span>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={currentStock <= 0}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-12 text-center text-white font-bold">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={currentStock <= 0 || quantity >= currentStock}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-wide transition-all duration-300 ${
                  currentStock > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                }`}
              >
                {currentStock > 0 ? '🛒 Thêm vào giỏ hàng' : '❌ Hết hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
          <span>💬</span> Đánh giá từ khách hàng ({product.reviewCount || 0})
        </h2>
        
        {/* Add Review Form */}
        <div className="glass p-6 md:p-8 rounded-3xl mb-12">
          <h3 className="text-xl font-bold text-white mb-6">Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-6">
              <label className="block text-slate-400 mb-2 font-semibold">Chất lượng sản phẩm:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span className={star <= newReview.rating ? 'text-yellow-400' : 'text-slate-600 grayscale opacity-50'}>
                      ⭐
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-slate-400 mb-2 font-semibold">Nhận xét chi tiết:</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
                rows="4"
                className="w-full bg-[#0f111a]/50 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-all"
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
              />
            </div>
            
            <button
              type="submit"
              disabled={submittingReview}
              className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submittingReview ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-white/5">
              <span className="text-4xl mb-4 block">✨</span>
              <p className="text-slate-400 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{review.username || 'Người dùng ẩn danh'}</h4>
                      <div className="flex items-center gap-1 text-sm mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-600 grayscale opacity-40'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-slate-500 text-sm font-medium">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-13">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
