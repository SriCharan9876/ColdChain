import { useState } from 'react';
import { getMedicineEvents, getMedicine } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

export default function AuditView() {
  const [medicineId, setMedicineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [events, setEvents] = useState([]);
  const [medicine, setMedicine] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    setError('');
    setEvents([]);
    setMedicine(null);

    if (!medicineId.trim()) return;

    try {
      setLoading(true);
      const med = await getMedicine(medicineId);
      setMedicine(med);

      const pastEvents = await getMedicineEvents(medicineId);
      
      // Sort chronologically by block number then transaction index safely with BigInt/string support
      pastEvents.sort((a, b) => {
        const blockA = BigInt(a.blockNumber);
        const blockB = BigInt(b.blockNumber);
        if (blockA !== blockB) {
          return blockA < blockB ? -1 : 1;
        }
        const txA = BigInt(a.transactionIndex ?? 0);
        const txB = BigInt(b.transactionIndex ?? 0);
        if (txA !== txB) {
          return txA < txB ? -1 : 1;
        }
        return 0;
      });

      setEvents(pastEvents);

    } catch (err) {
      setError(parseWeb3Error(err) || 'Failed to retrieve audit trail.');
    } finally {
      setLoading(false);
    }
  };

  const renderEventDetails = (event) => {
    const vals = event.returnValues;
    switch (event.event) {
      case 'MedicineAdded':
        return `Registered by Manufacturer ${vals.manufacturerId}. Name: ${vals.medicineName}, Qty: ${vals.quantity}`;
      case 'ManufacturerHistoryRecorded':
        return `Manufacturer history recorded. Price: ${vals.price}`;
      case 'MedicinePurchased':
        return `Purchased by ${vals.buyerId} (Type: ${String(vals.buyerType) === '1' ? 'Wholesaler' : 'Pharmacy'}). Qty: ${vals.quantity}, Price: ${vals.price}`;
      case 'SaleHistoryRecorded':
        return `Sale history updated for buyer ${vals.buyerId}.`;
      case 'TemperatureRecorded':
        return `Temperature logged: ${vals.temperature}°C. Within Range: ${vals.withinRange ? 'Yes' : 'No'}`;
      case 'TemperatureExcursion':
        return `ALERT: Excursion detected! Temperature ${vals.temperature}°C was out of bounds.`;
      case 'MedicineStateUpdated':
        return `Lifecycle state changed to state index ${vals.newState}.`;
      default:
        return 'Event logged.';
    }
  };

  const getEventStyle = (eventName) => {
    switch (eventName) {
      case 'TemperatureExcursion': return 'bg-red-50 border-red-200 text-red-800 border-l-4 border-l-red-500';
      case 'MedicinePurchased':
      case 'SaleHistoryRecorded': return 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500';
      case 'MedicineAdded': return 'bg-green-50 border-green-200 text-green-800 border-l-4 border-l-green-500';
      case 'TemperatureRecorded': return 'bg-orange-50 border-orange-200 text-orange-800 border-l-4 border-l-orange-500';
      case 'MedicineStateUpdated': return 'bg-purple-50 border-purple-200 text-purple-800 border-l-4 border-l-purple-500';
      default: return 'bg-slate-50 border-slate-200 text-slate-800 border-l-4 border-l-slate-400';
    }
  };

  const getEventIcon = (eventName) => {
    switch (eventName) {
      case 'TemperatureExcursion': return '⚠️';
      case 'MedicinePurchased':
      case 'SaleHistoryRecorded': return '💸';
      case 'MedicineAdded': return '📦';
      case 'TemperatureRecorded': return '🌡️';
      case 'MedicineStateUpdated': return '🔄';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Regulator / Audit View</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          <strong className="text-slate-700">READ ONLY:</strong> This view compiles a complete, chronological blockchain audit trail of all transactions and state changes for a given batch.
        </p>
      </div>
      
      <div className="card">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Enter Medicine ID" 
            value={medicineId} 
            onChange={(e) => setMedicineId(e.target.value)} 
            required 
            className="input-field flex-1 text-lg py-3"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap min-w-[140px] flex justify-center py-3 text-lg">
            {loading ? <Loader /> : 'Run Audit'}
          </button>
        </form>
      </div>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-r-lg shadow-sm animate-in fade-in">
          <h3 className="text-xl font-bold text-primary-900 mb-2">Audit Target: <span className="font-semibold text-primary-700">{medicine.basic.medicineName}</span></h3>
          <div className="flex gap-6 text-primary-800">
            <p><strong>Batch:</strong> {medicine.basic.batchNumber}</p>
            <p><strong>Current Qty:</strong> {medicine.spec.quantity.toString()}</p>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-4 mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-xl font-bold text-slate-900">Event History</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">{events.length} records</span>
          </div>
          
          <div className="space-y-4">
            {events.map((ev, index) => (
              <div key={index} className={`p-5 rounded-lg border shadow-sm transition-all hover:shadow-md ${getEventStyle(ev.event)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getEventIcon(ev.event)}</span>
                    <strong className="text-lg font-bold">{ev.event}</strong>
                  </div>
                  <div className="text-right text-sm opacity-80">
                    <div className="font-mono bg-white/50 px-2 py-0.5 rounded text-xs mb-1">Block: {String(ev.blockNumber)}</div>
                    {ev.returnValues.timestamp && (
                      <div className="font-medium">{new Date(Number(String(ev.returnValues.timestamp)) * 1000).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                <div className="my-3 text-base leading-relaxed font-medium">
                  {renderEventDetails(ev)}
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs opacity-70 font-mono">
                  <span className="truncate pr-4" title={ev.transactionHash}>Tx: {ev.transactionHash}</span>
                  <a href={`https://sepolia.etherscan.io/tx/${ev.transactionHash}`} target="_blank" rel="noreferrer" className="hover:underline whitespace-nowrap flex items-center gap-1">
                    Etherscan <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && events.length === 0 && medicine && (
        <div className="text-center p-12 card border-dashed">
          <p className="text-slate-500 text-lg">No events found for this ID.</p>
        </div>
      )}
    </div>
  );
}
