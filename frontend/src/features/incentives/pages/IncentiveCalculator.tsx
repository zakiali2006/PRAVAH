import React, { useState } from 'react';
import { Award, Calculator, CheckCircle, Sparkles, Settings2, Download, Play, Percent, Map } from 'lucide-react';
import { useMockApp } from '../../../contexts/MockAppContext';
import { C, inputCls, inputStyle } from "../../../constants/theme";

export const IncentiveCalculator = ({ _onApplyForScheme }) => {
  const { schemes } = useMockApp();
  const [investmentCr, setInvestmentCr] = useState(450);
  const [talukaCategory, setTalukaCategory] = useState('C');
  const [employment, setEmployment] = useState(1200);
  const [projectType, setProjectType] = useState('Manufacturing');
  const [hasScStPromoter, setHasScStPromoter] = useState(false);

  // Compute PSI 2019 / 2024 Incentives
  const calculations = React.useMemo(() => {
    // Determine category: Micro (<1Cr), Small (1-10Cr), Medium (10-50Cr), Large (50-500Cr), Mega (>500Cr)
    let unitScale = 'Large Industrial Project';
    if (investmentCr < 1) unitScale = 'Micro Enterprise';
    else if (investmentCr <= 10) unitScale = 'Small Enterprise';
    else if (investmentCr <= 50) unitScale = 'Medium Enterprise';
    else if (investmentCr > 500) unitScale = 'Mega / Ultra Mega Project';

    // SGST reimbursement percentage & period based on taluka
    let sgstPercent = 60;
    let tenureYears = 7;
    let capPercent = 80;

    if (talukaCategory === 'A') {
      sgstPercent = 0; // Not eligible in developed taluka
      tenureYears = 0;
      capPercent = 0;
    } else if (talukaCategory === 'B') {
      sgstPercent = 50;
      tenureYears = 7;
      capPercent = 60;
    } else if (talukaCategory === 'C') {
      sgstPercent = 75;
      tenureYears = 7;
      capPercent = 80;
    } else if (talukaCategory === 'D') {
      sgstPercent = 90;
      tenureYears = 9;
      capPercent = 100;
    } else if (talukaCategory === 'D+') {
      sgstPercent = 100;
      tenureYears = 10;
      capPercent = 100;
    }

    // Estimated cumulative SGST refund (assuming ~4% gross sales on capital base)
    const annualEstimatedSgstCr = (investmentCr * 0.4) * 0.09; // Est 9% state GST
    const annualRefundCr = annualEstimatedSgstCr * (sgstPercent / 100);
    const totalPotentialRefundCr = Math.min(annualRefundCr * tenureYears, investmentCr * (capPercent / 100));

    // Electricity Duty Exemption
    const electricityDutySavingsCr = unitScale.includes('Large') || unitScale.includes('Mega') 
      ? 12.8 
      : 1.5;

    // Interest Subsidy (5% for MSME / SC-ST)
    const interestSubsidyCr = (hasScStPromoter || unitScale.includes('Micro') || unitScale.includes('Small'))
      ? (investmentCr * 0.05 * 5)
      : 0;

    return {
      unitScale,
      sgstPercent,
      tenureYears,
      capPercent,
      totalPotentialRefundCr: totalPotentialRefundCr.toFixed(1),
      electricityDutySavingsCr: electricityDutySavingsCr.toFixed(1),
      interestSubsidyCr: interestSubsidyCr.toFixed(1),
      totalBenefitValueCr: (totalPotentialRefundCr + electricityDutySavingsCr + interestSubsidyCr).toFixed(1)
    };
  }, [investmentCr, talukaCategory, hasScStPromoter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: C.white, border: `1px solid ${C.line}` }}>
        <div>
          <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-2" style={{ color: C.navy }}>
            <Award size={16} />
            <span>Government Benefit & Scheme Readiness</span>
          </div>
          <h2 className="text-3xl font-black mb-2" style={{ color: C.ink }}>Package Scheme of Incentives (PSI) Calculator</h2>
          <p className="text-sm leading-relaxed max-w-3xl" style={{ color: C.slate }}>
            Instant statutory calculation of Gross SGST refund (IPS), electricity duty waiver, and capital subsidy under Maharashtra Industrial Policy.
          </p>
        </div>

        <div className="border p-5 rounded text-center shrink-0 min-w-[200px]" style={{ background: C.saffronLight, borderColor: 'rgba(232, 119, 34, 0.2)' }}>
          <span className="block text-xs uppercase font-bold mb-1" style={{ color: C.saffron }}>Estimated State Subsidy</span>
          <span className="text-3xl font-black" style={{ color: C.saffron }}>₹ {calculations.totalBenefitValueCr} Cr</span>
        </div>
      </div>

      {/* Simulator Inputs & Results Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Parameters */}
        <div className="lg:col-span-1 p-6 rounded shadow-sm space-y-6" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <h3 className="font-extrabold text-sm flex items-center" style={{ color: C.ink }}>
            <Calculator size={18} className="mr-2" style={{ color: C.navy }} />
            Project Parameters
          </h3>

          <div>
            <div className="flex justify-between text-xs font-bold mb-2" style={{ color: C.ink }}>
              <span>Proposed Capital Investment</span>
              <span className="font-black" style={{ color: C.navy }}>₹ {investmentCr} Crores</span>
            </div>
            <input
              type="range"
              min={5}
              max={1000}
              step={25}
              value={investmentCr}
              onChange={(e) => setInvestmentCr(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: C.navy }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: C.ink }}>Taluka Classification (Group)</label>
            <select
              value={talukaCategory}
              onChange={(e) => setTalukaCategory(e.target.value )}
              className={inputCls} style={inputStyle}
            >
              <option value="A">Group A - Highly Developed (No IPS)</option>
              <option value="B">Group B - Moderately Developed</option>
              <option value="C">Group C - Developing (75% SGST)</option>
              <option value="D">Group D - Less Developed (90% SGST)</option>
              <option value="D+">Group D+ - Least Developed (100% SGST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: C.ink }}>Direct Employment</label>
            <input
              type="number"
              value={employment}
              onChange={(e) => setEmployment(Number(e.target.value))}
              className={inputCls} style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: C.ink }}>Industry Vertical</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value )}
              className={inputCls} style={inputStyle}
            >
              <option value="Manufacturing">Manufacturing & Engineering</option>
              <option value="Agro-processing">Agro & Food Processing</option>
              <option value="IT / Electronics">IT, Data Centers & Electronics</option>
            </select>
          </div>

          <div className="pt-4 border-t flex items-center justify-between text-sm font-bold" style={{ borderColor: C.line, color: C.ink }}>
            <span>SC/ST / Women Promoter?</span>
            <input
              type="checkbox"
              checked={hasScStPromoter}
              onChange={(e) => setHasScStPromoter(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: C.navy }}
            />
          </div>
        </div>

        {/* Calculated Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded shadow-sm space-y-6" style={{ background: C.white, border: `1px solid ${C.line}`, color: C.ink }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: C.line }}>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold mb-1 block" style={{ color: C.saffron }}>Classified Tier</span>
                <h3 className="text-3xl font-black">{calculations.unitScale}</h3>
              </div>
              <span className="text-sm font-bold px-4 py-1.5 rounded-full" style={{ background: C.saffronLight, color: C.saffron }}>
                Group {talukaCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded border" style={{ background: C.bg, borderColor: C.line }}>
                <span className="text-xs block font-bold mb-1" style={{ color: C.slate }}>Gross SGST Refund (IPS)</span>
                <span className="text-2xl font-black block mb-1" style={{ color: C.navyDeep }}>₹ {calculations.totalPotentialRefundCr} Cr</span>
                <span className="text-xs font-bold" style={{ color: C.green }}>Over {calculations.tenureYears} Years</span>
              </div>

              <div className="p-5 rounded border" style={{ background: C.bg, borderColor: C.line }}>
                <span className="text-xs block font-bold mb-1" style={{ color: C.slate }}>Electricity Duty Exemption</span>
                <span className="text-2xl font-black block mb-1" style={{ color: C.navyDeep }}>₹ {calculations.electricityDutySavingsCr} Cr</span>
                <span className="text-xs font-bold" style={{ color: C.slate }}>100% Waiver for 7 Yrs</span>
              </div>

              <div className="p-5 rounded border" style={{ background: C.bg, borderColor: C.line }}>
                <span className="text-xs block font-bold mb-1" style={{ color: C.slate }}>Interest Subsidy (MSME/Spec)</span>
                <span className="text-2xl font-black block mb-1" style={{ color: C.navyDeep }}>₹ {calculations.interestSubsidyCr} Cr</span>
                <span className="text-xs font-bold" style={{ color: C.slate }}>@ 5% on Term Loans</span>
              </div>
            </div>

            <div className="text-sm p-4 rounded flex items-start gap-3 mt-4 border" style={{ background: C.saffronLight, borderColor: 'rgba(232, 119, 34, 0.2)' }}>
              <Sparkles size={18} style={{ color: C.saffron }} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed" style={{ color: C.ink }}>
                <strong style={{ color: C.saffron }}>AI Recommendation:</strong> File Form 1 eligibility application concurrently with your 
                Factory Building Plan Approval (APP-1004) to prevent delay in commercial production validation.
              </span>
            </div>
          </div>

          {/* Scheme Readiness Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((s) => (
              <div key={s.id} className="p-6 rounded shadow-sm space-y-4" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: C.navy }}>{s.category}</span>
                    <h4 className="font-bold text-base leading-snug" style={{ color: C.ink }}>{s.title}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-black shrink-0 ml-2" style={{ 
                    background: s.status === 'eligible' ? C.greenLight : C.bg, 
                    color: s.status === 'eligible' ? C.green : C.slate 
                  }}>
                    {s.matchScore}% Match
                  </span>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{s.benefit}</p>

                {s.reasons && s.reasons.length > 0 && (
                  <div className="space-y-2 p-3 rounded text-xs font-medium" style={{ background: C.bg, color: C.ink }}>
                    {s.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} style={{ color: C.green }} className="shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
