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

  const getEventColor = (eventName) => {
    if (eventName === 'TemperatureExcursion') return '#ffebee'; // red
    if (eventName === 'MedicinePurchased' || eventName === 'SaleHistoryRecorded') return '#e3f2fd'; // blue
    if (eventName === 'MedicineAdded') return '#e8f5e9'; // green
    if (eventName === 'TemperatureRecorded') return '#fff3e0'; // orange
    return '#f5f5f5'; // grey
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2>Regulator / Audit View</h2>
      <p style={{ color: '#666' }}>
        <strong>READ ONLY:</strong> This view compiles a complete, chronological blockchain audit trail of all transactions and state changes for a given batch.
      </p>
      
      <form onSubmit={handleAudit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Enter Medicine ID" 
          value={medicineId} 
          onChange={(e) => setMedicineId(e.target.value)} 
          required 
          style={{ flex: 1, padding: '0.75rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
          {loading ? <Loader /> : 'Run Audit'}
        </button>
      </form>

      {error && <Alert message={error} type="error" />}

      {medicine && (
        <div style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid #3f51b5', background: '#f5f5f5' }}>
          <h3>Audit Target: {medicine.basic.medicineName}</h3>
          <p><strong>Batch:</strong> {medicine.basic.batchNumber} | <strong>Current Qty:</strong> {medicine.spec.quantity.toString()}</p>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Event History ({events.length} records)</h3>
          {events.map((ev, index) => (
            <div key={index} style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              background: getEventColor(ev.event)
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{ev.event}</strong>
                <span style={{ fontSize: '0.9rem', color: '#555' }}>
                  Block: {String(ev.blockNumber)} 
                  {ev.returnValues.timestamp && ` | Time: ${new Date(Number(String(ev.returnValues.timestamp)) * 1000).toLocaleString()}`}
                </span>
              </div>
              <div style={{ color: '#333' }}>
                {renderEventDetails(ev)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                Tx: {ev.transactionHash}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && events.length === 0 && medicine && (
        <p>No events found for this ID.</p>
      )}
    </div>
  );
}
