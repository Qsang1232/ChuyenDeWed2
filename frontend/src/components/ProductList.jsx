import React from 'react';
import ProductCard from './ProductCard';

function ProductList({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-6xl mb-4">📭</span>
        <p className="text-lg">Chưa có sản phẩm nào. Hãy thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </div>
  );
}

export default ProductList;
