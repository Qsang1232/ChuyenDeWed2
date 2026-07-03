import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const { imageUrl, name, description, brand, basePrice } = product;
  const productId = product.id || product._id;

  const getImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8900${url}`;
  };

  return (
    <div className="group relative flex flex-col bg-[#1a1d27] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(16,185,129,0.15)]">
      {/* Product Image */}
      <Link to={`/product/${productId}`} className="relative h-56 bg-black/40 overflow-hidden block">
        {imageUrl ? (
          <img 
            src={getImageSrc(imageUrl)} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            👟
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {brand && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            {brand}
          </span>
        )}
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
          <div className="text-xl font-bold text-emerald-400 mb-4">
            {basePrice ? basePrice.toLocaleString() : 0}đ
          </div>
          <Link 
            to={`/product/${productId}`}
            className="w-full flex items-center justify-center py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold uppercase tracking-wide text-sm transition-all duration-300 hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            👀 Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
