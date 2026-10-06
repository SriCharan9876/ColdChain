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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-primary-600">{user.details.firstName} {user.details.lastName}</span>!</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary-500 to-secondary-600 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <h3 className="text-primary-100 text-sm font-semibold uppercase tracking-wider relative z-10">Your Role</h3>
          <p className="text-2xl font-bold mt-1 relative z-10">{user.role}</p>
        </div>
        
        {loading ? (
          <div className="col-span-1 sm:col-span-3 card flex items-center justify-center min-h-[140px]">
            <Loader />
          </div>
        ) : (
          <>
            <div className="card">
              <h3 className="text-slate-500 text-sm font-medium">Medicines {user.role === 'Manufacturer' ? 'Registered' : 'in System'}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{totalRegistered}</span>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-slate-500 text-sm font-medium">Currently In Stock</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-primary-600">{inStockCount}</span>
              </div>
            </div>

            <div className="card">
              <h3 className="text-slate-500 text-sm font-medium">Sold / Dispatched</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-secondary-600">{soldCount}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>
          <ul className="space-y-4">
            {user.role === 'Manufacturer' && (
              <li className="flex gap-3">
                <div className="text-primary-500 mt-1">●</div>
                <div>
                  <strong className="block text-slate-800">Add Medicine</strong>
                  <span className="text-sm text-slate-500">Register a new medicine batch onto the blockchain.</span>
                </div>
              </li>
            )}
            {user.role === 'Manufacturer' && (
              <li className="flex gap-3">
                <div className="text-primary-500 mt-1">●</div>
                <div>
                  <strong className="block text-slate-800">Register Logger</strong>
                  <span className="text-sm text-slate-500">Authorize an IoT wallet to submit temperatures.</span>
                </div>
              </li>
            )}
            <li className="flex gap-3">
              <div className="text-secondary-500 mt-1">●</div>
              <div>
                <strong className="block text-slate-800">Track Medicine</strong>
                <span className="text-sm text-slate-500">View the complete lifecycle and cold-chain status.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="text-secondary-500 mt-1">●</div>
              <div>
                <strong className="block text-slate-800">Audit View</strong>
                <span className="text-sm text-slate-500">Verify full chronological history of events for a batch.</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="card flex items-center justify-center bg-slate-50 border-dashed border-2">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h3 className="text-slate-700 font-medium mb-1">Cold Chain Analytics</h3>
            <p className="text-sm text-slate-500">Detailed analytics reporting will appear here in future updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
