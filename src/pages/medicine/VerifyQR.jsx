import { useState } from 'react';
import { getMedicine, getTemperatureHistory } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';
import ColdChainStatus from '../../components/temperature/ColdChainStatus';
import QRCodeDisplay from '../../components/shared/QRCodeDisplay';
import QRScanner from '../../components/shared/QRScanner';

const MEDICINE_STATES = ['Manufactured', 'InStock', 'Sold', 'Expired'];

export default function VerifyQR() {
  const [medicineId, setMedicineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicine, setMedicine] = useState(null);
  const [history, setHistory] = useState([]);
  const [verifiedTimestamp, setVerifiedTimestamp] = useState(null);

  const fetchVerification = async (targetId) => {
    if (!targetId || !targetId.trim()) return;

    setError('');
    setMedicine(null);
    setHistory([]);

    try {
      setLoading(true);
      const medData = await getMedicine(targetId.trim());
      setMedicine(medData);

      try {
        const histData = await getTemperatureHistory(targetId.trim());
        setHistory(histData || []);
      } catch (hErr) {
        console.error("Failed to load history", hErr);
      }
      
      setVerifiedTimestamp(new Date().toLocaleString());

    } catch (err) {
      setError(parseWeb3Error(err) || 'Medicine not found on the blockchain.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    fetchVerification(medicineId);
  };

  const handleScan = (scannedValue) => {
    setMedicineId(scannedValue);
    fetchVerification(scannedValue);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Public QR / ID Verification</h2>
        <p className="text-slate-500 mt-2">Verify pharmaceutical authenticity and cold chain history.</p>
      </div>
      
      <div className="bg-secondary-50 border border-secondary-200 text-secondary-800 p-4 rounded-xl text-center text-sm">
        <strong>DISCLAIMER:</strong> This tool verifies <em>blockchain records</em> associated with a given Medicine ID. 
        It guarantees that the digital records have not been tampered with. 
        It does <strong>NOT</strong> guarantee the physical authenticity of the product itself.
      </div>

      <div className="card max-w-2xl mx-auto">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Enter Medicine ID (e.g. MED-123)" 
            value={medicineId} 
            onChange={(e) => setMedicineId(e.target.value)} 
            required 
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap min-w-[120px] flex justify-center py-2.5">
            {loading ? <Loader /> : 'Verify'}
          </button>
        </form>
        
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <QRScanner onScan={handleScan} />
      </div>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div className="card space-y-6 mt-8 border-t-4 border-t-green-500 shadow-md">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Blockchain Record Verified</h3>
            <p className="text-sm text-slate-500 mt-1">Checked on: {verifiedTimestamp}</p>
          </div>

          <div className="flex justify-center my-6">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <QRCodeDisplay value={medicine.basic.medicineId} size={160} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div><span className="text-slate-500 text-sm block mb-1">Medicine ID</span><strong className="text-slate-900">{medicine.basic.medicineId}</strong></div>
            <div><span className="text-slate-500 text-sm block mb-1">Name</span><strong className="text-slate-900">{medicine.basic.medicineName}</strong></div>
            <div><span className="text-slate-500 text-sm block mb-1">Batch Number</span><strong className="text-slate-900">{medicine.basic.batchNumber}</strong></div>
            <div><span className="text-slate-500 text-sm block mb-1">Manufacturer ID</span><strong className="text-slate-900 font-mono text-xs">{medicine.basic.manufacturerId}</strong></div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Lifecycle State</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {MEDICINE_STATES[Number(medicine.spec.state)]}
              </span>
            </div>
            <div><span className="text-slate-500 text-sm block mb-1">Manufactured</span><strong className="text-slate-900">{new Date(Number(medicine.spec.manufactureDate) * 1000).toLocaleDateString()}</strong></div>
            <div><span className="text-slate-500 text-sm block mb-1">Expires</span><strong className="text-slate-900">{new Date(Number(medicine.spec.expiryDate) * 1000).toLocaleDateString()}</strong></div>
            <div><span className="text-slate-500 text-sm block mb-1">Configured Temp Range</span><strong className="text-slate-900">{medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</strong></div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Latest Temperature</span>
              <strong className="text-slate-900">{history.length > 0 ? `${history[history.length - 1].temperature}°C` : 'No readings'}</strong>
            </div>
            <div><span className="text-slate-500 text-sm block mb-1">Total Readings</span><strong className="text-slate-900">{history.length}</strong></div>
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cold Chain Status</h3>
            <ColdChainStatus history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
          </div>
          
        </div>
      )}
    </div>
  );
}
