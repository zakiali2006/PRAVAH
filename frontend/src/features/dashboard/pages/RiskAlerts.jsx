import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertOctagon, CheckCircle2, FileWarning, ArrowRight, ShieldAlert, Clock, Bell, Loader2 } from 'lucide-react';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import apiClient from '../../../api/client';

export function RiskAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complianceScore, setComplianceScore] = useState(100);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        // Fetch all applications for the current investor
        const appsRes = await apiClient.get('/applications/me');
        const apps = appsRes.data;
        
        let allAlerts = [];
        let totalRiskScore = 0;
        let riskEvaluatedApps = 0;

        for (const app of apps) {
          try {
            // Get AI-powered risk score for each application
            const riskRes = await apiClient.get(`/applications/${app.id}/risk`);
            const riskData = riskRes.data;
            
            if (riskData) {
              totalRiskScore += riskData.score;
              riskEvaluatedApps += 1;

              if (riskData.factors && riskData.factors.length > 0) {
                const appAlerts = riskData.factors.map((f, index) => {
                  let severity = 'low';
                  if (f.impact >= 30) severity = 'critical';
                  else if (f.impact >= 20) severity = 'high';
                  else if (f.impact >= 10) severity = 'medium';

                  return {
                    id: `${app.id}-${index}`,
                    appId: app.id,
                    application_code: app.application_id,
                    severity,
                    title: f.factor,
                    description: f.reason,
                    dueDate: 'Action Required',
                    type: 'Application Risk',
                    status: 'Pending',
                  };
                });
                allAlerts = [...allAlerts, ...appAlerts];
              }
            }
          } catch (e) {
            console.warn(`Could not fetch risk for app ${app.id}`, e);
          }
        }
        
        // Sort alerts by highest severity first
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        allAlerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
        
        setAlerts(allAlerts);

        // Calculate average compliance score (100 - average risk)
        if (riskEvaluatedApps > 0) {
          const avgRisk = totalRiskScore / riskEvaluatedApps;
          setComplianceScore(Math.max(0, Math.round(100 - avgRisk)));
        }

      } catch (err) {
        console.error("Failed to fetch applications for risk data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon size={24} className="text-red-600" />;
      case 'high':
        return <AlertTriangle size={24} className="text-orange-600" />;
      case 'medium':
        return <FileWarning size={24} className="text-amber-600" />;
      case 'low':
        return <Bell size={24} className="text-blue-600" />;
      default:
        return <ShieldAlert size={24} className="text-slate-600" />;
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHead 
          eyebrow="Compliance & Safety" 
          title="Risk & Compliance Alerts" 
          sub="Monitor AI-detected deficiencies and regulatory risks affecting your applications." 
        />
        {!loading && alerts.length > 0 && (
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-red-100">
                <AlertOctagon size={18} /> {criticalCount} Critical
              </div>
            )}
            {highCount > 0 && (
              <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-orange-100">
                <AlertTriangle size={18} /> {highCount} High Risk
              </div>
            )}
            {criticalCount === 0 && highCount === 0 && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-emerald-100">
                <CheckCircle2 size={18} /> All Clear
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Alerts List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Analyzing applications and documents for risk factors...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
              <h3 className="font-bold text-xl text-slate-800 mb-2">No Active Risk Alerts</h3>
              <p>Your applications and documents are fully compliant with no AI-flagged issues.</p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${getSeverityStyles(alert.severity)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block">
                          {alert.type} • {alert.application_code}
                        </span>
                        <h3 className="font-bold text-lg leading-tight mb-2">
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-sm font-semibold bg-white/60 px-3 py-1 rounded-full shadow-sm">
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed max-w-xl">
                      {alert.description}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-black/5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Clock size={16} /> Status: {alert.dueDate}
                      </div>
                      <button 
                        onClick={() => navigate('/app/applications')}
                        className="flex items-center gap-2 text-sm font-bold bg-white/80 hover:bg-white px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Review Application <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" size={20} /> Compliance Score
            </h3>
            {loading ? (
              <div className="animate-pulse flex space-x-4 h-24 bg-slate-100 rounded"></div>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-4xl font-extrabold ${complianceScore > 80 ? 'text-emerald-600' : complianceScore > 50 ? 'text-amber-500' : 'text-red-600'}`}>
                    {complianceScore}
                  </span>
                  <span className="text-slate-500 font-medium mb-1">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${complianceScore > 80 ? 'bg-emerald-500' : complianceScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{ width: `${complianceScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600">
                  {complianceScore > 80 
                    ? "Your compliance standing is excellent. Keep it up!" 
                    : "Your score reflects pending issues across your applications. Address the critical alerts to improve your standing."}
                </p>
              </>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert size={100} />
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Why stay compliant?</h3>
            <p className="text-sm text-slate-300 relative z-10 mb-4">
              Maintaining a high compliance score expedites future approvals and reduces the frequency of routine inspections by up to 40%.
            </p>
            <button className="text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors relative z-10">
              Read Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
