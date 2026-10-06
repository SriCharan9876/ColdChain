const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const dirs = [
  'assets',
  'components/layout',
  'components/medicine',
  'components/temperature',
  'components/shared',
  'pages/auth',
  'pages/dashboard',
  'pages/medicine',
  'pages/profile',
  'contracts',
  'services',
  'context',
  'utils'
];

dirs.forEach(d => fs.mkdirSync(path.join(baseDir, d), { recursive: true }));

const files = {
  'components/layout/Navbar.jsx': `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nexport default function Navbar() {\n  return (\n    <nav>\n      <h1>Cold Chain System</h1>\n      <Link to="/">Dashboard</Link>\n    </nav>\n  );\n}`,
  'components/layout/Sidebar.jsx': `export default function Sidebar() { return <aside>Sidebar</aside>; }`,
  'components/layout/Layout.jsx': `import Navbar from './Navbar';\nimport Sidebar from './Sidebar';\n\nexport default function Layout({ children }) {\n  return (\n    <div>\n      <Navbar />\n      <div style={{ display: 'flex' }}>\n        <Sidebar />\n        <main style={{ flex: 1, padding: '1rem' }}>{children}</main>\n      </div>\n    </div>\n  );\n}`,
  'components/medicine/MedicineCard.jsx': `export default function MedicineCard() { return <div>Medicine Card</div>; }`,
  'components/medicine/MedicineDetails.jsx': `export default function MedicineDetails() { return <div>Medicine Details</div>; }`,
  'components/medicine/ColdChainStatus.jsx': `export default function ColdChainStatus() { return <div>Cold Chain Status</div>; }`,
  'components/temperature/TemperatureChart.jsx': `export default function TemperatureChart() { return <div>Temperature Chart</div>; }`,
  'components/temperature/TemperatureHistory.jsx': `export default function TemperatureHistory() { return <div>Temperature History</div>; }`,
  'components/shared/QRScanner.jsx': `export default function QRScanner() { return <div>QR Scanner Placeholder</div>; }`,
  'components/shared/Alert.jsx': `export default function Alert({ message }) { return <div>Alert: {message}</div>; }`,
  'components/shared/Loader.jsx': `export default function Loader() { return <div>Loading...</div>; }`,
  
  'pages/auth/Login.jsx': `export default function Login() { return <div>Login Page</div>; }`,
  'pages/auth/Register.jsx': `export default function Register() { return <div>Register Page</div>; }`,
  'pages/dashboard/Dashboard.jsx': `export default function Dashboard() { return <div>Minimal Dashboard Placeholder</div>; }`,
  'pages/medicine/AddMedicine.jsx': `export default function AddMedicine() { return <div>Add Medicine Page</div>; }`,
  'pages/medicine/TrackMedicine.jsx': `export default function TrackMedicine() { return <div>Track Medicine Page</div>; }`,
  'pages/medicine/BuyMedicine.jsx': `export default function BuyMedicine() { return <div>Buy Medicine Page</div>; }`,
  'pages/profile/Profile.jsx': `export default function Profile() { return <div>Profile Page</div>; }`,

  'contracts/config.js': `export const MEDICINE_CONTRACT_ADDRESS = import.meta.env.VITE_MEDICINE_CONTRACT_ADDRESS;\nexport const REGISTRATION_CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRATION_CONTRACT_ADDRESS;`,
  
  'services/web3Provider.js': `// Web3 Provider abstraction\nexport const getWeb3 = async () => {};`,
  'services/medicineService.js': `// MedicineManagement contract calls\nexport const addMedicine = async () => {};`,
  'services/registrationService.js': `// RegistrationLogin contract calls\nexport const login = async () => {};`,

  'context/AuthContext.jsx': `import React, { createContext } from 'react';\n\nexport const AuthContext = createContext();\n\nexport const AuthProvider = ({ children }) => {\n  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;\n};`,
  'context/Web3Context.jsx': `import React, { createContext } from 'react';\n\nexport const Web3Context = createContext();\n\nexport const Web3Provider = ({ children }) => {\n  return <Web3Context.Provider value={{}}>{children}</Web3Context.Provider>;\n};`,

  'utils/dateUtils.js': `export const formatTimestamp = (ts) => new Date(Number(ts) * 1000).toLocaleString();`,
  'utils/medicineStates.js': `export const MEDICINE_STATES = { 0: 'Manufactured', 1: 'InStock', 2: 'Sold', 3: 'Expired' };`,
  'utils/errorParser.js': `export const parseWeb3Error = (error) => error?.message || 'Unknown error';`,

  'App.jsx': `import React from 'react';\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Layout from './components/layout/Layout';\nimport Dashboard from './pages/dashboard/Dashboard';\nimport Login from './pages/auth/Login';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Layout>\n        <Routes>\n          <Route path="/" element={<Dashboard />} />\n          <Route path="/login" element={<Login />} />\n        </Routes>\n      </Layout>\n    </BrowserRouter>\n  );\n}`,
  
  'main.jsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport { Web3Provider } from './context/Web3Context';\nimport { AuthProvider } from './context/AuthContext';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <Web3Provider>\n      <AuthProvider>\n        <App />\n      </AuthProvider>\n    </Web3Provider>\n  </React.StrictMode>\n);`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filepath), content);
}
console.log('Scaffolding complete');
