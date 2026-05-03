import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineTruck, HiOutlineUser, HiOutlinePhone } from 'react-icons/hi';

export default function DeliveryLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        user = await register(name, email, phone, password, 'delivery');
      }
      
      // Ensure the user is actually a delivery partner or admin
      if (user.role === 'delivery' || user.role === 'admin') {
        toast.success(isLogin ? 'Logged in successfully!' : 'Registration successful!');
        navigate('/delivery');
      } else {
        logout();
        toast.error('Access denied. You are not registered as a delivery partner.');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '40px 20px', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <HiOutlineTruck size={32} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>grozo<span style={{ color: '#f59e0b' }}>.</span> Partner</h1>
        <p style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>Delivery Fleet Portal</p>
      </div>

      {/* Login Form */}
      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
            {isLogin ? 'Sign In' : 'Join as Partner'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {!isLogin && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <HiOutlineUser style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} size={20} />
                    <input 
                      type="text" 
                      className="input" 
                      style={{ paddingLeft: 42, height: 48, borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }} 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <HiOutlinePhone style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} size={20} />
                    <input 
                      type="tel" 
                      className="input" 
                      style={{ paddingLeft: 42, height: 48, borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }} 
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin} 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} size={20} />
                <input 
                  type="email" 
                  className="input" 
                  style={{ paddingLeft: 42, height: 48, borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }} 
                  placeholder="rider@grozo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} size={20} />
                <input 
                  type="password" 
                  className="input" 
                  style={{ paddingLeft: 42, height: 48, borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ height: 48, borderRadius: 12, fontSize: 16, fontWeight: 600, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (isLogin ? 'Signing in...' : 'Creating Account...') : (isLogin ? 'Sign In as Partner' : 'Apply Now')}
            </button>
            
          </form>

          {isLogin && (
            <div style={{ marginTop: 24, padding: 16, background: '#fdfaea', borderRadius: 12, border: '1px solid #fef08a', fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 4 }}>Demo Credentials</div>
              <div>Email: <strong>admin@grozo.com</strong></div>
              <div>Password: <strong>admin123</strong></div>
            </div>
          )}
        </div>
        
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-muted)' }}>
          {isLogin ? 'Want to join Grozo\'s delivery fleet?' : 'Already have a partner account?'} <br/>
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginTop: 4 }}>
            {isLogin ? 'Apply Now' : 'Sign In'}
          </button>
        </p>
      </div>

    </div>
  );
}
