import React from "react";
import { C } from "../../constants/theme";

export function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow && (
        <div
          className="inline-block mb-3 px-3 py-1 rounded text-sm font-semibold"
          style={{ background: C.saffronLight, color: C.saffron }}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold leading-tight" style={{ color: C.navyDeep }}>
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-base leading-relaxed" style={{ color: C.slate }}>
          {sub}
        </p>
      )}
    </div>
  );
}
