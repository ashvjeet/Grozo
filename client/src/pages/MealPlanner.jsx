import { useState } from 'react';
import { productsAPI, cartAPI } from '../api';
import { useCart } from '../context/CartContext';
import { HiOutlineSparkles, HiOutlineShoppingCart, HiOutlineCalendar, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function MealPlanner() {
  const { fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ diet: 'Healthy', calories: 2000, servings: 2, days: 3, budget: 1500 });
  const [result, setResult] = useState(null);
  const [adding, setAdding] = useState(false);
  
  // Local state for the editable grocery list
  const [groceryList, setGroceryList] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await productsAPI.generateMealPlan(form);
      setResult(data.data);
      setGroceryList(data.data.groceryList);
      toast.success('Meal plan generated!');
    } catch (error) {
      toast.error('Failed to generate plan');
    }
    setLoading(false);
  };

  const handleRemoveItem = (indexToRemove) => {
    setGroceryList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const addAllToCart = async () => {
    if (!groceryList?.length) return;
    setAdding(true);
    try {
      // Add all items to cart sequentially
      for (const item of groceryList) {
        if (item.product?._id) {
          await cartAPI.add(item.product._id, item.quantity);
        }
      }
      await fetchCart();
      toast.success('All ingredients added to cart!');
    } catch (error) {
      toast.error('Error adding some items to cart');
    }
    setAdding(false);
  };
  
  const currentTotal = groceryList.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="container page animate-in" style={{ paddingBottom: 60 }}>
      <div style={{ background: 'linear-gradient(135deg, #047857, #065f46)', borderRadius: 20, padding: '40px', color: '#fff', marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <HiOutlineSparkles /> AI Meal Planner
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 600 }}>
            Tell us your dietary preferences and household size. Our AI will generate a personalized weekly meal plan and automatically compile all the necessary groceries into your basket!
          </p>
        </div>
        <div style={{ fontSize: 80, opacity: 0.2 }}>🥦</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 30, alignItems: 'start' }}>
        
        {/* Configuration Form */}
        <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, fontWeight: 700 }}>Plan Preferences</h2>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Dietary Preference</label>
              <select className="input" value={form.diet} onChange={e => setForm({...form, diet: e.target.value})}>
                <option value="Healthy">Balanced / Healthy</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Keto">Keto / Low Carb</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Servings</label>
              <input type="number" min="1" max="10" className="input" value={form.servings} onChange={e => setForm({...form, servings: parseInt(e.target.value)})} />
            </div>
            <div className="form-group">
              <label>Plan Duration (Days)</label>
              <select className="input" value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value)})}>
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>1 Week</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Budget (₹)</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{form.budget}</span>
              </label>
              <input type="range" min="300" max="5000" step="100" value={form.budget} onChange={e => setForm({...form, budget: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--primary)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, height: 44, background: '#059669', borderColor: '#059669' }} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div>
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 16, border: '2px dashed var(--border)' }}>
              <HiOutlineCalendar size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Ready to plan your meals?</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Configure your preferences on the left and hit generate!</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="skeleton" style={{ height: 120, borderRadius: 16 }}></div>
              <div className="skeleton" style={{ height: 300, borderRadius: 16 }}></div>
              <div className="skeleton" style={{ height: 200, borderRadius: 16 }}></div>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              
              {/* Daily Meals */}
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🍽️ Your Meal Plan</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {result.mealPlans.map((day) => (
                    <div key={day.day} className="card" style={{ padding: 20 }}>
                      <div style={{ fontWeight: 700, color: '#059669', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Day {day.day}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Breakfast</div>
                          <div style={{ fontWeight: 600 }}>{day.breakfast.name}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Lunch</div>
                          <div style={{ fontWeight: 600 }}>{day.lunch.name}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Dinner</div>
                          <div style={{ fontWeight: 600 }}>{day.dinner.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grocery List */}
              <div className="card" style={{ padding: 24, background: '#fdfaea', border: '1px solid #fef08a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🛒 Auto Grocery List</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Everything you need for this meal plan.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Cost</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: currentTotal > form.budget ? '#dc2626' : '#b45309' }}>₹{currentTotal.toFixed(2)}</div>
                    {currentTotal > form.budget && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>Exceeds budget!</div>}
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #fde047', overflow: 'hidden' }}>
                  {groceryList.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i !== groceryList.length - 1 ? '1px solid #fef08a' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button 
                          onClick={() => handleRemoveItem(i)} 
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                          title="Remove item"
                        >
                          <HiOutlineX size={18} />
                        </button>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                          {item.product.image ? (
                            <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📷</div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.product.unit}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Qty: {item.quantity}</div>
                        <div style={{ fontWeight: 700, width: 60, textAlign: 'right' }}>₹{(item.totalPrice).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {groceryList.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>All items removed from list.</div>
                  )}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 20, height: 48, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#ca8a04', borderColor: '#ca8a04' }}
                  onClick={addAllToCart}
                  disabled={adding || groceryList.length === 0}
                >
                  <HiOutlineShoppingCart size={20} />
                  {adding ? 'Adding to Cart...' : `Add ${groceryList.length} Items to Cart`}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
