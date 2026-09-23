import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Loader2, FileText, AlertCircle } from "lucide-react";
import api from "../../api/axios";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "Namaskar. I am your PRAVAH AI Document Assistant. Ask me anything about your uploaded documents, compliance certificates, and approvals.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      setMsgs((prev) => [
        ...prev,
        { role: "user", text },
        {
          role: "assistant",
          text: "You are currently not logged in. Please sign in to your PRAVAH account to query your private uploaded documents.",
          sources: [],
          isError: true,
        },
      ]);
      setInput("");
      return;
    }

    const next = [...msgs, { role: "user", text, sources: [] }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    try {
      const response = await api.post("/chat", {
        message: text,
      });

      const replyData = response?.data?.data || {};
      const reply = replyData.reply || "I have processed your request.";
      const sources = Array.isArray(replyData.sources) ? replyData.sources : [];

      setMsgs([
        ...next,
        {
          role: "assistant",
          text: reply,
          sources: sources,
        },
      ]);
    } catch (err) {
      const status = err.response?.status;
      let errorMsg = "Unable to connect to the PRAVAH assistant. Please try again later.";

      if (status === 401) {
        errorMsg = "Your session has expired. Please log in again to access your documents.";
      } else if (status === 400) {
        errorMsg = err.response?.data?.message || "Invalid question format. Please check your message.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setMsgs([
        ...next,
        {
          role: "assistant",
          text: errorMsg,
          sources: [],
          isError: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm w-full sm:w-88 flex flex-col h-[480px]">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-tight text-white">Ask PRAVAH</div>
                  <div className="text-[10px] font-medium text-slate-400">RAG Document Assistant</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50 space-y-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[88%] ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : m.isError
                        ? "bg-red-950/80 text-red-200 border border-red-800/60 rounded-bl-sm"
                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {m.isError && (
                      <div className="flex items-center gap-1 font-semibold text-red-300 mb-1">
                        <AlertCircle size={12} /> Notice
                      </div>
                    )}
                    <div>{m.text}</div>

                    {/* Verified Document Sources */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 flex flex-col gap-1">
                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <FileText size={10} className="text-blue-400" /> Verified Sources:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {m.sources.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              title={`Document ID: ${s.document_id}, Chunk: ${s.chunk_index}`}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] text-blue-300 border border-slate-700/60"
                            >
                              {s.filename} (p.{s.chunk_index + 1})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                  <Loader2 size={12} className="animate-spin text-blue-400" /> Searching documents & generating answer…
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
                  onKeyDown={(e) => e.key === "Enter" && !busy && send()}
                  placeholder={busy ? "Thinking..." : "Ask about your uploaded documents..."}
                  disabled={busy}
                  className="flex-1 bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
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

