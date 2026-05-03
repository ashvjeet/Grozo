import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const cartItem = cart?.items?.find(i => i.product?._id === product._id);
  const qty = cartItem?.quantity || 0;
  const hasDiscount = product.discount > 0;

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await addToCart(product._id);
      toast.success(`${product.name} added to cart`, { style: { fontFamily: 'Inter', fontSize: 14 } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const handleQty = async (newQty) => {
    try {
      if (newQty <= 0) await removeItem(product._id);
      else await updateQuantity(product._id, newQty);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="product-card animate-in">
      {hasDiscount && <span className="product-discount-badge">{product.discount}% OFF</span>}
      {product.isOrganic && <span className="product-organic-badge">🌿 Organic</span>}
      <img src={product.images?.[0]?.url || 'https://via.placeholder.com/200x200?text=Product'} alt={product.name} className="product-card-img" loading="lazy" onClick={() => navigate(`/products/${product._id}`)} style={{ cursor: 'pointer' }} />
      <div className="product-card-brand">{product.brand}</div>
      <div className="product-card-name" onClick={() => navigate(`/products/${product._id}`)} style={{ cursor: 'pointer' }}>{product.name}</div>
      <div className="product-card-unit">{product.unit}</div>
      <div className="product-card-price">
        <span className="current">₹{product.price}</span>
        {hasDiscount && <span className="mrp">₹{product.mrp}</span>}
      </div>
      <div className="product-card-actions">
        {qty === 0 ? (
          <button className="add-btn" onClick={handleAdd} disabled={product.stock <= 0}>
            {product.stock <= 0 ? 'Out of Stock' : 'ADD'}
          </button>
        ) : (
          <div className="qty-control">
            <button onClick={() => handleQty(qty - 1)}>−</button>
            <span>{qty}</span>
            <button onClick={() => handleQty(qty + 1)} disabled={qty >= product.stock}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
