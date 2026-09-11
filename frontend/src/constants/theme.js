export const C = {
  navy: "#0B3C6E",
  navyDeep: "#062A4F",
  navySoft: "#12508F",
  saffron: "#E87722",
  saffronLight: "#FFF1E4",
  green: "#137A46",
  greenLight: "#E8F4EE",
  ink: "#152230",
  slate: "#5C6B7A",
  bg: "#F3F6F9",
  line: "#D9E1E9",
  white: "#FFFFFF",
};

export const FONT = `"Segoe UI", "Noto Sans", "Noto Sans Devanagari", system-ui, -apple-system, Arial, sans-serif`;

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export const inputCls = "w-full px-3 py-2.5 rounded text-sm focus:outline-none focus:ring-2";
export const inputStyle = { border: `1px solid ${C.line}`, background: C.white, color: C.ink };

