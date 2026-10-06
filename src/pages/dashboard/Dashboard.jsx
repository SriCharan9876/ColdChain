import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAllMedicines } from '../../services/medicineService';
import Loader from '../../components/shared/Loader';

export default function Dashboard() {
  const { user, authLoading } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (user) {
      getAllMedicines()
        .then(data => {
          if (active) {
            setMedicines(data || []);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to load dashboard data", err);
          if (active) setLoading(false);
        });
    } else {
      setTimeout(() => { if (active) setLoading(false); }, 0);
    }
    return () => { active = false; };
  }, [user]);

  if (authLoading) {
    return <div style={{ padding: '2rem' }}><Loader /></div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Medicine Cold Chain Integrity System</h2>
        <p>Please login or register to access the dashboard.</p>
      </div>
    );
  }

  const roleMeds = medicines.filter(m => {
    if (user.role === 'Manufacturer') return m.basic.manufacturerId === user.details.id;
    return true; // For others, we just show global stats for now
  });

  const totalRegistered = roleMeds.length;
  const inStockCount = roleMeds.filter(m => Number(m.spec.state) === 1).length;
  const soldCount = roleMeds.filter(m => Number(m.spec.state) === 2).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Dashboard</h2>
      <p style={{ fontSize: '1.2rem' }}>Welcome back, <strong>{user.details.firstName} {user.details.lastName}</strong>!</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Your Role</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>{user.role}</p>
        </div>
        
        {loading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader /></div>
        ) : (
          <>
            <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Medicines {user.role === 'Manufacturer' ? 'Registered' : 'in System'}</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>{totalRegistered}</p>
            </div>
            
            <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Currently In Stock</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef6c00' }}>{inStockCount}</p>
            </div>

            <div style={{ background: '#f3e5f5', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Sold / Dispatched</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6a1b9a' }}>{soldCount}</p>
            </div>
          </>
        )}
      </div>
      
      <div style={{ marginTop: '3rem', background: '#f9f9f9', padding: '2rem', borderRadius: '8px' }}>
        <h3>Quick Actions</h3>
        <ul style={{ lineHeight: '2', fontSize: '1.1rem' }}>
          {user.role === 'Manufacturer' && <li><strong>Add Medicine:</strong> Register a new medicine batch onto the blockchain.</li>}
          {user.role === 'Manufacturer' && <li><strong>Register Logger:</strong> Authorize an IoT/IoT-proxy wallet to submit temperatures.</li>}
          <li><strong>Track Medicine:</strong> View the complete lifecycle and cold-chain status of a medicine batch.</li>
          <li><strong>Buy Medicine:</strong> Participate in the secure supply chain.</li>
          <li><strong>Audit View:</strong> Verify full chronological history of events for a batch.</li>
        </ul>
      </div>
    </div>
  );
}
