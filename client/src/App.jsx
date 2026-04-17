import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, ShoppingCart, ArrowRightLeft, UserCheck, PackageMinus, LogOut } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import OperationsComponent from './components/Operations';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = 'http://localhost:5000/api';

function Sidebar({ user }) {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  ];

  if (user.role !== 'COMMANDER') {
    links.push({ name: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> });
  }
  
  links.push({ name: 'Transfers', path: '/transfers', icon: <ArrowRightLeft size={20} /> });

  if (user.role !== 'LOGISTICS') {
    links.push({ name: 'Assignments', path: '/assignments', icon: <UserCheck size={20} /> });
    links.push({ name: 'Expenditures', path: '/expenditures', icon: <PackageMinus size={20} /> });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto">
      <nav className="p-4 flex flex-col gap-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/20 text-yellow-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-yellow-600' : 'text-slate-400'}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Layout({ user, handleLogout, children }) {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 fixed top-0 w-full z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold text-secondary">Military Asset Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600">
            {user.username} 
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              {user.role}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-danger transition-colors rounded-full hover:bg-red-50"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16">
        <Sidebar user={user} />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    }
  }, [user]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout user={user} handleLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/purchases" element={<OperationsComponent user={user} forcedTab="PURCHASE" />} />
          <Route path="/transfers" element={<OperationsComponent user={user} forcedTab="TRANSFER" />} />
          <Route path="/assignments" element={<OperationsComponent user={user} forcedTab="ASSIGN" />} />
          <Route path="/expenditures" element={<OperationsComponent user={user} forcedTab="EXPEND" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
