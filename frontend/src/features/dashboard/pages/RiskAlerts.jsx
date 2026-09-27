import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { getMyApplications, getApplicationRisk } from '../../../api/client';
import { SectionHead } from '../../../components/common/SectionHead';
import { useTranslation } from '../../../contexts/TranslationContext';

export const RiskAlerts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [complianceScore, setComplianceScore] = useState(100);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        const apps = await getMyApplications();
        
        const riskPromises = apps.map(app => getApplicationRisk(app.id).then(risk => ({ app, risk })).catch(() => null));
        const results = await Promise.all(riskPromises);
        
        let allAlerts = [];
        let scorePenalty = 0;

        results.filter(Boolean).forEach(({ app, risk }) => {
          if (risk.factors && risk.factors.length > 0) {
            const hasIssues = risk.factors.some(f => f.impact > 0);
            if (hasIssues) {
               allAlerts.push({
                 id: app.id,
                 service_name: app.service_name || 'Application',
                 status: app.status || 'Pending',
                 factors: risk.factors.filter(f => f.impact > 0)
               });
               scorePenalty += risk.score;
            }
          }
        });

        setAlerts(allAlerts);
        setComplianceScore(Math.max(0, 100 - (scorePenalty / (results.length || 1))));

      } catch (err) {
        setError(err.message || 'Failed to fetch risk data');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const criticalCount = alerts.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      
      <div className="flex justify-between items-start mb-6">
        <SectionHead 
          eyebrow={t.riskPage.eyebrow}
          title={t.riskPage.title} 
          sub={t.riskPage.sub} 
        />
        {criticalCount > 0 && (
          <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full font-bold flex items-center gap-2">
            <AlertCircle size={18} />
            {criticalCount} {t.riskPage.critical}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          {alerts.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center text-emerald-800 flex flex-col items-center">
              <Shield size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t.riskPage.allClear}</h3>
              <p>{t.riskPage.noRisk}</p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div key={idx} className="bg-red-50/30 border border-red-100 rounded-2xl p-6 shadow-sm relative hover:shadow-md transition-shadow">
                <div className="absolute top-6 right-6 text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                  {t.riskPage.pending}
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  
                  <div className="flex-1 pr-24">
                    <p className="text-[10px] font-black tracking-widest text-red-500 uppercase mb-1">
                      {t.riskPage.appRisk} • {alert.service_name}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t.timeline.verification}</h3>
                    
                    <ul className="text-sm text-slate-600 space-y-2 mb-6">
                      {alert.factors.map((f, i) => (
                        <li key={i} className="flex gap-2">
                           <span className="text-red-500 mt-1">•</span> 
                           <span>{f.description}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex items-center justify-between border-t border-red-100/50 pt-4">
                      <div className="flex items-center gap-2 text-red-700 text-sm font-bold">
                        <Clock size={16} /> {t.riskPage.statusAction}
                      </div>
                      <button 
                        onClick={() => navigate('/app/applications')}
                        className="text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        {t.riskPage.reviewBtn} <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Compliance Score */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
              <Shield size={20} className="text-blue-600" />
              {t.riskPage.complianceScore}
            </div>
            
            <div className="flex items-end gap-1 mb-4">
              <span className="text-5xl font-black text-amber-500">{Math.round(complianceScore)}</span>
              <span className="text-slate-400 font-bold text-lg mb-1">/ 100</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.riskPage.scoreSub}
            </p>
          </div>

          <div className="bg-[#111827] rounded-2xl p-6 shadow-sm relative overflow-hidden text-white">
            <Shield size={120} className="absolute right-[-20px] bottom-[-20px] text-white/5 pointer-events-none" />
            
            <h3 className="text-lg font-bold mb-3 relative z-10">{t.riskPage.whyCompliant}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 relative z-10">
              {t.riskPage.whySub}
            </p>
            
            <button className="bg-white text-slate-900 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-slate-100 transition-colors relative z-10 w-full sm:w-auto">
              {t.riskPage.readGuide}
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};
