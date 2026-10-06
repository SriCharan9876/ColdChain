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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Register</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone (10 digits)" value={formData.phone} onChange={handleChange} required minLength={10} maxLength={10} />
        
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="Manufacturer">Manufacturer</option>
          <option value="Wholesaler">Wholesaler</option>
          <option value="Distributor">Distributor</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Customer">Customer</option>
        </select>
        
        <input name="password" type="password" placeholder="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength={8} />
        
        <fieldset>
          <legend>Address</legend>
          <input name="street" placeholder="Street" value={formData.street} onChange={handleChange} required />
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
          <input name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} required />
        </fieldset>

        <label>
          <input name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} />
          I accept terms and conditions
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? <Loader /> : 'Register'}
        </button>
      </form>
    </div>
  );
}
