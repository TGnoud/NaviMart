import { useEffect, useRef, useState } from 'react';
import { aiChefApi } from '../api';

type ChatMessage = { id: number; text: string; sender: 'ai' | 'user'; time: string };

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const buildWelcome = (): ChatMessage => ({
  id: 1,
  text: 'Chào bạn! Tôi là **NaviChef** - trợ lý bếp ảo của NaviMart. Tôi biết rõ tủ lạnh của bạn đang có gì, nên cứ hỏi tôi: hôm nay nấu gì, cách chế biến món, hay mẹo bảo quản thực phẩm nhé!',
  sender: 'ai',
  time: now(),
});

const SUGGESTIONS = [
  'Tôi chỉ có 15 phút',
  'Gợi ý món ăn ít calo',
  'Nấu món gì với thịt bò?',
  'Mẹo bảo quản rau lâu',
];

function renderText(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export default function NaviChefWidget() {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcome()]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, open]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now(), text: text.trim(), sender: 'user', time: now() }]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await aiChefApi.chat(text.trim(), conversationIdRef.current);
      conversationIdRef.current = result.conversationId;
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: result.reply, sender: 'ai', time: now() }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text:
            err instanceof Error && err.message
              ? `⚠️ ${err.message}`
              : '⚠️ NaviChef đang gặp sự cố, bạn thử lại sau nhé.',
          sender: 'ai',
          time: now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    conversationIdRef.current = undefined;
    setMessages([buildWelcome()]);
  };

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở NaviChef AI"
          className="fixed bottom-[calc(69px+env(safe-area-inset-bottom)+16px)] right-4 md:right-8 md:bottom-8 w-14 h-14 bg-tertiary text-on-tertiary rounded-2xl shadow-[0_4px_16px_rgba(var(--color-tertiary-rgb),0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            robot_2
          </span>
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-[calc(69px+env(safe-area-inset-bottom)+16px)] right-4 md:right-8 md:bottom-8 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-[400px] h-[min(75vh,600px)] bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <header className="shrink-0 bg-surface border-b border-outline-variant px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  robot_2
                </span>
              </div>
              <div>
                <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface leading-tight">NaviChef</h1>
                <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Trực tuyến
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleReset}
                title="Bắt đầu hội thoại mới"
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">restart_alt</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Đóng"
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
              </button>
            </div>
          </header>

          {/* Chat area */}
          <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 bg-surface">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                    <span className="material-symbols-outlined text-on-primary-container text-[18px]">robot_2</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-br-sm'
                        : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface rounded-bl-sm'
                    }`}
                  >
                    <span className="whitespace-pre-wrap leading-relaxed">{renderText(msg.text)}</span>
                  </div>
                  <span
                    className={`font-label-sm text-[10px] text-on-surface-variant ${msg.sender === 'user' ? 'text-right' : 'text-left ml-1'}`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex max-w-[85%] mr-auto justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                  <span className="material-symbols-outlined text-on-primary-container text-[18px]">robot_2</span>
                </div>
                <div className="px-4 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 rounded-bl-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Input area */}
          <div className="shrink-0 bg-surface-container-lowest border-t border-outline-variant">
            <div className="flex overflow-x-auto gap-2 px-4 py-2.5 hide-scrollbar border-b border-outline-variant/30">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-primary/30 text-primary font-body-md text-sm bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="px-3 py-3 flex items-end gap-2">
              <div className="flex-1 bg-surface-container rounded-2xl border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex items-end min-h-[44px] px-3 py-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(inputText);
                    }
                  }}
                  placeholder="Hỏi NaviChef điều gì đó..."
                  className="w-full bg-transparent border-none outline-none resize-none max-h-28 text-on-surface font-body-md py-1"
                  rows={1}
                  style={{ minHeight: '24px' }}
                />
              </div>

              <button
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim()}
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm ${
                  inputText.trim()
                    ? 'bg-primary text-on-primary hover:opacity-90 active:scale-95'
                    : 'bg-surface-container-high text-on-surface-variant opacity-50'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
