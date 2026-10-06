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

  if (!user) return <div style={{ padding: '2rem' }}>Please login to add a medicine.</div>;
  if (user.role !== 'Manufacturer') return <div style={{ padding: '2rem' }}>Unauthorized: Only manufacturers can add medicines.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Add New Medicine</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="manufacturerId" placeholder="Manufacturer ID" value={user.details.id} readOnly disabled />
        <input name="medicineName" placeholder="Medicine Name" value={formData.medicineName} onChange={handleChange} required />
        <input name="medicineId" placeholder="Medicine ID (Unique)" value={formData.medicineId} onChange={handleChange} required />
        <input name="medicineType" placeholder="Medicine Type (e.g., Vaccine)" value={formData.medicineType} onChange={handleChange} required />
        <input name="strength" placeholder="Strength (e.g., 500mg)" value={formData.strength} onChange={handleChange} required />
        <input name="batchNumber" placeholder="Batch Number" value={formData.batchNumber} onChange={handleChange} required />
        <input name="storageConditions" placeholder="Storage Conditions" value={formData.storageConditions} onChange={handleChange} required />
        
        <label>Manufacture Date</label>
        <input name="manufactureDate" type="date" value={formData.manufactureDate} onChange={handleChange} required />
        
        <label>Expiry Date</label>
        <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required />
        
        <input name="price" type="number" placeholder="Base Price (wei or units)" value={formData.price} onChange={handleChange} required min="0" />
        <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required min="1" />
        
        <input name="tempMin" type="number" placeholder="Minimum Temperature (°C)" value={formData.tempMin} onChange={handleChange} required />
        <input name="tempMax" type="number" placeholder="Maximum Temperature (°C)" value={formData.tempMax} onChange={handleChange} required />

        <button type="submit" disabled={loading || !account || !isCorrectNetwork}>
          {loading ? <Loader /> : 'Add Medicine'}
        </button>
      </form>
    </div>
  );
}
