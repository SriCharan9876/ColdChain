import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { account, connectWallet, isCorrectNetwork, error } = useContext(Web3Context);
  const { user, logoutAuth, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAuth();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#e0e0e0', borderBottom: '2px solid #ccc', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, marginRight: '1rem' }}>Cold Chain System</h2>
        
        <Link to="/">Dashboard</Link>
        <Link to="/verify">Verify QR/ID</Link>
        <Link to="/audit">Audit View</Link>
        <Link to="/track">Track Medicine</Link>
        <Link to="/record-temperature">Log Temp</Link>

        {user && (
          <>
            {user.role === 'Manufacturer' && (
              <>
                <Link to="/add-medicine">Add Medicine</Link>
                <Link to="/register-logger">Reg Logger</Link>
              </>
            )}
            
            {(user.role === 'Wholesaler' || user.role === 'Pharmacy') && (
              <Link to="/buy">Buy Medicine</Link>
            )}
            
            <Link to="/profile">Profile</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {error && <span style={{ color: 'red' }}>{error}</span>}
        {!isCorrectNetwork && <span style={{ color: 'orange' }}>Wrong Network!</span>}
        
        {account ? (
          <span style={{ fontWeight: 'bold' }}>Wallet: {account.slice(0,6)}...{account.slice(-4)}</span>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        
        {authLoading ? (
          <span>Authenticating...</span>
        ) : user ? (
          <>
            <span style={{ fontWeight: 'bold', color: '#1565c0' }}>[{user.role}]</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
