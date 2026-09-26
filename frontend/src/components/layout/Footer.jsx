import React from "react";
import { useNavigate } from "react-router-dom";
import { Landmark } from "lucide-react";
import { C } from "../../constants/theme";
import { useTranslation } from "../../contexts/TranslationContext";

export function Footer() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const cols = [
    { 
      h: t("Quick links", "Quick links"), 
      items: [
        { label: t("Government resolutions", "Government resolutions"), path: "#" },
        { label: t("Acts and rules", "Acts and rules"), path: "#" },
        { label: t("Circulars", "Circulars"), path: "#" },
        { label: t("Annual activity report", "Annual activity report"), path: "#" },
        { label: t("Right to Information", "Right to Information"), path: "#" }
      ] 
    },
    { 
      h: t("Departments", "Departments"), 
      items: [
        { label: t("Directorate of Industries", "Directorate of Industries"), path: "#" },
        { label: t("MIDC", "MIDC"), path: "#" },
        { label: t("MPCB", "MPCB"), path: "#" },
        { label: t("Labour Department", "Labour Department"), path: "#" },
        { label: t("MSEDCL", "MSEDCL"), path: "#" }
      ] 
    },
    { 
      h: t("Policies", "Policies"), 
      items: [
        { label: t("Industrial Policy 2019", "Industrial Policy 2019"), path: "#" },
        { label: t("Package Scheme of Incentives", "Package Scheme of Incentives"), path: "#" },
        { label: t("EV Policy", "EV Policy"), path: "#" },
        { label: t("Textile Policy", "Textile Policy"), path: "#" },
        { label: t("Logistics Policy", "Logistics Policy"), path: "#" }
      ] 
    },
  ];
  
  return (
    <footer style={{ background: C.navyDeep }} className="px-4 pt-12 pb-6 mt-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: C.saffron }}>
              <Landmark size={18} color={C.white} />
            </div>
            <span className="text-lg font-bold" style={{ color: C.white }}>{t.brand || "PRAVAH"}</span>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#93B4D0" }}>
            {lang === "mr" 
              ? "प्रवाह कक्ष, उद्योग संचालनालय, महाराष्ट्र शासन."
              : lang === "hi"
              ? "प्रवाह प्रकोष्ठ, उद्योग निदेशालय, महाराष्ट्र सरकार।"
              : "PRAVAH Cell, Directorate of Industries, Government of Maharashtra."}
          </p>
          <button
            onClick={() => { navigate("/contact"); window.scrollTo(0, 0); }}
            className="text-sm font-semibold hover:underline"
            style={{ color: C.saffron }}
          >
            {t("Contact the helpdesk", "Contact the helpdesk")}
          </button>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="font-bold text-sm mb-3" style={{ color: C.white }}>{c.h}</h4>
            {c.items.map((i) => (
              <div key={i.label} className="text-sm py-1 cursor-pointer hover:underline" style={{ color: "#93B4D0" }}>
                {i.label}
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
          {lang === "mr"
            ? "© २०२६ महाराष्ट्र शासन. सामग्री उद्योग संचालनालयाच्या मालकीची आहे. हे प्रात्यक्षिक पोर्टल आहे."
            : lang === "hi"
            ? "© 2026 महाराष्ट्र सरकार। सामग्री उद्योग निदेशालय के स्वामित्व में है। यह एक प्रदर्शन पोर्टल है।"
            : "© 2026 Government of Maharashtra. Content owned by the Directorate of Industries. This is a demonstration build, not the official portal."}
        </p>
        <p className="text-xs" style={{ color: "#7FA3C4" }}>
          {lang === "mr"
            ? "अभ्यागत: ४,१८,२७,३३६ · शेवटचे अपडेट: ०८ सप्टेंबर २०२६"
            : lang === "hi"
            ? "आगंतुक: 4,18,27,336 · अंतिम अद्यतन: 08 सितंबर 2026"
            : "Visitors: 4,18,27,336 · Last updated 08 September 2026"}
        </p>
      </div>
    </footer>
  );
}
