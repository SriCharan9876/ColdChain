
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AddMedicine from './pages/medicine/AddMedicine';
import TrackMedicine from './pages/medicine/TrackMedicine';
import RegisterLogger from './pages/medicine/RegisterLogger';
import RecordTemperature from './pages/medicine/RecordTemperature';
import BuyMedicine from './pages/medicine/BuyMedicine';
import VerifyQR from './pages/medicine/VerifyQR';
import AuditView from './pages/medicine/AuditView';
import Profile from './pages/profile/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-medicine" element={<AddMedicine />} />
          <Route path="/track" element={<TrackMedicine />} />
          <Route path="/register-logger" element={<RegisterLogger />} />
          <Route path="/record-temperature" element={<RecordTemperature />} />
          <Route path="/buy" element={<BuyMedicine />} />
          <Route path="/verify" element={<VerifyQR />} />
          <Route path="/audit" element={<AuditView />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
