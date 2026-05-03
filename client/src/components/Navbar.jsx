import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineShoppingCart, HiOutlineUser, HiOutlineHeart, HiOutlineLocationMarker } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      <div className="delivery-bar">
        <HiOutlineLocationMarker />
        <span>Delivering to <strong>Mumbai</strong> — </span>
        <span className="flash">⚡</span>
        <strong>10-15 min delivery</strong>
      </div>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span>grozo</span>
            <div className="logo-dot"></div>
          </Link>

          <form className="navbar-search" onSubmit={handleSearch}>
            <HiOutlineSearch className="search-icon" />
            <input type="text" placeholder="Search for groceries, brands, recipes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="nav-btn" title="Cart">
                  <HiOutlineShoppingCart />
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>
                <div style={{ position: 'relative' }}>
                  <button className="nav-user" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="nav-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    {user?.name?.split(' ')[0]}
                  </button>
                  {showDropdown && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: 8, minWidth: 200, zIndex: 50, animation: 'fadeIn 0.2s ease-out' }}>
                      <Link to="/orders" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>📦 My Orders</Link>
                      <Link to="/profile" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>👤 Profile</Link>
                      <Link to="/meal-planner" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>🥦 AI Meal Planner</Link>
                      <Link to="/spending" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>📊 Spending Insights</Link>
                      {(user?.role === 'admin' || user?.role === 'delivery') && <Link to="/delivery" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>🛵 Delivery Portal</Link>}
                      {user?.role === 'admin' && <Link to="/admin" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>⚙️ Admin Panel</Link>}
                      <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }}></div>
                      <button onClick={() => { logout(); setShowDropdown(false); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, width: '100%', color: '#ef4444' }} onMouseEnter={(e) => e.target.style.background = '#fef2f2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>🚪 Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="nav-user">
                <HiOutlineUser style={{ fontSize: 18 }} /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
