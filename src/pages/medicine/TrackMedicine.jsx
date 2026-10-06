import { useState } from 'react';
import { getMedicine, getTemperatureHistory, getLogger } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';
import ColdChainStatus from '../../components/temperature/ColdChainStatus';
import TemperatureHistory from '../../components/temperature/TemperatureHistory';
import TemperatureChart from '../../components/temperature/TemperatureChart';
import QRCodeDisplay from '../../components/shared/QRCodeDisplay';

const MEDICINE_STATES = ['Manufactured', 'InStock', 'Sold', 'Expired'];

export default function TrackMedicine() {
  const [medicineId, setMedicineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [medicine, setMedicine] = useState(null);
  const [history, setHistory] = useState([]);
  const [logger, setLogger] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMedicine(null);
    setHistory([]);
    setLogger('');

    if (!medicineId.trim()) return;

    try {
      setLoading(true);
      
      const medData = await getMedicine(medicineId);
      setMedicine(medData);

      try {
        const histData = await getTemperatureHistory(medicineId);
        setHistory(histData || []);
      } catch (hErr) {
        console.error("Failed to load history", hErr);
      }

      try {
        const logData = await getLogger(medicineId);
        setLogger(logData);
      } catch (lErr) {
        console.error("Failed to load logger", lErr);
      }

    } catch (err) {
      setError(parseWeb3Error(err) || 'Medicine not found or contract error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts || ts === '0') return 'N/A';
    return new Date(Number(ts) * 1000).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Track Medicine</h2>
        <p className="text-slate-500 mt-1">Enter a Medicine ID to view its complete lifecycle and cold-chain status.</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="e.g. MED-2023-XYZ" 
            value={medicineId} 
            onChange={(e) => setMedicineId(e.target.value)} 
            required 
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap min-w-[150px] flex justify-center py-2.5">
            {loading ? <Loader /> : 'Track Batch'}
          </button>
        </form>
      </div>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="card bg-white flex flex-col md:flex-row gap-8 items-center border-t-4 border-primary-500">
            <div className="flex-1 w-full">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Basic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div><span className="text-slate-500 text-sm block mb-1">Medicine ID</span><strong className="text-slate-900">{medicine.basic.medicineId}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Name</span><strong className="text-slate-900">{medicine.basic.medicineName}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Type</span><strong className="text-slate-900">{medicine.basic.medicineType}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Strength</span><strong className="text-slate-900">{medicine.basic.strength}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Batch</span><strong className="text-slate-900">{medicine.basic.batchNumber}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Storage</span><strong className="text-slate-900">{medicine.basic.storageConditions}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Manufacturer ID</span><strong className="text-slate-900 text-sm font-mono bg-slate-100 px-1 rounded">{medicine.basic.manufacturerId}</strong></div>
                <div><span className="text-slate-500 text-sm block mb-1">Address</span><strong className="text-slate-900 text-xs font-mono truncate block" title={medicine.basic.manufacturerAddress}>{medicine.basic.manufacturerAddress}</strong></div>
              </div>
            </div>
            <div className="shrink-0 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <QRCodeDisplay value={medicine.basic.medicineId} size={150} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Specifications & Lifecycle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">State</span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                  {MEDICINE_STATES[Number(medicine.spec.state)]}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">Quantity Available</span>
                <strong className="text-lg text-slate-900">{medicine.spec.quantity.toString()}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">Price (wei)</span>
                <strong className="text-lg text-slate-900">{medicine.spec.price.toString()}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">Manufacture Date</span>
                <strong className="text-slate-900">{formatTimestamp(medicine.spec.manufactureDate)}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">Expiry Date</span>
                <strong className="text-slate-900">{formatTimestamp(medicine.spec.expiryDate)}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-sm block mb-1">Temp Range</span>
                <strong className="text-slate-900">{medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 md:col-span-3">
                <span className="text-slate-500 text-sm block mb-1">Registered IoT Logger Address</span>
                <strong className="text-slate-900 font-mono text-sm break-all">{logger && logger !== '0x0000000000000000000000000000000000000000' ? logger : 'None'}</strong>
              </div>
            </div>
          </div>

          <ColdChainStatus history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Temperature Chart</h3>
              <TemperatureChart history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
            </div>
            
            <div className="card max-h-[500px] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">Temperature History</h3>
              <TemperatureHistory history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
