import { createContext, useState, useEffect, useContext } from 'react';
import { Web3Context } from './Web3Context';
import { getAllUserDetails } from '../services/registrationService';
import Web3 from 'web3';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { account, isWeb3Initialized } = useContext(Web3Context);

  useEffect(() => {
    const restoreSession = async () => {
      if (!isWeb3Initialized) return;
      
      if (!account) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      const savedEmail = localStorage.getItem(`auth_email_${account.toLowerCase()}`);
      
      if (savedEmail) {
        try {
          const allUsers = await getAllUserDetails();
          const web3 = new Web3();
          const emailHash = web3.utils.keccak256(savedEmail);
          
          const foundUser = allUsers.find(u => u.emailHash === emailHash);
          
          if (foundUser && foundUser.active) {
            setUser({
              email: savedEmail,
              role: foundUser.role,
              details: foundUser
            });
          } else {
            setUser(null);
            localStorage.removeItem(`auth_email_${account.toLowerCase()}`);
          }
        } catch (err) {
          console.error("Failed to restore session:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };

    restoreSession();
  }, [account, isWeb3Initialized]);

  const loginAuth = (userData, walletAddress) => {
    if (walletAddress) {
      localStorage.setItem(`auth_email_${walletAddress.toLowerCase()}`, userData.email);
    }
    setUser(userData);
  };

  const logoutAuth = () => {
    if (account) {
      localStorage.removeItem(`auth_email_${account.toLowerCase()}`);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAuth, logoutAuth, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
