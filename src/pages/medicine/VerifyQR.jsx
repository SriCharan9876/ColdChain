import { useState } from 'react';
import { getMedicine, getTemperatureHistory } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';
import ColdChainStatus from '../../components/temperature/ColdChainStatus';

const MEDICINE_STATES = ['Manufactured', 'InStock', 'Sold', 'Expired'];

export default function VerifyQR() {
  const [medicineId, setMedicineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicine, setMedicine] = useState(null);
  const [history, setHistory] = useState([]);
  const [verifiedTimestamp, setVerifiedTimestamp] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMedicine(null);
    setHistory([]);

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
      
      setVerifiedTimestamp(new Date().toLocaleString());

    } catch (err) {
      setError(parseWeb3Error(err) || 'Medicine not found on the blockchain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Public QR / ID Verification</h2>
      
      <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <strong>DISCLAIMER:</strong> This tool verifies <em>blockchain records</em> associated with a given Medicine ID. 
        It guarantees that the digital records have not been tampered with. 
        It does <strong>NOT</strong> guarantee the physical authenticity of the product itself.
      </div>

      <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: '2rem', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Enter Medicine ID (or scan QR)" 
          value={medicineId} 
          onChange={(e) => setMedicineId(e.target.value)} 
          required 
          style={{ width: '300px', padding: '0.75rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {loading ? <Loader /> : 'Verify'}
        </button>
      </form>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
          
          <div style={{ textAlign: 'center', color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>
            ✓ Blockchain data retrieved successfully
          </div>
          <div style={{ textAlign: 'center', color: '#666' }}>
            Verified on: {verifiedTimestamp}
          </div>

          <hr style={{ width: '100%' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong>Medicine ID:</strong> {medicine.basic.medicineId}</div>
            <div><strong>Name:</strong> {medicine.basic.medicineName}</div>
            <div><strong>Batch:</strong> {medicine.basic.batchNumber}</div>
            <div><strong>Manufacturer:</strong> {medicine.basic.manufacturerId}</div>
            <div><strong>Lifecycle State:</strong> {MEDICINE_STATES[Number(medicine.spec.state)]}</div>
            <div><strong>Manufactured:</strong> {new Date(Number(medicine.spec.manufactureDate) * 1000).toLocaleDateString()}</div>
            <div><strong>Expires:</strong> {new Date(Number(medicine.spec.expiryDate) * 1000).toLocaleDateString()}</div>
            <div><strong>Configured Range:</strong> {medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</div>
            <div>
              <strong>Latest Temperature:</strong> 
              {history.length > 0 ? ` ${history[history.length - 1].temperature}°C` : ' No readings'}
            </div>
            <div><strong>Total Readings:</strong> {history.length}</div>
          </div>

          <hr style={{ width: '100%' }} />
          
          <ColdChainStatus history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
          
        </div>
      )}
    </div>
  );
}
