import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import ProductList from '../components/ProductList';

function Home() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=2000",
      title: "STEP INTO THE FUTURE",
      subtitle: "Khám phá bộ sưu tập sneaker độc quyền với thiết kế đột phá và công nghệ tiên tiến nhất."
    },
    {
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=2000",
      title: "RUN FASTER. GO FURTHER.",
      subtitle: "Dòng giày chạy bộ siêu nhẹ, trợ lực tối đa trên mọi nẻo đường."
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000",
      title: "STREETWEAR ICON",
      subtitle: "Phong cách đường phố đậm chất riêng, tự tin thể hiện cá tính."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(0);
  }, [filter, searchQuery]);

  // Fetch static data once
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [featuredRes, bestSellingRes, categoriesRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/best-selling'),
          api.get('/categories')
        ]);
        setFeaturedProducts(featuredRes.data);
        setBestSellingProducts(bestSellingRes.data);
        setCategories(categoriesRes.data.map(c => c.name || c));
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu tĩnh', error);
      }
    };
    fetchStaticData();
  }, []);

  // Fetch paged products
  useEffect(() => {
    const fetchPagedProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/paged', {
          params: { category: filter, search: searchQuery, page: page, size: 8 }
        });
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm phân trang', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPagedProducts();
  }, [searchQuery, filter, page]);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-400">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Đang tải bộ sưu tập... ⚡</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner Slider */}
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-[#0f111a] z-10 transition-opacity duration-1000"></div>
        
        {banners.map((banner, index) => (
          <img 
            key={index}
            src={banner.image}
            alt="" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-80' : 'opacity-0'}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ))}

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 mb-6 drop-shadow-2xl transition-all duration-500 ease-out translate-y-0 opacity-100">
            {banners[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 mb-8 font-light transition-all duration-500 delay-100 ease-out translate-y-0 opacity-100">
            {banners[currentSlide].subtitle}
          </p>
          <button className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105">
            KHÁM PHÁ NGAY
          </button>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-emerald-400 scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      {!searchQuery && featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-8">
            <span className="gradient-text">Sản phẩm nổi bật</span>
          </h2>
          <ProductList products={featuredProducts.slice(0, 4)} />
        </div>
      )}

      {/* Best Selling Products Section */}
      {!searchQuery && bestSellingProducts.length > 0 && (
        <div className="bg-[#12151f] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-8">
              Bán chạy nhất <span className="text-rose-500">🔥</span>
            </h2>
            <ProductList products={bestSellingProducts.slice(0, 4)} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {searchQuery && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 font-semibold">
              🔍 Kết quả tìm kiếm cho: "<span className="text-white">{searchQuery}</span>"
            </p>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              {searchQuery ? 'Kết quả tìm kiếm' : 'Tất cả sản phẩm'}
            </h2>
            <p className="text-slate-400 text-lg">
              {searchQuery ? `Hiển thị kết quả cho "${searchQuery}"` : 'Khám phá toàn bộ bộ sưu tập.'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-xl font-bold capitalize transition-all ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Tất cả
            </button>
            {categories.map(c => (
              <button 
                key={c}
                onClick={() => setFilter(c)}
                className={`px-6 py-2 rounded-xl font-bold capitalize transition-all ${
                  filter === c 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <ProductList products={products} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  &larr; Trước
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      page === i 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  Sau &rarr;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 glass rounded-2xl">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy sản phẩm nào!</h3>
            <p className="text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
