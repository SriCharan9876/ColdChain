import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-secondary-100 text-secondary-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { account, connectWallet, isCorrectNetwork, error } = useContext(Web3Context);
  const { user, logoutAuth, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAuth();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 flex-wrap gap-y-4">
          
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl leading-none tracking-tighter">C</span>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 hidden sm:block">
                Cold Chain
              </h1>
            </div>
            
            <div className="hidden md:flex ml-6 space-x-1">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/verify">Verify</NavLink>
              <NavLink to="/audit">Audit</NavLink>
              <NavLink to="/track">Track</NavLink>
              <NavLink to="/record-temperature">Log Temp</NavLink>

              {user && (
                <>
                  {user.role === 'Manufacturer' && (
                    <>
                      <NavLink to="/add-medicine">Add Med</NavLink>
                      <NavLink to="/register-logger">Reg Logger</NavLink>
                    </>
                  )}
                  
                  {(user.role === 'Wholesaler' || user.role === 'Pharmacy') && (
                    <NavLink to="/buy">Buy</NavLink>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">{error}</span>}
            {!isCorrectNetwork && <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded border border-orange-200">Wrong Network!</span>}
            
            {account ? (
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-mono text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {account.slice(0,6)}...{account.slice(-4)}
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-outline text-sm py-1.5 px-3">
                Connect Wallet
              </button>
            )}
            
            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {authLoading ? (
              <span className="text-sm text-slate-500 animate-pulse">Auth...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold text-slate-900 leading-tight">Profile</span>
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{user.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 group-hover:bg-primary-200 transition-colors">
                    {user.role.charAt(0)}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-2 py-1">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
