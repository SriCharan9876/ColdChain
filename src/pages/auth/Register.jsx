import { useState, useContext } from 'react';
import { registerUser } from '../../services/registrationService';
import { Web3Context } from '../../context/Web3Context';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

export default function Register() {
  const { account } = useContext(Web3Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Customer',
    password: '',
    terms: false,
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!account) {
      setError('Please connect your wallet first.');
      return;
    }

    if (!formData.terms) {
      setError('You must accept the terms and conditions.');
      return;
    }

    try {
      setLoading(true);
      const userInput = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
        terms: formData.terms,
        addressDetails: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      };

      await registerUser(userInput, account);
      setSuccess('Registration successful! You can now login.');
      // clear form if desired, or redirect
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl text-primary-600 font-bold mb-2">Create Account</h2>
          <p className="text-slate-500 text-sm">Join the Cold Chain System</p>
        </div>
        
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">User ID</label>
              <input name="id" placeholder="e.g. WH-101" value={formData.id} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="Manufacturer">Manufacturer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Distributor">Distributor</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            
            <div>
              <label className="label-text">First Name</label>
              <input name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Last Name</label>
              <input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required className="input-field" />
            </div>
            
            <div>
              <label className="label-text">Email</label>
              <input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input name="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required minLength={10} maxLength={10} className="input-field" />
            </div>
            
            <div className="md:col-span-2">
              <label className="label-text">Password</label>
              <input name="password" type="password" placeholder="Min 8 characters" value={formData.password} onChange={handleChange} required minLength={8} className="input-field" />
            </div>
          </div>

          <hr className="border-slate-200" />
          
          {/* Address Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-text">Street Address</label>
                <input name="street" placeholder="123 Main St" value={formData.street} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="label-text">City</label>
                <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">State</label>
                  <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="label-text">Zip</label>
                  <input name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} required className="input-field" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              name="terms" 
              type="checkbox" 
              id="terms-checkbox"
              checked={formData.terms} 
              onChange={handleChange} 
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-slate-600 cursor-pointer">
              I accept the <span className="text-primary-600 font-medium">Terms and Conditions</span>
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center py-2.5 mt-2">
            {loading ? <Loader /> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
