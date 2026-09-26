import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { C, inputCls, inputStyle } from '../constants/theme';
import { Btn } from '../components/common/Btn';
import { UserPlus } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

export function Register() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        business_name: businessName,
        email: email,
        created_at: new Date().toISOString()
      });

      navigate('/app/dashboard');
    } catch (err) {
      setError("Failed to register: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-md p-8 rounded shadow bg-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded flex items-center justify-center mb-3" style={{ background: C.navy }}>
            <UserPlus size={24} color={C.white} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: C.navyDeep }}>
            {lang === "mr" ? "गुंतवणूकदार नोंदणी" : lang === "hi" ? "निवेशक पंजीकरण" : "Investor Registration"}
          </h2>
          <p className="text-sm text-center mt-1" style={{ color: C.slate }}>
            {lang === "mr" ? "आपले व्यवसाय प्रोफाइल तयार करा" : lang === "hi" ? "अपना व्यापार प्रोफ़ाइल बनाएं" : "Create your business profile"}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {lang === "mr" ? "नोंदणीकृत व्यवसायाचे नाव" : lang === "hi" ? "पंजीकृत व्यापार का नाम" : "Registered Business Name"}
            </label>
            <input 
              type="text" 
              required
              className={inputCls} 
              style={inputStyle} 
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder={lang === "mr" ? "उदा. प्रवाह इंडस्ट्रीज" : lang === "hi" ? "उदा. प्रवाह इंडस्ट्रीज" : "e.g. Pravah Industries"}
            />
            <p className="text-xs mt-1" style={{ color: C.slate }}>
              {lang === "mr" 
                ? "दस्तऐवज पडताळणीसाठी हे नाव कायदेशीर कागदपत्रांशी जुळणे आवश्यक आहे."
                : lang === "hi"
                ? "दस्तावेज़ सत्यापन हेतु यह नाम कानूनी दस्तावेजों से मेल खाना चाहिए।"
                : "Must exactly match your legal documents for AI validation."}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {lang === "mr" ? "ईमेल पत्ता" : lang === "hi" ? "ईमेल पता" : "Email Address"}
            </label>
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
            <label className="block text-sm font-medium mb-1">
              {lang === "mr" ? "पासवर्ड" : lang === "hi" ? "पासवर्ड" : "Password"}
            </label>
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
            {loading 
              ? (lang === "mr" ? "प्रोफाइल तयार होत आहे..." : lang === "hi" ? "प्रोफ़ाइल बन रही है..." : "Creating Profile...") 
              : (lang === "mr" ? "नोंदणी करा" : lang === "hi" ? "पंजीकरण करें" : "Register")}
          </Btn>
        </form>
        
        <div className="mt-6 text-center text-sm" style={{ color: C.slate }}>
          {lang === "mr" ? "आधीच खाते आहे का? " : lang === "hi" ? "पहले से खाता है? " : "Already have an account? "}
          <Link to="/login" className="font-semibold underline" style={{ color: C.saffron }}>
            {lang === "mr" ? "येथे लॉगिन करा" : lang === "hi" ? "यहाँ लॉगिन करें" : "Login here"}
          </Link>
        </div>
      </div>
    </div>
  );
}
