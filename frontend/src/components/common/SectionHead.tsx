import React from "react";
import { C } from "../../constants/theme";

export interface SectionHeadProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ElementType;
}

export function SectionHead({ eyebrow, title, sub, icon: Icon }: SectionHeadProps) {
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
      <div className="flex items-center gap-4 mb-3">
        {Icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: C.saffronLight, color: C.saffron }}>
            <Icon size={24} />
          </div>
        )}
        <h2 className="text-3xl font-bold leading-tight" style={{ color: C.navyDeep }}>
          {title}
        </h2>
      </div>
      {sub && (
        <p className="mt-3 text-base leading-relaxed" style={{ color: C.slate }}>
          {sub}
        </p>
      )}
    </div>
  );
}
