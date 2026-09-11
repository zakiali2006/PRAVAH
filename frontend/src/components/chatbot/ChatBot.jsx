import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Namaskar. I can help with services, eligibility, documents and timelines on PRAVAH. What are you setting up?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "You are the PRAVAH helpdesk assistant for the Government of Maharashtra's single-window investment portal. Answer questions about industrial approvals, PSI 2019 incentives, taluka classifications, MIDC plots, pollution consent, factory licences and application tracking. Be brief (under 90 words), plain-spoken and practical. If something needs a real officer, say so and give the helpline 1800 120 8040. Do not invent specific case numbers.",
          messages: next.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
        }),
      });
      const data = await res.json();
      const reply = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setMsgs([...next, { role: "assistant", text: reply || "I could not fetch that. Please call 1800 120 8040." }]);
    } catch {
      setMsgs([...next, {
        role: "assistant",
        text: "The assistant is unreachable right now. For anything urgent, the helpdesk is on 1800 120 8040, Monday to Saturday.",
      }]);
    }
    setBusy(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm w-full sm:w-88 flex flex-col h-[450px]">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-tight text-white">Ask PRAVAH</div>
                  <div className="text-[10px] font-medium text-slate-400">Available round the clock</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                      m.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-sm" 
                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                  <Loader2 size={12} className="animate-spin" /> Typing…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about eligibility or documents..."
                  className="flex-1 bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
                <button
                  onClick={send}
                  disabled={busy}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all shadow-[0_8px_20px_rgba(15,23,42,0.6)] bg-slate-900 text-white border border-slate-700/80 hover:bg-slate-800 hover:scale-105 active:scale-95"
      >
        {open ? <X size={18} /> : <Bot size={18} />}
        {!open && <span className="hidden sm:inline">Ask PRAVAH</span>}
      </button>
    </>
  );
}
