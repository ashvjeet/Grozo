import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#10b981' }}>grozo<span style={{ color: '#f59e0b' }}>.</span></h3>
          <p>India's smartest grocery platform. Fresh groceries delivered to your doorstep in 10-15 minutes with AI-powered recommendations and eco-friendly options.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {['📘', '🐦', '📸', '💼'].map((icon, i) => (
              <span key={i} style={{ width: 36, height: 36, borderRadius: 8, background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>{icon}</span>
            ))}
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?category=Fruits+%26+Vegetables">Fruits & Vegetables</Link></li>
            <li><Link to="/products?category=Dairy+%26+Breakfast">Dairy & Breakfast</Link></li>
            <li><Link to="/products?isOrganic=true">Organic Products</Link></li>
            <li><Link to="/products?isFlashDeal=true">Flash Deals</Link></li>
          </ul>
        </div>
        <div>
          <h3>Company</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Partner with Us</a></li>
            <li><a href="#">Sell on Grozo</a></li>
          </ul>
        </div>
        <div>
          <h3>Support</h3>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#"><HiOutlinePhone style={{ verticalAlign: 'middle' }} /> 1800-GROZO</a></li>
            <li><a href="#"><HiOutlineMail style={{ verticalAlign: 'middle' }} /> help@grozo.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Grozo. All rights reserved. Made with 💚 in India
      </div>
    </footer>
  );
}
