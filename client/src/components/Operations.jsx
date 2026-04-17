import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Operations({ user, forcedTab }) {
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);

  // Form State
  const [assetId, setAssetId] = useState('');
  const [fromBaseId, setFromBaseId] = useState(user && user.role !== 'ADMIN' && user.baseId ? user.baseId : '');
  const [toBaseId, setToBaseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMasters();
    setMessage({ text: '', type: '' }); // reset messages when changing tabs
  }, [forcedTab]); // refresh state logic if it were strictly needed, but let's just clear warnings

  const fetchMasters = async () => {
    try {
      const bRes = await axios.get('/bases');
      setBases(bRes.data);
      const aRes = await axios.get('/assets');
      setAssets(aRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const activeTab = forcedTab;

  const handleTransaction = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      let endpoint = '';
      let payload = {
        assetId: parseInt(assetId),
        quantity: parseInt(quantity),
        reference
      };

      if (activeTab === 'PURCHASE') {
        endpoint = '/transactions/purchase';
        payload.toBaseId = parseInt(toBaseId);
      } else if (activeTab === 'TRANSFER') {
        endpoint = '/transactions/transfer';
        payload.fromBaseId = parseInt(fromBaseId);
        payload.toBaseId = parseInt(toBaseId);
      } else if (activeTab === 'ASSIGN' || activeTab === 'EXPEND') {
        endpoint = '/transactions/assign';
        payload.fromBaseId = parseInt(fromBaseId);
        payload.type = activeTab;
      }

      await axios.post(endpoint, payload);
      setMessage({ text: 'Transaction recorded successfully!', type: 'success' });
      setQuantity('');
      setReference('');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Transaction failed', type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-bold text-secondary mb-8 capitalize">{activeTab.toLowerCase()} Process</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 capitalize">{activeTab.toLowerCase()} Asset Configuration</h2>
        
        {message.text && (
          <div className={`p-4 rounded-lg border mb-6 text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleTransaction} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Asset</label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              value={assetId} 
              onChange={e => setAssetId(e.target.value)} 
              required
            >
              <option value="">Select Asset...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
            </select>
          </div>

          {(activeTab === 'TRANSFER' || activeTab === 'ASSIGN' || activeTab === 'EXPEND') && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">From Base</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-slate-100 disabled:text-slate-500"
                value={fromBaseId} 
                onChange={e => setFromBaseId(e.target.value)} 
                required 
                disabled={user.role !== 'ADMIN' && user.baseId}
              >
                <option value="">Select Base...</option>
                {bases.map(b => (
                   <option key={b.id} value={b.id} hidden={user.role !== 'ADMIN' && b.id !== user.baseId}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {(activeTab === 'PURCHASE' || activeTab === 'TRANSFER') && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">To Base</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                value={toBaseId} 
                onChange={e => setToBaseId(e.target.value)} 
                required
              >
                 <option value="">Select Base...</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Quantity</label>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">{activeTab === 'ASSIGN' ? 'Assign To (Personnel Name)' : 'Reference / Remarks'}</label>
            <input 
              type="text" 
              value={reference} 
              onChange={e => setReference(e.target.value)} 
              placeholder="e.g. Inv-1234 or Sgt. John Doe"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-yellow-950 font-bold hover:bg-primary-hover py-3 rounded-lg transition-transform hover:-translate-y-0.5 mt-4"
          >
            Submit {activeTab}
          </button>
        </form>
      </div>
    </div>
  );
}
