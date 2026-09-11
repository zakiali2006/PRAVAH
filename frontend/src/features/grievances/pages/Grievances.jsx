import React, { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Field } from "../../../components/common/Field";
import { Btn } from "../../../components/common/Btn";
import { C, inputCls, inputStyle } from "../../../constants/theme";

export function Grievances() {
  const [f, setF] = useState({ name: "", email: "", dept: "", appId: "", detail: "" });
  const [sent, setSent] = useState(false);
  const [depts, setDepts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock loading departments
    setTimeout(() => {
      setDepts([
        "Directorate of Industries",
        "MIDC",
        "MPCB",
        "Energy Department",
        "Labour Department",
        "Fire Department"
      ]);
    }, 400);
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submitGrievance = async () => {
    if (!f.name || !f.email || !f.dept || !f.detail) {
      setError("Please fill out all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Simulate network request
      await new Promise(r => setTimeout(r, 1200));
      setSent(true);
    } catch (err) {
      setError("Failed to submit grievance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="px-4 py-20">
        <div className="max-w-lg mx-auto p-8 rounded text-center" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: C.greenLight }}>
            <Check size={24} color={C.green} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: C.navyDeep }}>Grievance registered</h2>
          <p className="text-sm mb-1" style={{ color: C.slate }}>
            Reference number <strong style={{ color: C.ink }}>MTR/GRV/2026/07741</strong>
          </p>
          <p className="text-sm mb-6" style={{ color: C.slate }}>
            The nodal officer has seven working days to respond. If that lapses, it escalates to the Development
            Commissioner (Industries).
          </p>
          <Btn variant="outline" onClick={() => { setSent(false); setF({ name: "", email: "", dept: "", appId: "", detail: "" }); }}>
            Register another grievance
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <SectionHead
          eyebrow="Grievance redressal"
          title="Raise an issue against a department"
          sub="Use this for delays past the statutory timeline, repeated queries on the same document, or a rejection you believe is unfounded."
        />
        <div className="p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-x-5">
            <Field label="Your name">
              <input value={f.name} onChange={set("name")} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={f.email} onChange={set("email")} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Department concerned">
              <select value={f.dept} onChange={set("dept")} className={inputCls} style={inputStyle}>
                <option value="">Select a department</option>
                {depts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Application number" hint="Optional">
              <input value={f.appId} onChange={set("appId")} className={inputCls} style={inputStyle} placeholder="MTR/2026/…" />
            </Field>
          </div>
          <Field label="What happened" hint="Dates, officer designation and what you were told help resolve it faster.">
            <textarea value={f.detail} onChange={set("detail")} rows={5} className={inputCls} style={inputStyle} />
          </Field>
          <Btn variant="navy" onClick={submitGrievance} className="w-full flex items-center justify-center gap-2">
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Submit grievance
          </Btn>
        </div>
      </div>
    </div>
  );
}
