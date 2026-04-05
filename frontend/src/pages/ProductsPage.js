// ============================================
// Trang Danh sách sản phẩm (Shop)
// File: frontend/src/pages/ProductsPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import '../assets/css/Products.css';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Lấy bộ lọc từ URL
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    material: searchParams.get('material') || '',
    stone: searchParams.get('stone') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || 1,
  });

  const materials = [
    { code: 'GOLD_24K', name: 'Vàng 24K' },
    { code: 'GOLD_18K', name: 'Vàng 18K' },
    { code: 'GOLD_14K', name: 'Vàng 14K' },
    { code: 'WHITE_GOLD_18K', name: 'Vàng trắng 18K' },
    { code: 'SILVER_925', name: 'Bạc 925' },
    { code: 'PLATINUM', name: 'Bạch kim' },
    { code: 'ROSE_GOLD_18K', name: 'Vàng hồng 18K' },
  ];

  const stones = [
    { code: 'DIAMOND', name: 'Kim cương' },
    { code: 'RUBY', name: 'Ruby' },
    { code: 'SAPPHIRE', name: 'Sapphire' },
    { code: 'EMERALD', name: 'Ngọc lục bảo' },
    { code: 'PEARL', name: 'Ngọc trai' },
    { code: 'TOPAZ', name: 'Topaz' },
  ];

  const priceRanges = [
    { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
    { label: '10 - 30 triệu', min: 10000000, max: 30000000 },
    { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
    { label: '50 - 100 triệu', min: 50000000, max: 100000000 },
    { label: 'Trên 100 triệu', min: 100000000, max: '' },
  ];

  // Lấy danh mục
  useEffect(() => {
    categoryAPI.getAll().then(data => setCategories(data)).catch(console.error);
  }, []);

  // Lấy sản phẩm khi bộ lọc thay đổi
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category) params.append('category', filters.category);
      if (filters.material) params.append('material', filters.material);
      if (filters.stone) params.append('stone', filters.stone);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 12);

      const data = await productAPI.getAll(params.toString());
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Cập nhật URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const handlePriceRange = (min, max) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max, page: 1 };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const newFilters = { keyword: '', category: '', material: '', stone: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 };
    setFilters(newFilters);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-inner">
          <h1>Bộ sưu tập trang sức</h1>
          <p>Khám phá vẻ đẹp vĩnh cửu từ những viên đá quý và kim loại quý</p>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar bộ lọc */}
        <aside className="products-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Tìm kiếm</h3>
            <input
              type="text"
              className="filter-search"
              placeholder="Tìm tên sản phẩm..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Danh mục</h3>
            <div className="filter-list">
              <label className="filter-item">
                <input type="radio" name="category" checked={!filters.category} onChange={() => handleFilterChange('category', '')} />
                <span>Tất cả</span>
              </label>
              {categories.map(cat => (
                <label className="filter-item" key={cat.id}>
                  <input type="radio" name="category" checked={filters.category === cat.slug} onChange={() => handleFilterChange('category', cat.slug)} />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Chất liệu</h3>
            <div className="filter-list">
              <label className="filter-item">
                <input type="radio" name="material" checked={!filters.material} onChange={() => handleFilterChange('material', '')} />
                <span>Tất cả</span>
              </label>
              {materials.map(m => (
                <label className="filter-item" key={m.code}>
                  <input type="radio" name="material" checked={filters.material === m.code} onChange={() => handleFilterChange('material', m.code)} />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Loại đá quý</h3>
            <div className="filter-list">
              <label className="filter-item">
                <input type="radio" name="stone" checked={!filters.stone} onChange={() => handleFilterChange('stone', '')} />
                <span>Tất cả</span>
              </label>
              {stones.map(s => (
                <label className="filter-item" key={s.code}>
                  <input type="radio" name="stone" checked={filters.stone === s.code} onChange={() => handleFilterChange('stone', s.code)} />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Khoảng giá</h3>
            <div className="filter-list">
              <label className="filter-item">
                <input type="radio" name="price" checked={!filters.minPrice && !filters.maxPrice} onChange={() => handlePriceRange('', '')} />
                <span>Tất cả</span>
              </label>
              {priceRanges.map((range, i) => (
                <label className="filter-item" key={i}>
                  <input type="radio" name="price" checked={filters.minPrice === String(range.min) && filters.maxPrice === String(range.max)} onChange={() => handlePriceRange(String(range.min), String(range.max))} />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="filter-clear" onClick={clearFilters}>Xóa bộ lọc</button>
        </aside>

        {/* Danh sách sản phẩm */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="products-count">
              Hiển thị <strong>{products.length}</strong> / {pagination.total} sản phẩm
            </div>
            <select className="products-sort" value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="bestseller">Bán chạy nhất</option>
              <option value="popular">Xem nhiều nhất</option>
            </select>
          </div>

          {/* Grid sản phẩm */}
          {loading ? (
            <div className="products-loading">Đang tải sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button className="filter-clear" onClick={clearFilters}>Xóa bộ lọc</button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <Link to={`/products/${product.id}`} key={product.id} className="product-card-link">
                  <div className="product-card">
                    <div className="product-image" style={{ background: `linear-gradient(135deg, #1a1a2e, #0d0d0d)` }}>
                      <div className="product-placeholder" />
                      {product.is_featured === 1 && <div className="product-badge featured">Nổi bật</div>}
                      {product.is_new === 1 && <div className="product-badge new">Mới</div>}
                      {product.original_price && product.original_price > product.price && (
                        <div className="product-badge sale">-{Math.round((1 - product.price / product.original_price) * 100)}%</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-stone">
                        {product.stone_name || 'Trang sức'} • {product.material_name || 'Kim loại quý'}
                      </div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-prices">
                        <span className="product-price">{formatPrice(product.price)}₫</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="product-original">{formatPrice(product.original_price)}₫</span>
                        )}
                      </div>
                      <div className="product-stock">
                        {product.stock_quantity > 0 ? `Còn ${product.stock_quantity} sản phẩm` : 'Hết hàng'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                ← Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} className={`page-btn ${page === pagination.page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                  {page}
                </button>
              ))}
              <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                Sau →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;
