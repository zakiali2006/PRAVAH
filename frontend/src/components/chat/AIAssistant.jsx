import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { C } from "../../constants/theme";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am PRAVAH AI. Ask me about your approvals, pending documents, or any compliance questions." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMsgs = [...messages, { role: "user", text: input }];
    setMessages(newMsgs);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      setMessages([...newMsgs, { 
        role: "ai", 
        text: "Based on the PRAVAH dependency graph, you cannot start building construction yet because your Fire NOC is delayed by 3 days in the Mumbai jurisdiction. However, you can proceed with Tree Cutting." 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
          style={{ background: C.saffron }}
        >
          <MessageSquare size={24} color={C.white} />
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: C.navyDeep, color: C.white }}>
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">PRAVAH AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100">
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask PRAVAH AI..."
              className="flex-1 px-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: C.navy, color: C.white }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
