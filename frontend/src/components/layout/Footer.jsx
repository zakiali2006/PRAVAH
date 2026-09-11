import React from "react";
import { useNavigate } from "react-router-dom";
import { Landmark } from "lucide-react";
import { C } from "../../constants/theme";

export function Footer() {
  const navigate = useNavigate();
  const cols = [
    { h: "Quick links", items: ["Government resolutions", "Acts and rules", "Circulars", "Annual activity report", "Right to Information"] },
    { h: "Departments", items: ["Directorate of Industries", "MIDC", "MPCB", "Labour Department", "MSEDCL"] },
    { h: "Policies", items: ["Industrial Policy 2019", "Package Scheme of Incentives", "EV Policy", "Textile Policy", "Logistics Policy"] },
  ];
  
  return (
    <footer style={{ background: C.navyDeep }} className="px-4 pt-12 pb-6 mt-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: C.saffron }}>
              <Landmark size={18} color={C.white} />
            </div>
            <span className="text-lg font-bold" style={{ color: C.white }}>PRAVAH</span>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#93B4D0" }}>
            PRAVAH Cell, Directorate of Industries,
            Government of Maharashtra.
          </p>
          <button
            onClick={() => { navigate("/contact"); window.scrollTo(0, 0); }}
            className="text-sm font-semibold"
            style={{ color: C.saffron }}
          >
            Contact the helpdesk
          </button>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="font-bold text-sm mb-3" style={{ color: C.white }}>{c.h}</h4>
            {c.items.map((i) => (
              <div key={i} className="text-sm py-1 cursor-pointer hover:underline" style={{ color: "#93B4D0" }}>
                {i}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="max-w-7xl mx-auto mt-8 pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.13)" }}
      >
        <p className="text-xs text-center md:text-left" style={{ color: "#7FA3C4" }}>
          © 2026 Government of Maharashtra. Content owned by the Directorate of Industries.
          This is a demonstration build, not the official portal.
        </p>
        <p className="text-xs" style={{ color: "#7FA3C4" }}>
          Visitors: 4,18,27,336 · Last updated 08 September 2026
        </p>
      </div>
    </footer>
  );
}
