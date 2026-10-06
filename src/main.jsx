import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Provider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Web3Provider>
  </React.StrictMode>
);
