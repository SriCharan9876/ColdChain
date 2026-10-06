import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';
import { registerLogger } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

export default function RegisterLogger() {
  const { user } = useContext(AuthContext);
  const { account, isCorrectNetwork } = useContext(Web3Context);
  
  const [medicineId, setMedicineId] = useState('');
  const [loggerAddress, setLoggerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!account || !isCorrectNetwork) {
      setError('Please connect MetaMask and switch to Sepolia network.');
      return;
    }

    if (!user || user.role !== 'Manufacturer') {
      setError('Only manufacturers can register loggers.');
      return;
    }

    if (!loggerAddress || !loggerAddress.startsWith('0x') || loggerAddress.length !== 42) {
      setError('Invalid Ethereum address for logger.');
      return;
    }

    try {
      setLoading(true);
      await registerLogger(medicineId, user.details.id, loggerAddress, account);
      setSuccess(`Logger ${loggerAddress} successfully registered for Medicine ID ${medicineId}.`);
      setMedicineId('');
      setLoggerAddress('');
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'Manufacturer') {
    return <div style={{ padding: '2rem' }}>Unauthorized: Only manufacturers can register loggers.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Register Logger</h2>
      <p>Assign a MetaMask wallet address as the authorized temperature logger for a specific medicine batch.</p>
      
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Medicine ID" 
          value={medicineId} 
          onChange={(e) => setMedicineId(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Logger Ethereum Address (0x...)" 
          value={loggerAddress} 
          onChange={(e) => setLoggerAddress(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading || !account}>
          {loading ? <Loader /> : 'Register Logger'}
        </button>
      </form>
    </div>
  );
}
