import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiPlus, HiTrash } from 'react-icons/hi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  // Edit Profile Form
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  // Add Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home', street: '', apartment: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.success) {
        setProfileData(data.data);
        setEditForm({ name: data.data.name || '', phone: data.data.phone || '' });
        // Also update context if needed
        updateUser(data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.updateProfile(editForm);
      if (data.success) {
        toast.success('Profile updated successfully');
        setProfileData(data.data);
        updateUser(data.data);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.addAddress(addressForm);
      if (data.success) {
        toast.success('Address added successfully');
        setProfileData(data.data);
        updateUser(data.data);
        setShowAddressForm(false);
        setAddressForm({ label: 'Home', street: '', apartment: '', city: '', state: '', pincode: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await authAPI.deleteAddress(id);
      if (data.success) {
        toast.success('Address deleted');
        setProfileData(data.data);
        updateUser(data.data);
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (loading) return <div className="container page" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 400, borderRadius: 20 }}></div></div>;

  return (
    <div className="container page" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 30 }}>My Profile</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'start' }}>
        
        {/* Profile Info Section */}
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Personal Information</h2>
            {!isEditing && (
              <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" className="input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                <button type="button" className="btn btn-outline flex-1" onClick={() => { setIsEditing(false); setEditForm({ name: profileData.name, phone: profileData.phone }); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
                  {profileData?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{profileData?.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    <HiOutlineMail /> {profileData?.email}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    <HiOutlinePhone /> {profileData?.phone || 'No phone added'}
                  </div>
                </div>
              </div>
              
              <div style={{ padding: 16, background: '#fdfaea', borderRadius: 12, border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>✨</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#b45309' }}>Grozo Loyalty Points</div>
                    <div style={{ fontSize: 13, color: '#d97706' }}>Earn points on every order</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309' }}>
                  {profileData?.loyaltyPoints || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Saved Addresses</h2>
            {!showAddressForm && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(true)}>
                <HiPlus /> Add New
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div className="form-group">
                <label>Label</label>
                <select className="input" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" className="input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} required placeholder="123 Main St" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Apartment/Suite</label>
                  <input type="text" className="input" value={addressForm.apartment} onChange={e => setAddressForm({...addressForm, apartment: e.target.value})} placeholder="Apt 4B" />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" className="input" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} required placeholder="10001" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary flex-1">Save Address</button>
                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowAddressForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profileData?.addresses?.length > 0 ? (
                profileData.addresses.map((addr) => (
                  <div key={addr._id} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid var(--border)', borderRadius: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      <HiOutlineLocationMarker size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{addr.label}</span>
                        {addr.isDefault && <span className="badge badge-green">Default</span>}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {addr.apartment ? `${addr.apartment}, ` : ''}{addr.street}<br/>
                        {addr.city}, {addr.state} {addr.pincode}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{ padding: 8, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      title="Delete Address"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f9fafb', borderRadius: 12, border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
                  <h3 style={{ fontSize: 16, marginBottom: 5 }}>No Addresses Saved</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Add an address for faster checkout</p>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
