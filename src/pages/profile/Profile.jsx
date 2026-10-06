import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Web3Context } from '../../context/Web3Context';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { account, isCorrectNetwork, networkId } = useContext(Web3Context);

  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please login to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Profile</h2>
        <p className="text-slate-500 mt-1">Manage your account details and wallet connection.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
              {user.details.firstName.charAt(0)}{user.details.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.details.firstName} {user.details.lastName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user.role}
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.details.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                  {user.details.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-slate-500 text-sm block mb-1">Email</span>
              <strong className="text-slate-900">{user.details.email}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Phone</span>
              <strong className="text-slate-900">{user.details.phone}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">System ID (Reg ID)</span>
              <strong className="text-slate-900 font-mono text-sm">{user.details.id}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-sm block mb-1">Company Address</span>
              <strong className="text-slate-900">{user.details.companyAddress}</strong>
            </div>
          </div>
        </div>
        
        <div className="card h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Wallet Connection</h3>
          <div className="space-y-4">
            <div>
              <span className="text-slate-500 text-sm block mb-1">Status</span>
              {isCorrectNetwork ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md w-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Connected to Sepolia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-md w-full">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Network Error
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Connected Address</span>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <code className="text-xs text-slate-700 break-all">{account || 'Not connected'}</code>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Network ID</span>
              <strong className="text-slate-900">{networkId || 'Unknown'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
