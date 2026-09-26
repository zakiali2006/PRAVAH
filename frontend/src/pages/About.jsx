import React from "react";
import { TrendingUp, FileCheck, MessageSquare, Headphones } from "lucide-react";
import { SectionHead } from "../components/common/SectionHead";
import { C } from "../constants/theme";
import { useTranslation } from "../contexts/TranslationContext";

const ICONS = [TrendingUp, FileCheck, MessageSquare, Headphones];

export function About() {
  const { t } = useTranslation();

  const cards = t.about?.cards || [
    { t: "Investment promotion", b: "Connecting domestic and international businesses with opportunities across the state's industrial corridors." },
    { t: "Single-window approvals", b: "One digital portal for government services, regulatory information and permissions." },
    { t: "Grievance redressal", b: "A dedicated escalation route for investment-related issues, with over 3,000 cases resolved." },
    { t: "Aftercare", b: "Support past commissioning — operational problem-solving, policy advocacy and expansion facilitation." },
  ];

  return (
    <div className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <SectionHead
          eyebrow={t.about?.eyebrow || "About PRAVAH"}
          title={t.about?.title || "Empowering Maharashtra's Industries"}
          sub={t.about?.sub || "PRAVAH is the state's investment promotion and business facilitation agency, set up under the Maharashtra Industrial Policy and given statutory backing by the Maharashtra Trade and Investment Facilitation Act."}
        />
        <div className="p-6 rounded mb-6" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.slate }}>
            {t.about?.p1 || "The cell was created to answer a simple complaint from industry: approvals were scattered across departments, timelines were opaque, and there was nobody to escalate to. PRAVAH holds binding authority over permission processes, which means a department cannot sit on a file indefinitely without it surfacing on a public dashboard."}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: C.slate }}>
            {t.about?.p2 || "PRAVAH 2.0, launched in February 2025, consolidates the notified services of sixteen departments into one application flow with real-time tracking, an incentive calculator and an assistant that answers eligibility questions."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {cards.map((x, i) => {
            const Icon = ICONS[i] || TrendingUp;
            return (
              <div key={i} className="p-5 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                <Icon size={20} color={C.saffron} />
                <h3 className="font-bold mt-3 mb-1.5" style={{ color: C.navyDeep }}>{x.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{x.b}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
