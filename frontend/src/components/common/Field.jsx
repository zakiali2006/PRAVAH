import React from "react";
import { C } from "../../constants/theme";

export function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold mb-1.5" style={{ color: C.ink }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs mt-1" style={{ color: C.slate }}>
          {hint}
        </span>
      )}
    </label>
  );
}
