import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { C, inputCls, inputStyle } from '../constants/theme';
import { Btn } from '../components/common/Btn';
import { LogIn } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('demo@gmail.com');
  const [password, setPassword] = useState('Pravah@2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  React.useEffect(() => {
    // Force set on mount to bypass React Fast Refresh keeping old state
    setEmail('demo@gmail.com');
    setPassword('Pravah@2026!');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'officer') {
        navigate('/officer');
      } else {
        // If they are on the standalone login page or root, send to dashboard.
        // If they are already on a private route (like /business), stay there!
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError("Failed to log in: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-md p-8 rounded shadow bg-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded flex items-center justify-center mb-3" style={{ background: C.navy }}>
            <LogIn size={24} color={C.white} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: C.navyDeep }}>Investor Login</h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>
          <Btn className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Login to PRAVAH"}
          </Btn>
        </form>
        
        <div className="mt-6 text-center text-sm" style={{ color: C.slate }}>
          Don't have an account? <Link to="/register" className="font-semibold underline" style={{ color: C.saffron }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
