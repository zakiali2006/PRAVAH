import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { C, inputCls, inputStyle } from '../constants/theme';
import { Btn } from '../components/common/Btn';
import { LogIn, Building2, Briefcase, ShieldCheck } from 'lucide-react';
import { ROLES } from '../config/roles';

export function Login() {
  const [activeRole, setActiveRole] = useState(ROLES.INVESTOR);
  const [email, setEmail] = useState('investor@demo.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const roleConfigs = [
    { id: ROLES.INVESTOR, label: 'Investor', email: 'investor@demo.com', icon: <Building2 size={18} className="mr-2" /> },
    { id: ROLES.OFFICER, label: 'Department Officer', email: 'officer@demo.com', icon: <Briefcase size={18} className="mr-2" /> },
    { id: ROLES.POLICY_ADMIN, label: 'Policy Admin', email: 'policy@demo.com', icon: <ShieldCheck size={18} className="mr-2" /> },
  ];

  // Update email automatically when role tab is clicked
  useEffect(() => {
    const config = roleConfigs.find(r => r.id === activeRole);
    if (config) {
      setEmail(config.email);
      setPassword('PravahTest!2026');
      setError('');
    }
  }, [activeRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, activeRole);
      
      const roleToPath = {
        [ROLES.INVESTOR]: '/app/dashboard',
        [ROLES.OFFICER]: '/officer/dashboard',
        [ROLES.POLICY_ADMIN]: '/policy/dashboard',
      };
      
      const basePath = roleToPath[user.role] || '/unauthorized';
      
      if (location.pathname === '/login' || location.pathname === '/') {
        navigate(basePath);
      }
    } catch (err) {
      setError("Failed to log in: " + (err.response?.data?.message || err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8" style={{ background: C.bg }}>
      <div className="w-full max-w-lg p-8 rounded shadow-lg bg-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded flex items-center justify-center mb-3" style={{ background: C.navy }}>
            <LogIn size={24} color={C.white} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: C.navyDeep }}>PRAVAH Secure Login</h2>
          <p className="text-sm mt-1" style={{ color: C.slate }}>Select your role to continue</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          {roleConfigs.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
                activeRole === role.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {role.icon}
              {role.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              className={inputCls}
              style={inputStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className={inputCls}
              style={inputStyle}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Btn className="w-full mt-4" disabled={loading}>
            {loading ? "Logging in..." : `Login as ${roleConfigs.find(r => r.id === activeRole)?.label}`}
          </Btn>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: C.slate }}>
          Don't have an account? <Link to="/register" className="font-semibold underline" style={{ color: C.saffron }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
