import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const { imageUrl, name, description, brand, basePrice, isFeatured, salesCount, category, stockQuantityMen, stockQuantityWomen } = product;
  const productId = product.id || product._id;
  const totalStock = (stockQuantityMen || 0) + (stockQuantityWomen || 0);
  const isOutOfStock = totalStock === 0;

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8900${url}`;
  };

  return (
    <div className={`glass-card group relative flex flex-col overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`}>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
        {isOutOfStock && (
          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-red-500/40 animate-pulse">
            Hết hàng
          </span>
        )}
        {isFeatured && (
          <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30">
            Nổi bật
          </span>
        )}
        {salesCount > 100 && (
          <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-rose-500/30">
            Bán chạy
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/product/${productId}`} className="relative h-56 bg-black/40 overflow-hidden block">
        {imageUrl ? (
          <img 
            src={getImageSrc(imageUrl)} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'; 
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            👟
          </div>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-lg font-black text-red-400 uppercase tracking-widest drop-shadow-lg">Hết hàng</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1 flex-wrap">
          <div className="flex items-center gap-2">
            {brand && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {brand}
              </span>
            )}
            {category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-400">
                {category}
              </span>
            )}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
              <span>⭐</span>
              <span>{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <Link to={`/product/${productId}`}>
          <h3 className="text-lg font-extrabold text-white leading-tight mb-2 hover:text-emerald-400 transition-colors">
            {name}
          </h3>
        </Link>
        {description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {description}
          </p>
        )}
        <div className="mt-auto">
          <div className="text-xl font-black text-emerald-400 mb-4 drop-shadow-md">
            {basePrice ? basePrice.toLocaleString() : 0}đ
          </div>
          <Link 
            to={`/product/${productId}`}
            className="w-full flex items-center justify-center py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:border-transparent hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
          >
            MUA NGAY
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
