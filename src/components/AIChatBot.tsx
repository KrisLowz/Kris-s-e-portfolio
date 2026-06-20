import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { gsap, CONFIG } from '../animations';

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelRender, setPanelRender] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: "Hi there! I'm Chee Fei's virtual assistant. Ask me anything about his skills or projects! 👋" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Keep the message list pinned to the bottom WITHOUT scrolling the page
  // (scrollIntoView would fight Lenis) and pop the newest bubble in.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    if (CONFIG.reducedMotion) return;
    const last = list.querySelector<HTMLElement>('[data-msg]:last-of-type');
    if (last) {
      gsap.fromTo(last, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    }
  }, [messages, isLoading, panelRender]);

  // Launcher entrance.
  useLayoutEffect(() => {
    if (CONFIG.reducedMotion || !launcherRef.current) return;
    gsap.from(launcherRef.current, { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.7)', delay: 0.4 });
  }, []);

  // Rotate the launcher icon via GSAP (keeps transform on one owner — no CSS
  // class/inline-transform conflict).
  useLayoutEffect(() => {
    if (!launcherRef.current) return;
    gsap.to(launcherRef.current, {
      rotation: isOpen ? 90 : 0,
      duration: CONFIG.reducedMotion ? 0 : 0.3,
      ease: 'power2.out',
    });
  }, [isOpen]);

  // Panel open / close animation (render stays mounted through the exit).
  useEffect(() => {
    if (isOpen) setPanelRender(true);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!panelRender) return;
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) {
      if (CONFIG.reducedMotion) { gsap.set(panel, { autoAlpha: 1, clearProps: 'transform' }); return; }
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: 24, scale: 0.95, transformOrigin: 'bottom right' },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      if (CONFIG.reducedMotion) { setPanelRender(false); return; }
      gsap.to(panel, {
        autoAlpha: 0, y: 24, scale: 0.95, duration: 0.25, ease: 'power2.in',
        onComplete: () => setPanelRender(false),
      });
    }
  }, [isOpen, panelRender]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const responseText = await sendMessageToGemini(history, userMsg.text);

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {panelRender && (
        <div ref={panelRef} className="mb-4 w-80 sm:w-96 bg-pop-surface border border-pop-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-pop-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Portfolio Assistant</h3>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-pop-surface-2 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                data-msg
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-pop-primary text-white rounded-2xl rounded-tr-none'
                      : 'bg-pop-surface text-pop-text-main rounded-2xl rounded-tl-none border border-pop-border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div data-msg className="flex justify-start">
                <div className="bg-pop-surface border border-pop-border p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm text-pop-text-muted">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-pop-surface border-t border-pop-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me a question..."
                aria-label="Chat message"
                className="flex-1 bg-pop-surface-2 border border-pop-border rounded-xl px-4 py-2 text-sm text-pop-text-main focus:outline-none focus:ring-2 focus:ring-pop-primary/20 transition-all placeholder:text-pop-text-muted"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                className="bg-pop-primary text-white p-2 rounded-xl hover:bg-pop-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        ref={launcherRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className={`${
          isOpen ? 'bg-pop-text-main' : 'bg-pop-primary'
        } text-white p-4 rounded-full shadow-lg shadow-pop-primary/30 transition-colors duration-300 flex items-center justify-center z-50`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default AIChatBot;
