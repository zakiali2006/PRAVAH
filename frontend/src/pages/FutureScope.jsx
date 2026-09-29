import React from "react";
import { Bot, Smartphone, Sparkles, Layout, ArrowRight } from "lucide-react";
import { SectionHead } from "../components/common/SectionHead";
import { C } from "../constants/theme";

export function FutureScope() {
  const implementations = [
    {
      icon: Bot,
      color: "text-blue-500",
      bg: "bg-blue-50",
      title: "AI Chatbot for Officials & Policy Makers",
      desc: "An intelligent, context-aware assistant tailored for internal government staff. It will instantly answer queries regarding policies, pull up specific clauses, analyze departmental metrics, and assist in navigating complex compliance data, saving hundreds of manual hours."
    },
    {
      icon: Smartphone,
      color: "text-green-500",
      bg: "bg-green-50",
      title: "Advanced Investor Mobile Application",
      desc: "A dedicated mobile app for investors offering real-time application tracking. Key features include instant push notifications when an officer verifies a step, requests a re-upload, or issues final clearance, allowing business owners to respond immediately from anywhere."
    },
    {
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-50",
      title: "Deep AI & ML Integration",
      desc: "Expanding our AI beyond document verification. Future iterations will include automated anomaly detection in financial reports, intelligent matching of businesses to optimal subsidy schemes, and predictive SLA breach warnings before deadlines hit."
    },
    {
      icon: Layout,
      color: "text-pink-500",
      bg: "bg-pink-50",
      title: "Refined UI/UX Ecosystem",
      desc: "Continuous improvements to the platform interface with an obsessive focus on user easiness. This includes dynamic personalized dashboards, smart auto-fill based on history, and highly accessible color-coded workflows for maximum transparency."
    }
  ];

  return (
    <div className="px-4 py-16 bg-slate-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 font-bold text-xs uppercase tracking-widest rounded-full mb-4">
            Roadmap 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Future Implementation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are constantly evolving PRAVAH. Here is a sneak peek at the groundbreaking features we are actively building to further streamline industrial approvals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {implementations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className={item.color} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  In Development <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
