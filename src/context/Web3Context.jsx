import { createContext, useState, useEffect } from 'react';
import { TARGET_CHAIN_ID } from '../contracts/config';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [error, setError] = useState('');
  const [isWeb3Initialized, setIsWeb3Initialized] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(chainId);
      setIsCorrectNetwork(chainId === TARGET_CHAIN_ID);
    }
  };

  const connectWallet = async () => {
    setError('');
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkNetwork();
        }
      } catch (err) {
        setError(err.message || 'Failed to connect wallet');
      }
    } else {
      setError('MetaMask is not installed');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkNetwork();
        }
        setIsWeb3Initialized(true);
      }).catch((err) => {
        console.error(err);
        setIsWeb3Initialized(true);
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        setNetworkId(chainId);
        setIsCorrectNetwork(chainId === TARGET_CHAIN_ID);
      });
    } else {
      setIsWeb3Initialized(true);
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, networkId, isCorrectNetwork, error, connectWallet, isWeb3Initialized }}>
      {children}
    </Web3Context.Provider>
  );
};
