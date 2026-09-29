import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Loader2, FileText, AlertCircle, Sparkles, Copy, Check, ChevronDown } from "lucide-react";
import api from "../../api/axios";
import { useTranslation } from "../../contexts/TranslationContext";

export function ChatBot() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: t.chat?.greeting || "Hello! I am your PRAVAH assistant. How can I help you today?",
      sources: [],
      suggestions: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Load user applications when opened
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");
      if (token) {
        api
          .get("/applications/me")
          .then((res) => {
            const apps = Array.isArray(res.data) ? res.data : [];
            setApplications(apps);
            if (apps.length > 0 && !selectedAppId) {
              setSelectedAppId(apps[0].id);
            }
          })
          .catch(() => {
            // Silently fall back to standard RAG if applications cannot be loaded
          });
      }
    }
  }, [open]);

  const send = async (customText = null) => {
    const text = (customText || input).trim();
    if (!text || busy) return;

    const next = [...msgs, { role: "user", text, sources: [], suggestions: [] }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    const isUnauth = !localStorage.getItem("token");
    if (isUnauth) {
      if (text === "What is PRAVAH?" || text === "What are the key features for the SIH hackathon?") {
        setTimeout(() => {
          setMsgs(prev => [
            ...prev,
            {
              role: "assistant",
              text: (
                <div className="space-y-2 leading-relaxed">
                  <p><strong className="text-blue-400">PRAVAH</strong> is an AI-powered single-window clearance system for the Government of Maharashtra.</p>
                  <p className="font-semibold text-amber-300 mt-2 border-b border-slate-700/50 pb-1">Key Highlighted Features:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-200">
                    <li><strong className="text-white">Native Trilingual Support:</strong> English, Marathi, and Hindi with real-time switching.</li>
                    <li><strong className="text-white">AI-Powered Pre-fill:</strong> Extracts data from the Central Vault.</li>
                    <li><strong className="text-white">DigiLocker Integration:</strong> Verifies identity documents automatically.</li>
                    <li><strong className="text-white">Smart Triage & Risk Scoring:</strong> AI Officer Copilot evaluates trust scores.</li>
                    <li><strong className="text-white">Real-Time Fraud Detection:</strong> Flags duplicate apps & PAN overlaps.</li>
                    <li><strong className="text-white">Dynamic CAF Builder:</strong> Drag-and-drop tool for policy admins.</li>
                    <li><strong className="text-white">Automated Tracking Roadmap:</strong> Animated live tracking for investors.</li>
                  </ul>
                </div>
              ),
              sources: [],
              suggestions: []
            }
          ]);
          setBusy(false);
        }, 1500); // Simulate backend delay
        return;
      }
      
      if (text === "Does this platform support multiple languages?") {
        setTimeout(() => {
          setMsgs(prev => [
            ...prev,
            {
              role: "assistant",
              text: (
                <div className="space-y-2 leading-relaxed">
                  <p>Yes! <strong className="text-blue-400">PRAVAH</strong> provides <strong className="text-white">Native Trilingual Support</strong>.</p>
                  <p>The platform seamlessly supports:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-200">
                    <li>English</li>
                    <li>Marathi (मराठी)</li>
                    <li>Hindi (हिंदी)</li>
                  </ul>
                  <p className="text-amber-300 italic text-[10px] mt-2">You can use the Language Switcher in the top navigation bar to toggle translations instantly without reloading the page!</p>
                </div>
              ),
              sources: [],
              suggestions: []
            }
          ]);
          setBusy(false);
        }, 1200);
        return;
      }
    }

    try {
      const payload = {
        message: text,
      };
      if (selectedAppId) {
        payload.application_id = selectedAppId;
      }

      const response = await api.post("/chat", payload);

      const replyData = response?.data?.data || {};
      const reply = replyData.reply || "I have processed your request.";
      const sources = Array.isArray(replyData.sources) ? replyData.sources : [];
      const suggestions = Array.isArray(replyData.suggestions) ? replyData.suggestions : [];

      setMsgs([
        ...next,
        {
          role: "assistant",
          text: reply,
          sources: sources,
          suggestions: suggestions,
        },
      ]);
    } catch (err) {
      const status = err.response?.status;
      let errorMsg = "Unable to connect to the PRAVAH assistant. Please try again later.";

      if (status === 401) {
        errorMsg = "Your session has expired. Please log in again to access your documents.";
      } else if (status === 403) {
        errorMsg = "You are not authorized to query this application.";
      } else if (status === 404) {
        errorMsg = "The specified application could not be found.";
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
          suggestions: [],
          isError: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm w-full sm:w-96 flex flex-col h-[520px]">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Bot size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                      {t.chat?.title || "PRAVAH Copilot"}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      {selectedAppId ? "Application Context Active" : "General Document Q&A"}
                    </div>
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

              {/* Context Scope Dropdown */}
              {applications.length > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400 font-medium shrink-0">Scope:</span>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="flex-1 bg-slate-950 text-blue-300 font-semibold px-2 py-1 rounded border border-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">General (All Documents)</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} — {app.service_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50 space-y-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[90%] ${
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

                    {/* Structured Form Suggestions */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-2">
                        <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles size={11} /> Suggested Form Input
                        </div>
                        {m.suggestions.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 bg-slate-950/90 rounded-lg border border-amber-500/30 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 uppercase text-[10px]">
                                Field: {s.field}
                              </span>
                              <button
                                onClick={() => copyToClipboard(s.suggested_value, `${s.field}-${sIdx}`)}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                              >
                                {copiedField === `${s.field}-${sIdx}` ? (
                                  <>
                                    <Check size={10} /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={10} /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded">
                              {s.suggested_value}
                            </div>
                            <p className="text-[10px] text-slate-400 italic">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}

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
                  <Loader2 size={12} className="animate-spin text-blue-400" /> Grounding application data & generating guidance…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Prompts for unauthenticated users */}
            {!localStorage.getItem("token") && (
              <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 font-medium mr-1">Suggested:</span>
                <button
                  onClick={() => send("What is PRAVAH?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  What is PRAVAH?
                </button>
                <button
                  onClick={() => send("What are the key features for the SIH hackathon?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  Key Hackathon Features
                </button>
                <button
                  onClick={() => send("Does this platform support multiple languages?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  Language Support
                </button>
              </div>
            )}

            {/* Quick Copilot Prompts (if application is selected) */}
            {selectedAppId && (
              <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                <button
                  onClick={() => send("Why is my application given this risk score and what should I fix?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  Explain Risk Score
                </button>
                <button
                  onClick={() => send("Are all my uploaded documents verified and consistent with my business profile?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  Check Document Status
                </button>
                <button
                  onClick={() => send("What is the next step for my application?")}
                  className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                >
                  Next Steps
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !busy && send()}
                  placeholder={
                    busy
                      ? "Thinking..."
                      : t.chat?.placeholder || "Ask about your uploaded documents..."
                  }
                  disabled={busy}
                  className="flex-1 bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  onClick={() => send()}
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
