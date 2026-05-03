import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-purchaseCount',
    isOrganic: searchParams.get('isOrganic') || '',
    minPrice: '', maxPrice: '', page: 1
  });

  useEffect(() => {
    productsAPI.getCategories().then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.sort) params.sort = filters.sort;
        if (filters.isOrganic) params.isOrganic = filters.isOrganic;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (searchParams.get('isFlashDeal')) params.isFlashDeal = 'true';
        params.page = filters.page;
        params.limit = 20;

        const { data } = await productsAPI.getAll(params);
        setProducts(data.data || []);
        setPagination(data.pagination || {});
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchProducts();
  }, [filters, searchParams]);

  return (
    <div className="container page animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>
          {filters.category || searchParams.get('isFlashDeal') ? (searchParams.get('isFlashDeal') ? '⚡ Flash Deals' : filters.category) : 'All Products'}
        </h1>
        <span className="text-muted text-sm">{pagination.total || 0} products found</span>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} style={{ paddingLeft: 36, height: 40 }} />
        </div>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} style={{ width: 200, height: 40 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c._id} ({c.count})</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} style={{ width: 180, height: 40 }}>
          <option value="-purchaseCount">Most Popular</option>
          <option value="-ratings.average">Top Rated</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-createdAt">Newest First</option>
          <option value="-discount">Biggest Discount</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={filters.isOrganic === 'true'} onChange={(e) => setFilters({ ...filters, isOrganic: e.target.checked ? 'true' : '', page: 1 })} style={{ width: 'auto' }} /> 🌿 Organic Only
        </label>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid-5">{Array(10).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 300 }}></div>)}</div>
      ) : products.length === 0 ? (
        <div className="empty-state"><div className="icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters or search term</p><Link to="/products" className="btn btn-primary">Clear Filters</Link></div>
      ) : (
        <>
          <div className="grid-5">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`btn btn-sm ${filters.page === i + 1 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilters({ ...filters, page: i + 1 })}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
