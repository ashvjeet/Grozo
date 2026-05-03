import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      toast.success('Account created! Welcome to Grozo 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <h1>grozo<span style={{ color: '#f59e0b' }}>.</span></h1>
        <p>Join millions of happy grocery shoppers</p>
        <ul className="auth-features">
          <li>🎁 Get ₹150 off on first order</li>
          <li>⚡ 10-minute express delivery</li>
          <li>🌿 20,000+ products to choose from</li>
          <li>💰 Best prices, guaranteed</li>
        </ul>
      </div>
      <div className="auth-right">
        <form className="auth-form animate-in" onSubmit={handleSubmit}>
          <h2>Create Account ✨</h2>
          <p className="subtitle">Join Grozo and start saving today</p>
          <div className="form-group"><label>Full Name</label><input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Phone Number</label><input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label>Password</label><input type="password" name="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" name="confirmPassword" placeholder="Re-enter" value={form.confirmPassword} onChange={handleChange} required /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
        </form>
      </div>
    </div>
  );
}
