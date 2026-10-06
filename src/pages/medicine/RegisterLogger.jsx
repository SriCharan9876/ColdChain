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
    return <div className="p-8 text-center text-red-500">Unauthorized: Only manufacturers can register loggers.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Register IoT Logger</h2>
        <p className="text-slate-500 mt-2">Assign a wallet address as the authorized temperature logger for a batch.</p>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-text">Medicine ID</label>
            <input 
              type="text" 
              placeholder="e.g. MED-2023-XYZ" 
              value={medicineId} 
              onChange={(e) => setMedicineId(e.target.value)} 
              required 
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Logger Ethereum Address</label>
            <input 
              type="text" 
              placeholder="0x..." 
              value={loggerAddress} 
              onChange={(e) => setLoggerAddress(e.target.value)} 
              required 
              className="input-field font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1.5">This address will have exclusive permission to submit temperature readings for this batch.</p>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading || !account} className="btn-primary w-full py-3">
              {loading ? <Loader /> : 'Authorize Logger'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-secondary-50 border border-secondary-100 rounded-xl p-4 text-sm text-secondary-800 flex gap-3 items-start">
        <div className="mt-0.5 text-lg">ℹ️</div>
        <div>
          <strong className="block mb-1">How it works</strong>
          <p className="text-secondary-700/80">In a production environment, this address typically belongs to an automated IoT gateway or proxy server that securely signs transactions on behalf of physical temperature sensors in the delivery vehicle or warehouse.</p>
        </div>
      </div>
    </div>
  );
}
