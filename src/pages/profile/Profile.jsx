import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { account, isCorrectNetwork, networkId } = useContext(Web3Context);

  if (!user) {
    return <div style={{ padding: '2rem' }}>Please login to view your profile.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>User Profile</h2>
      
      <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Personal Details</h3>
          <p><strong>Name:</strong> {user.details.firstName} {user.details.lastName}</p>
          <p><strong>Email:</strong> {user.details.email}</p>
          <p><strong>Phone:</strong> {user.details.phone}</p>
          <p><strong>Role:</strong> <span style={{ background: '#e3f2fd', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{user.role}</span></p>
          <p><strong>System ID (Reg ID):</strong> {user.details.id}</p>
          <p><strong>Company Address:</strong> {user.details.companyAddress}</p>
          <p><strong>Account Status:</strong> {user.details.active ? 'Active' : 'Inactive'}</p>
        </div>
        
        <div style={{ paddingTop: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Wallet Connection</h3>
          <p>
            <strong>Connected Wallet:</strong> {account || 'Not connected'}
          </p>
          <p>
            <strong>Network ID:</strong> {networkId || 'Unknown'} 
          </p>
          <p>
            <strong>Network Status:</strong> 
            {isCorrectNetwork 
              ? <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '10px' }}>✓ Correct Network (Sepolia)</span>
              : <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '10px' }}>✗ Wrong Network</span>
            }
          </p>
        </div>
        
      </div>
    </div>
  );
}
