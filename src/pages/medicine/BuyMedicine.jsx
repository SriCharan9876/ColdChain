import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';
import { getAllMedicines, purchaseMedicine } from '../../services/medicineService';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

const MEDICINE_STATES = ['Manufactured', 'InStock', 'Sold', 'Expired'];

export default function BuyMedicine() {
  const { user } = useContext(AuthContext);
  const { account, isCorrectNetwork } = useContext(Web3Context);
  
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [purchaseQuantity, setPurchaseQuantity] = useState({});
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  const fetchMedicines = useCallback(async (isActive) => {
    try {
      if (isActive) setLoading(true);
      const allMeds = await getAllMedicines();
      const availableMeds = allMeds.filter(med => {
        if (!user) return false;
        if (user.role === 'Wholesaler' && Number(med.spec.state) === 0) return true;
        if (user.role === 'Pharmacy' && Number(med.spec.state) === 1) return true;
        return false;
      });
      if (isActive) {
        setMedicines(availableMeds);
        setLoading(false);
      }
    } catch (err) {
      if (isActive) {
        setError(parseWeb3Error(err) || 'Failed to load medicines.');
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (user && (user.role === 'Wholesaler' || user.role === 'Pharmacy')) {
      fetchMedicines(active);
    } else {
      setTimeout(() => { if (active) setLoading(false); }, 0);
    }
    return () => { active = false; };
  }, [user, fetchMedicines]);

  const handlePurchase = async (medicine) => {
    setError('');
    setPurchaseSuccess('');
    
    if (!account || !isCorrectNetwork) {
      setError('Please connect MetaMask and switch to Sepolia network.');
      return;
    }

    const qty = parseInt(purchaseQuantity[medicine.basic.medicineId] || 0, 10);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    const availableQty = Number(medicine.spec.quantity);
    if (qty > availableQty) {
      setError('Not enough stock available.');
      return;
    }

    const buyerType = user.role === 'Wholesaler' ? 1 : 2;
    const buyerId = user.details.id;
    const unitPrice = BigInt(medicine.spec.price);
    const totalValue = unitPrice * BigInt(qty);

    try {
      setPurchasingId(medicine.basic.medicineId);
      
      await purchaseMedicine(
        medicine.basic.medicineId,
        qty.toString(),
        buyerType,
        buyerId,
        totalValue.toString(),
        account
      );
      
      setPurchaseSuccess(`Successfully purchased ${qty} units of ${medicine.basic.medicineName}.`);
      setPurchaseQuantity(prev => ({ ...prev, [medicine.basic.medicineId]: '' }));
      
      // Refresh inventory
      fetchMedicines();
      
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setPurchasingId(null);
    }
  };

  if (!user || (user.role !== 'Wholesaler' && user.role !== 'Pharmacy')) {
    return <div style={{ padding: '2rem' }}>Unauthorized: Only Wholesalers and Pharmacies can buy medicine.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h2>Buy Medicine</h2>
      <p>Purchase available medicine stock. You are logged in as a <strong>{user.role}</strong>.</p>
      
      {error && <Alert message={error} type="error" />}
      {purchaseSuccess && <Alert message={purchaseSuccess} type="success" />}

      {loading ? (
        <Loader />
      ) : medicines.length === 0 ? (
        <p>No available medicine for your role to purchase at this time.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {medicines.map(med => (
            <div key={med.basic.medicineId} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{med.basic.medicineName}</h3>
              <p><strong>ID:</strong> {med.basic.medicineId}</p>
              <p><strong>State:</strong> {MEDICINE_STATES[Number(med.spec.state)]}</p>
              <p><strong>Price per unit:</strong> {med.spec.price.toString()} (wei)</p>
              <p><strong>Available Stock:</strong> {med.spec.quantity.toString()}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <input 
                  type="number" 
                  placeholder="Qty" 
                  min="1" 
                  max={Number(med.spec.quantity)}
                  value={purchaseQuantity[med.basic.medicineId] || ''}
                  onChange={(e) => setPurchaseQuantity(prev => ({ ...prev, [med.basic.medicineId]: e.target.value }))}
                  style={{ width: '80px', padding: '0.5rem' }}
                />
                <button 
                  onClick={() => handlePurchase(med)} 
                  disabled={purchasingId === med.basic.medicineId}
                  style={{ flex: 1 }}
                >
                  {purchasingId === med.basic.medicineId ? 'Purchasing...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
