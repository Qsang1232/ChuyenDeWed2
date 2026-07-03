import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import ProductList from '../components/ProductList';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchBrand = filter === 'all' || p.brand?.toLowerCase() === filter;
    const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchTab = true;
    if (activeTab === 'sale') matchTab = p.basePrice < 2000000;
    // Mocks for men/women/collection since we don't have category field in DB yet
    if (activeTab === 'men') matchTab = p.id % 2 === 0;
    if (activeTab === 'women') matchTab = p.id % 2 !== 0;
    
    return matchBrand && matchSearch && matchTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-400">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Đang tải bộ sưu tập... ⚡</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-[#0f111a] z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 mb-6 drop-shadow-2xl">
            STEP INTO THE FUTURE
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 mb-8 font-light">
            Khám phá bộ sưu tập sneaker độc quyền với thiết kế đột phá và công nghệ tiên tiến nhất.
          </p>
          <button className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105">
            KHÁM PHÁ NGAY
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#0a0c14] sticky top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'home', label: 'Trang chủ' },
              { id: 'men', label: 'Nam' },
              { id: 'women', label: 'Nữ' },
              { id: 'collection', label: 'Bộ sưu tập' },
              { id: 'sale', label: 'Sale' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-bold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchQuery && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 font-semibold">
              🔍 Kết quả tìm kiếm cho: "<span className="text-white">{searchQuery}</span>" — Tìm thấy {filteredProducts.length} sản phẩm
            </p>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              {searchQuery ? 'Kết quả tìm kiếm' : 'Bộ sưu tập Mới nhất'}
            </h2>
            <p className="text-slate-400 text-lg">
              {searchQuery ? `Hiển thị kết quả cho "${searchQuery}"` : 'Những mẫu giày hot nhất mùa này.'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            {['all', 'nike', 'adidas', 'puma'].map(b => (
              <button 
                key={b}
                onClick={() => setFilter(b)}
                className={`px-6 py-2 rounded-xl font-bold capitalize transition-all ${
                  filter === b 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {b === 'all' ? 'Tất cả' : b}
              </button>
            ))}
          </div>
        </div>
        
        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
}

export default Home;
