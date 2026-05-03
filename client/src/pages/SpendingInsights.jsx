import { useState, useEffect } from 'react';
import { ordersAPI } from '../api';

export default function SpendingInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await ordersAPI.getSpendingInsights(); setData(res.data.data); } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 300 }}></div></div>;

  return (
    <div className="container page animate-in" style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>📊 Smart Spending Insights</h1>
      
      {!data || data.totalOrders === 0 ? (
        <div className="empty-state"><div className="icon">📊</div><h3>No spending data yet</h3><p>Complete your first order to see insights</p></div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Spent (30 days)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>₹{data.totalSpent?.toFixed(0)}</div>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Orders</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>{data.totalOrders}</div>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Avg Order Value</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>₹{data.avgOrderValue?.toFixed(0)}</div>
            </div>
          </div>

          {data.totalSaved > 0 && (
            <div className="savings-banner" style={{ marginBottom: 24, fontSize: 15 }}>🎉 You saved ₹{data.totalSaved?.toFixed(0)} this month with coupons & deals!</div>
          )}

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Category Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.categoryBreakdown?.map((cat, i) => {
              const pct = data.totalSpent > 0 ? (cat.amount / data.totalSpent) * 100 : 0;
              return (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.category}</span>
                    <span style={{ fontWeight: 700 }}>₹{cat.amount?.toFixed(0)}</span>
                  </div>
                  <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `hsl(${160 - i * 20}, 70%, 45%)`, borderRadius: 4, transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{pct.toFixed(1)}% of total spending</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
