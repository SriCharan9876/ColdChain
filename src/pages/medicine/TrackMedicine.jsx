import { useState } from 'react';
import { getMedicine, getTemperatureHistory, getLogger } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';
import ColdChainStatus from '../../components/temperature/ColdChainStatus';
import TemperatureHistory from '../../components/temperature/TemperatureHistory';
import TemperatureChart from '../../components/temperature/TemperatureChart';

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
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Track Medicine</h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Enter Medicine ID" 
          value={medicineId} 
          onChange={(e) => setMedicineId(e.target.value)} 
          required 
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? <Loader /> : 'Search'}
        </button>
      </form>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            <h3>Basic Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><strong>Medicine ID:</strong> {medicine.basic.medicineId}</div>
              <div><strong>Name:</strong> {medicine.basic.medicineName}</div>
              <div><strong>Type:</strong> {medicine.basic.medicineType}</div>
              <div><strong>Strength:</strong> {medicine.basic.strength}</div>
              <div><strong>Batch:</strong> {medicine.basic.batchNumber}</div>
              <div><strong>Storage:</strong> {medicine.basic.storageConditions}</div>
              <div><strong>Manufacturer ID:</strong> {medicine.basic.manufacturerId}</div>
              <div><strong>Manufacturer Address:</strong> {medicine.basic.manufacturerAddress}</div>
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            <h3>Specifications & Lifecycle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><strong>State:</strong> {MEDICINE_STATES[Number(medicine.spec.state)]}</div>
              <div><strong>Quantity:</strong> {medicine.spec.quantity.toString()}</div>
              <div><strong>Price:</strong> {medicine.spec.price.toString()}</div>
              <div><strong>Manufacture Date:</strong> {formatTimestamp(medicine.spec.manufactureDate)}</div>
              <div><strong>Expiry Date:</strong> {formatTimestamp(medicine.spec.expiryDate)}</div>
              <div><strong>Temp Range:</strong> {medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</div>
              <div><strong>Registered Logger:</strong> {logger && logger !== '0x0000000000000000000000000000000000000000' ? logger : 'None'}</div>
            </div>
          </div>

          <ColdChainStatus history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
              <h3>Temperature Chart</h3>
              <TemperatureChart history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
              <h3>Temperature History</h3>
              <TemperatureHistory history={history} tempMin={Number(medicine.spec.tempMin)} tempMax={Number(medicine.spec.tempMax)} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
