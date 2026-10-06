import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';
import { addMedicine } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

const parseDateToUTCSeconds = (dateStr) => {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split('-');
  return Math.floor(Date.UTC(year, month - 1, day) / 1000);
};

export default function AddMedicine() {
  const { user } = useContext(AuthContext);
  const { account, isCorrectNetwork, isWeb3Initialized } = useContext(Web3Context);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    medicineName: '',
    medicineId: '',
    medicineType: '',
    strength: '',
    batchNumber: '',
    storageConditions: '',
    manufactureDate: '',
    expiryDate: '',
    price: '',
    quantity: '',
    tempMin: '',
    tempMax: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isWeb3Initialized) {
      setError('Waiting for Web3 initialization...');
      return;
    }

    if (!account) {
      setError('Wallet not connected. Please connect MetaMask.');
      return;
    }

    if (!isCorrectNetwork) {
      setError('Wrong network. Please switch to Sepolia.');
      return;
    }

    if (user.role !== 'Manufacturer') {
      setError('Unauthorized: Only manufacturers can add medicines.');
      return;
    }

    try {
      setLoading(true);

      const medicineInput = {
        manufacturerId: user.details.id,
        medicineName: formData.medicineName,
        medicineId: formData.medicineId,
        medicineType: formData.medicineType,
        strength: formData.strength,
        batchNumber: formData.batchNumber,
        storageConditions: formData.storageConditions,
        manufactureDate: parseDateToUTCSeconds(formData.manufactureDate),
        expiryDate: parseDateToUTCSeconds(formData.expiryDate),
        price: formData.price.toString(),
        quantity: formData.quantity.toString(),
        tempMin: formData.tempMin.toString(),
        tempMax: formData.tempMax.toString()
      };

      await addMedicine(medicineInput, account);
      setSuccess('Medicine added successfully!');
      
      setFormData({
        medicineName: '',
        medicineId: '',
        medicineType: '',
        strength: '',
        batchNumber: '',
        storageConditions: '',
        manufactureDate: '',
        expiryDate: '',
        price: '',
        quantity: '',
        tempMin: '',
        tempMax: ''
      });
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-slate-500">Please login to add a medicine.</div>;
  if (user.role !== 'Manufacturer') return <div className="p-8 text-center text-red-500">Unauthorized: Only manufacturers can add medicines.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Register New Batch</h2>
        <p className="text-slate-500 mt-1">Add a new medicine batch to the blockchain immutable ledger.</p>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">Basic Information</h3>
            </div>
            
            <div>
              <label className="label-text">Manufacturer ID</label>
              <input name="manufacturerId" value={user.details.id} readOnly disabled className="input-field bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="label-text">Medicine ID (Unique QR identifier)</label>
              <input name="medicineId" placeholder="e.g. MED-2023-XYZ" value={formData.medicineId} onChange={handleChange} required className="input-field" />
            </div>
            
            <div>
              <label className="label-text">Medicine Name</label>
              <input name="medicineName" placeholder="e.g. Amoxicillin" value={formData.medicineName} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Medicine Type</label>
              <input name="medicineType" placeholder="e.g. Vaccine, Antibiotic" value={formData.medicineType} onChange={handleChange} required className="input-field" />
            </div>
            
            <div>
              <label className="label-text">Strength</label>
              <input name="strength" placeholder="e.g. 500mg" value={formData.strength} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Batch Number</label>
              <input name="batchNumber" placeholder="e.g. BT-9921" value={formData.batchNumber} onChange={handleChange} required className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">Lifecycle & Financial</h3>
            </div>
            
            <div>
              <label className="label-text">Manufacture Date</label>
              <input name="manufactureDate" type="date" value={formData.manufactureDate} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Expiry Date</label>
              <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required className="input-field" />
            </div>
            
            <div>
              <label className="label-text">Quantity (units)</label>
              <input name="quantity" type="number" placeholder="e.g. 1000" value={formData.quantity} onChange={handleChange} required min="1" className="input-field" />
            </div>
            <div>
              <label className="label-text">Base Price (wei)</label>
              <input name="price" type="number" placeholder="e.g. 10000000000" value={formData.price} onChange={handleChange} required min="0" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-secondary-50 p-6 rounded-xl border border-secondary-100">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-secondary-800 mb-1">Cold Chain Requirements</h3>
              <p className="text-sm text-secondary-600 mb-4">Set strict temperature boundaries. Excursions will be permanently logged.</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="label-text text-secondary-800">Storage Conditions Description</label>
              <input name="storageConditions" placeholder="e.g. Keep refrigerated, do not freeze" value={formData.storageConditions} onChange={handleChange} required className="input-field" />
            </div>
            
            <div>
              <label className="label-text text-secondary-800">Minimum Temperature (°C)</label>
              <input name="tempMin" type="number" placeholder="e.g. 2" value={formData.tempMin} onChange={handleChange} required className="input-field border-secondary-200 focus:ring-secondary-500" />
            </div>
            <div>
              <label className="label-text text-secondary-800">Maximum Temperature (°C)</label>
              <input name="tempMax" type="number" placeholder="e.g. 8" value={formData.tempMax} onChange={handleChange} required className="input-field border-secondary-200 focus:ring-secondary-500" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading || !account || !isCorrectNetwork} className="btn-primary px-8 py-2.5">
              {loading ? <Loader /> : 'Register Batch to Blockchain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
