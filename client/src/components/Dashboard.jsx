import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Shield, Target } from 'lucide-react';

export default function Dashboard({ user }) {
  const [data, setData] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  // Date tracking placeholders if needed for UI, currently aggregated on server
  const [bases, setBases] = useState([]);
  const [selectedPopup, setSelectedPopup] = useState(null);

  useEffect(() => {
    fetchBases();
    fetchDashboard();
  }, [filterBase]);

  const fetchBases = async () => {
    try {
      const res = await axios.get('/bases');
      setBases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const url = filterBase ? `/inventory/dashboard?baseId=${filterBase}` : '/inventory/dashboard';
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = data.filter(d => filterAssetType ? d.assetType === filterAssetType : true);

  const totals = filteredData.reduce((acc, curr) => {
    acc.closing += curr.closingBalance;
    acc.net += curr.netMovement;
    acc.expended += curr.expended;
    acc.assigned += curr.assigned;
    return acc;
  }, { closing: 0, net: 0, expended: 0, assigned: 0 });

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Filters Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Dashboard Metrics</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          {user.role === 'ADMIN' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600 mb-0">Base:</label>
              <select 
                value={filterBase} 
                onChange={e => setFilterBase(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All Bases</option>
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600 mb-0">Asset Type:</label>
            <select 
              value={filterAssetType} 
              onChange={e => setFilterAssetType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="WEAPON">Weapons</option>
              <option value="AMMUNITION">Ammunition</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
             <label className="text-sm font-semibold text-slate-600 mb-0">Date:</label>
             <input type="date" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closing Balance</span>
            <div className="p-2 bg-blue-50 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
          </div>
          <span className="text-3xl font-bold text-slate-800">{totals.closing}</span>
        </div>
        
        <div 
          onClick={() => setSelectedPopup('netMovement')}
          className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-yellow-400 flex flex-col hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Movement</span>
            <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors"><TrendingUp className="w-5 h-5 text-yellow-600" /></div>
          </div>
          <span className="text-3xl font-bold text-yellow-600">{totals.net > 0 ? '+' : ''}{totals.net}</span>
          <span className="text-xs text-slate-400 mt-2">Click for breakdown ↗</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assigned</span>
            <div className="p-2 bg-green-50 rounded-lg"><Shield className="w-5 h-5 text-green-600" /></div>
          </div>
          <span className="text-3xl font-bold text-green-600">{totals.assigned}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expended</span>
            <div className="p-2 bg-red-50 rounded-lg"><Target className="w-5 h-5 text-red-600" /></div>
          </div>
          <span className="text-3xl font-bold text-red-600">{totals.expended}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Asset Distribution & Usage</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="assetName" stroke="#64748b" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="closingBalance" name="Closing Balance" fill="#facc15" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="assigned" name="Assigned" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="expended" name="Expended" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Inventory Ledger Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Base</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-center">Purchases</th>
                <th className="px-6 py-4 text-center">Transfers In</th>
                <th className="px-6 py-4 text-center">Transfers Out</th>
                <th className="px-6 py-4 text-center">Assigned</th>
                <th className="px-6 py-4 text-center">Expended</th>
                <th className="px-6 py-4 text-center">Net Mvt</th>
                <th className="px-6 py-4 text-right">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.base}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{row.assetName}</div>
                    <div className="text-xs text-slate-400 mt-1">{row.assetType}</div>
                  </td>
                  <td className="px-6 py-4 text-center">{row.purchases}</td>
                  <td className="px-6 py-4 text-center">{row.transfersIn}</td>
                  <td className="px-6 py-4 text-center">{row.transfersOut}</td>
                  <td className="px-6 py-4 text-center">{row.assigned}</td>
                  <td className="px-6 py-4 text-center">{row.expended}</td>
                  <td className={`px-6 py-4 text-center font-bold ${row.netMovement >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.netMovement > 0 ? '+' : ''}{row.netMovement}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 text-base">{row.closingBalance}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-500">No ledger tracking available for this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedPopup === 'netMovement' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl animate-fade-in flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-800">Net Movement Breakdown</h2>
              <button 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                onClick={() => setSelectedPopup(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-0 overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Asset Name</th>
                    <th className="px-6 py-4 text-right">Purchases</th>
                    <th className="px-6 py-4 text-right">Transfers In</th>
                    <th className="px-6 py-4 text-right">Transfers Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.assetName} <span className="text-slate-400 font-normal">({row.base})</span></td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">+{row.purchases}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">+{row.transfersIn}</td>
                      <td className="px-6 py-4 text-right text-red-500 font-medium">-{row.transfersOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
