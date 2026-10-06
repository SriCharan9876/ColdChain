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
    <div className="max-w-2xl mx-auto space-y-6 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Record Temperature</h2>
        <p className="text-slate-500 mt-2">Submit temperature readings as an authorized IoT logger.</p>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <div className="card">
        <form onSubmit={handleFetchMedicine} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Enter Medicine ID" 
            value={medicineId} 
            onChange={(e) => setMedicineId(e.target.value)} 
            required 
            className="input-field flex-1"
          />
          <button type="submit" disabled={fetchLoading} className="btn-primary whitespace-nowrap min-w-[140px] flex justify-center py-2.5">
            {fetchLoading ? <Loader /> : 'Find Medicine'}
          </button>
        </form>
      </div>

      {medicine && (
        <div className="card space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Medicine Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Name</span>
                <span className="font-medium text-slate-900">{medicine.basic.medicineName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Configured Range</span>
                <span className="font-medium text-slate-900">{medicine.spec.tempMin.toString()}°C to {medicine.spec.tempMax.toString()}°C</span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200">
                <span className="text-slate-500 text-sm block mb-1">Registered Logger</span>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-1 rounded break-all">{loggerAddress}</code>
                  {account && account.toLowerCase() === loggerAddress.toLowerCase() 
                    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">✓ Authorized</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded whitespace-nowrap">✗ Unauthorized</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleRecord} className="space-y-4">
            <div>
              <label className="label-text">Temperature Reading (°C)</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="e.g. 5" 
                  value={temperature} 
                  onChange={(e) => setTemperature(e.target.value)} 
                  required 
                  className="input-field text-xl py-3 pl-4 pr-12 font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium text-lg">°C</span>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitLoading || !account || account.toLowerCase() !== loggerAddress.toLowerCase()}
              className="btn-primary w-full flex justify-center py-3 text-lg"
            >
              {submitLoading ? <Loader /> : 'Submit Reading'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
