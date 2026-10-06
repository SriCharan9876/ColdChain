import { useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { getMedicine, getLogger, recordTemperature } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

export default function RecordTemperature() {
  const { account, isCorrectNetwork } = useContext(Web3Context);
  
  const [medicineId, setMedicineId] = useState('');
  const [temperature, setTemperature] = useState('');
  
  const [medicine, setMedicine] = useState(null);
  const [loggerAddress, setLoggerAddress] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFetchMedicine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMedicine(null);
    setLoggerAddress('');

    if (!medicineId.trim()) return;

    try {
      setFetchLoading(true);
      const med = await getMedicine(medicineId);
      const logger = await getLogger(medicineId);
      setMedicine(med);
      setLoggerAddress(logger);
    } catch (err) {
      setError(parseWeb3Error(err) || 'Medicine not found.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!account || !isCorrectNetwork) {
      setError('Please connect MetaMask and switch to Sepolia network.');
      return;
    }

    if (account.toLowerCase() !== loggerAddress.toLowerCase()) {
      setError('Unauthorized: Your current connected wallet is not the registered logger for this medicine.');
      return;
    }

    try {
      setSubmitLoading(true);
      await recordTemperature(medicineId, parseInt(temperature, 10).toString(), account);
      setSuccess(`Temperature ${temperature}°C recorded successfully.`);
      setTemperature('');
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Record Temperature</h2>
      <p>Submit temperature readings as an authorized logger.</p>
      
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <form onSubmit={handleFetchMedicine} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Medicine ID" 
          value={medicineId} 
          onChange={(e) => setMedicineId(e.target.value)} 
          required 
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={fetchLoading}>
          {fetchLoading ? <Loader /> : 'Find Medicine'}
        </button>
      </form>

      {medicine && (
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>Medicine Details</h3>
          <p><strong>Name:</strong> {medicine.basic.medicineName}</p>
          <p><strong>Configured Range:</strong> {medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</p>
          <p>
            <strong>Registered Logger:</strong> {loggerAddress} 
            {account && account.toLowerCase() === loggerAddress.toLowerCase() 
              ? <span style={{ color: 'green', marginLeft: '10px', fontWeight: 'bold' }}>✓ You are authorized</span>
              : <span style={{ color: 'red', marginLeft: '10px', fontWeight: 'bold' }}>✗ You are not authorized</span>
            }
          </p>
        </div>
      )}

      {medicine && (
        <form onSubmit={handleRecord} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label><strong>Temperature Reading (°C):</strong></label>
          <input 
            type="number" 
            placeholder="Enter temperature (e.g., 5, -2, 10)" 
            value={temperature} 
            onChange={(e) => setTemperature(e.target.value)} 
            required 
          />
          <button type="submit" disabled={submitLoading || !account || account.toLowerCase() !== loggerAddress.toLowerCase()}>
            {submitLoading ? <Loader /> : 'Submit Reading'}
          </button>
        </form>
      )}
    </div>
  );
}
