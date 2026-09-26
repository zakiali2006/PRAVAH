import React from "react";
import { C } from "../../constants/theme";

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "navy" | "outline" | "ghost";
}

export function Btn({ children, onClick, variant = "primary", className = "", type = "button", disabled = false, ...props }: BtnProps) {
  const styles = {
    primary: { background: C.saffron, color: C.white, border: `1px solid ${C.saffron}` },
    navy: { background: C.navy, color: C.white, border: `1px solid ${C.navy}` },
    outline: { background: "transparent", color: C.navy, border: `1px solid ${C.navy}` },
    ghost: { background: C.white, color: C.navy, border: `1px solid ${C.line}` },
  }[variant];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 flex items-center justify-center rounded font-semibold text-sm transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ ...styles, outlineColor: C.navy }}
      {...props}
    >
      {children}
    </button>
  );
}
