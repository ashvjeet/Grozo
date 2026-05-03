import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <h1>grozo<span style={{ color: '#f59e0b' }}>.</span></h1>
        <p>India's smartest grocery delivery platform</p>
        <ul className="auth-features">
          <li>⚡ 10-minute express delivery</li>
          <li>🧠 AI-powered recommendations</li>
          <li>🌿 Farm-fresh organic products</li>
          <li>🎮 Earn rewards on every order</li>
          <li>📊 Smart spending insights</li>
        </ul>
      </div>
      <div className="auth-right">
        <form className="auth-form animate-in" onSubmit={handleSubmit}>
          <h2>Welcome back 👋</h2>
          <p className="subtitle">Sign in to your Grozo account</p>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="auth-divider">or continue with</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }}>🔵 Google</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }}>📱 OTP</button>
          </div>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Demo: admin@grozo.com / admin123 or user@grozo.com / user123
          </p>
        </form>
      </div>
    </div>
  );
}
