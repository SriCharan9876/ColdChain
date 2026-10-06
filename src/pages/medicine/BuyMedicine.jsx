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
    return <div className="p-8 text-center text-red-500">Unauthorized: Only Wholesalers and Pharmacies can buy medicine.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Marketplace</h2>
        <p className="text-slate-500 mt-1">Purchase available medicine stock. You are logged in as a <span className="font-semibold text-primary-600">{user.role}</span>.</p>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {purchaseSuccess && <Alert message={purchaseSuccess} type="success" />}

      {loading ? (
        <div className="flex justify-center p-12"><Loader /></div>
      ) : medicines.length === 0 ? (
        <div className="card text-center p-12">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Inventory Available</h3>
          <p className="text-slate-500">There is currently no medicine stock available for your role to purchase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map(med => (
            <div key={med.basic.medicineId} className="card hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{med.basic.medicineName}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">ID: {med.basic.medicineId}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-secondary-100 text-secondary-800 rounded-full">
                  {MEDICINE_STATES[Number(med.spec.state)]}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Price per unit</span>
                  <span className="text-sm font-semibold text-slate-700">{med.spec.price.toString()} wei</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Available Stock</span>
                  <span className="text-sm font-semibold text-primary-600">{med.spec.quantity.toString()} units</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                <div className="relative w-1/3">
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    min="1" 
                    max={Number(med.spec.quantity)}
                    value={purchaseQuantity[med.basic.medicineId] || ''}
                    onChange={(e) => setPurchaseQuantity(prev => ({ ...prev, [med.basic.medicineId]: e.target.value }))}
                    className="input-field py-2 text-center"
                  />
                </div>
                <button 
                  onClick={() => handlePurchase(med)} 
                  disabled={purchasingId === med.basic.medicineId || !purchaseQuantity[med.basic.medicineId]}
                  className="btn-primary flex-1 py-2"
                >
                  {purchasingId === med.basic.medicineId ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
