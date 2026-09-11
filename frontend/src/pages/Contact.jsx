import React from "react";
import { Building2, Phone, Mail, ChevronRight } from "lucide-react";
import { SectionHead } from "../components/common/SectionHead";
import { C } from "../constants/theme";

export function Contact() {
  return (
    <div className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHead eyebrow="Get in touch" title="Contact PRAVAH" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <div className="flex items-start gap-3 mb-5">
              <Building2 size={19} color={C.navy} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: C.navyDeep }}>PRAVAH Cell</div>
                <p className="text-sm leading-relaxed" style={{ color: C.slate }}>
                  Directorate of Industries, 2nd Floor, New Administrative Building,<br />
                  Opposite Mantralaya, Madam Cama Road, Mumbai 400 032
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <Phone size={18} color={C.navy} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>1800 120 8040</div>
                  <div className="text-xs" style={{ color: C.slate }}>Toll free, Mon–Sat</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} color={C.navy} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold break-all" style={{ color: C.ink }}>
                    helpdesk.pravah@maharashtra.gov.in
                  </div>
                  <div className="text-xs" style={{ color: C.slate }}>Two working days</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded" style={{ background: C.navyDeep }}>
            <h3 className="font-bold mb-2" style={{ color: C.white }}>Regional offices</h3>
            <p className="text-sm mb-4" style={{ color: "#A9C5DC" }}>
              District Industries Centres in all 36 districts accept walk-in queries.
            </p>
            {["Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Amravati"].map((d) => (
              <div key={d} className="flex items-center justify-between py-2 text-sm" style={{ color: "#DCE9F5", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                {d} <ChevronRight size={14} color="#7FA3C4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
