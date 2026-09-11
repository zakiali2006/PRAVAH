import React, { useState } from 'react';
import { Download, ShieldCheck, Receipt } from 'lucide-react';
import { useMockApp } from '../../../contexts/MockAppContext';

export const PaymentsHistory = ({ onPayChallan }) => {
  const { payments } = useMockApp();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedChallanForPayment, setSelectedChallanForPayment] = useState(null);
  const [paymentMode, setPaymentMode] = useState('NetBanking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'All') return true;
    return p.status === activeTab;
  });

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  const handleExecutePayment = () => {
    if (!selectedChallanForPayment) return;
    setIsProcessing(true);
    setTimeout(() => {
      onPayChallan(selectedChallanForPayment.id, paymentMode);
      setIsProcessing(false);
      setSuccessReceipt({
        ...selectedChallanForPayment,
        status: 'PAID',
        paymentMode
      });
      setSelectedChallanForPayment(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Receipt size={16} />
            <span>Government Receipts Accounting System (GRAS & MTRAC)</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Payments & Treasury Challans</h2>
          <p className="text-slate-600 text-xs mt-1">
            Official statutory fee collection ledger with instant online verification receipts and MahaGov Treasury reconciliation.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            <span className="text-emerald-700 block text-[10px] font-bold">Total Fees Cleared</span>
            <span className="text-emerald-950 font-black text-base">₹ {(totalPaid / 100000).toFixed(2)} Lakhs</span>
          </div>
          {totalPending > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
              <span className="text-amber-700 block text-[10px] font-bold">Pending Dues</span>
              <span className="text-amber-950 font-black text-base">₹ {(totalPending / 100000).toFixed(2)} Lakhs</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {(['All', 'PAID', 'PENDING'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'All' ? 'All Challans' : tab === 'PAID' ? 'Settled Receipts' : 'Pending Payment'}
          </button>
        ))}
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4">Challan Ref / ID</th>
                <th className="p-4">Statutory Service & Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const isPaid = p.status === 'PAID';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-slate-900">{p.challanNumber}</p>
                      <p className="text-[10px] text-slate-400">App: {p.appId}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-slate-900">{p.serviceName}</p>
                      <p className="text-[11px] text-slate-500">{p.department}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{p.date}</td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹ {p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">{p.paymentMode || 'NetBanking'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => setSuccessReceipt(p)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center space-x-1 transition-colors"
                        >
                          <Download size={13} />
                          <span>Maha-GRAS Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedChallanForPayment(p)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                        >
                          Pay Online Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal Simulator */}
      {selectedChallanForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">GRAS Maharashtra Treasury Payment Gateway</h3>
              <button onClick={() => setSelectedChallanForPayment(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800 text-right">{selectedChallanForPayment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Challan Ref:</span>
                <span className="font-mono font-bold text-slate-800">{selectedChallanForPayment.challanNumber}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Amount:</span>
                <span className="font-black text-emerald-600">₹ {selectedChallanForPayment.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Channel</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {(['NetBanking', 'UPI', 'NEFT/RTGS'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMode === mode ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <span>Authorizing with Treasury Server...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authorize Settlement (₹ {selectedChallanForPayment.amount.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Government of Maharashtra</h3>
                  <p className="text-[10px] text-slate-400">Treasury e-Challan Official Cyber Receipt</p>
                </div>
              </div>
              <button onClick={() => setSuccessReceipt(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">GRAS CIN (Challan Identification):</span>
                <span className="font-mono font-bold text-slate-900">GRAS-2026-MH-{100000 + Date.now() % 900000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800">{successReceipt.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-slate-800">{successReceipt.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Received:</span>
                <span className="font-extrabold text-emerald-700">₹ {successReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Status:</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">SUCCESS (RECONCILED)</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSuccessReceipt(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
