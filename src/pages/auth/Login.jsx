import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getUserDetails } from '../../services/registrationService';
import { Web3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';
import { parseWeb3Error } from '../../utils/errorParser';
import Alert from '../../components/shared/Alert';
import Loader from '../../components/shared/Loader';

export default function Login() {
  const { account } = useContext(Web3Context);
  const { loginAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!account) {
      setError('Please connect your wallet first.');
      return;
    }

    try {
      setLoading(true);
      // Execute state-changing login transaction
      await loginUser(formData.email, formData.password, account);
      
      // On success, load user details
      const userDetails = await getUserDetails(formData.email, formData.password);
      
      // Store in auth context
      loginAuth({
        email: formData.email,
        role: userDetails.role,
        details: userDetails
      }, account);
      
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setError(parseWeb3Error(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>Login</h2>
      {error && <Alert message={error} type="error" />}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        
        <button type="submit" disabled={loading}>
          {loading ? <Loader /> : 'Login'}
        </button>
      </form>
    </div>
  );
}
