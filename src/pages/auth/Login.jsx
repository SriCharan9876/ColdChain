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
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl text-primary-600 font-bold mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Access your cold chain dashboard</p>
        </div>
        
        {error && <Alert message={error} type="error" />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="name@company.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="input-field"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex justify-center">
            {loading ? <Loader /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
