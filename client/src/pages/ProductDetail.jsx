import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { HiOutlineStar, HiStar } from 'react-icons/hi';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try { const { data } = await productsAPI.getOne(id); setProduct(data.data); } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 400, borderRadius: 16 }}></div></div>;
  if (!product) return <div className="container page"><div className="empty-state"><h3>Product not found</h3></div></div>;

  const cartItem = cart?.items?.find(i => i.product?._id === product._id);
  const qty = cartItem?.quantity || 0;
  const handleAdd = async () => { try { await addToCart(product._id); toast.success('Added to cart!'); } catch (e) { toast.error('Failed'); } };

  return (
    <div className="container page animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* Image */}
        <div style={{ position: 'relative' }}>
          <img src={product.images?.[0]?.url || 'https://via.placeholder.com/500'} alt={product.name} style={{ width: '100%', borderRadius: 16, background: '#f9fafb', aspectRatio: '1' }} />
          {product.discount > 0 && <span className="product-discount-badge" style={{ fontSize: 14, padding: '4px 12px' }}>{product.discount}% OFF</span>}
          {product.isOrganic && <span className="product-organic-badge" style={{ fontSize: 12 }}>🌿 Organic</span>}
        </div>

        {/* Info */}
        <div>
          <div className="badge badge-green mb-2">{product.category}</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>{product.name}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{product.unit}</p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(s => s <= Math.round(product.ratings?.average || 0) ? <HiStar key={s} style={{ color: '#f59e0b', fontSize: 20 }} /> : <HiOutlineStar key={s} style={{ color: '#d1d5db', fontSize: 20 }} />)}</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{product.ratings?.average?.toFixed(1) || 'N/A'}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({product.ratings?.count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 32, fontWeight: 800 }}>₹{product.price}</span>
            {product.discount > 0 && <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
            {product.discount > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: 8 }}>Save ₹{product.mrp - product.price}</span>}
          </div>

          {/* Add to cart */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {qty === 0 ? (
              <button className="btn btn-primary btn-lg" onClick={handleAdd} disabled={product.stock <= 0} style={{ minWidth: 200 }}>{product.stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}</button>
            ) : (
              <div className="qty-control" style={{ minWidth: 160 }}>
                <button onClick={() => qty <= 1 ? removeItem(product._id) : updateQuantity(product._id, qty - 1)}>−</button>
                <span>{qty}</span>
                <button onClick={() => updateQuantity(product._id, qty + 1)}>+</button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Description</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{product.description}</p>
          </div>

          {product.nutritionInfo && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Nutrition Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {Object.entries(product.nutritionInfo).filter(([,v]) => v).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.isFarmDirect && product.farmDetails && (
            <div style={{ marginTop: 20, padding: 16, background: '#d1fae5', borderRadius: 12 }}>
              <h3 style={{ fontSize: 14, color: '#065f46', marginBottom: 6 }}>🧑‍🌾 Direct from Farm</h3>
              <p style={{ fontSize: 13, color: '#065f46' }}>{product.farmDetails.farmName} • {product.farmDetails.farmerName} • {product.farmDetails.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Customer Reviews</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {product.reviews.map(r => (
              <div key={r._id} style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{r.user?.name?.[0]}</div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name}</span>
                  <div style={{ display: 'flex', gap: 1 }}>{[1,2,3,4,5].map(s => <HiStar key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#d1d5db', fontSize: 14 }} />)}</div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
