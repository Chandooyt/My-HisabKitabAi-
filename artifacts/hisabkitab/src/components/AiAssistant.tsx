import { useEffect, useRef, useState } from "react";
import type { Budget, Expense } from "@/firebase/expenses";
import {
  generateAiReply,
  SUGGESTED_PROMPTS,
  type ChatMessage,
} from "@/lib/aiAssistant";

type Props = {
  expenses: Expense[];
  budget: Budget;
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AiAssistant({ expenses, budget }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      ts: Date.now(),
      text: "Salam! I'm your HisabKitab assistant. Ask me about your spending — I can spot leaks, suggest savings, and analyze your week.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open, messages, thinking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      text: trimmed,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateAiReply(trimmed, expenses, budget);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: reply,
          ts: Date.now(),
        },
      ]);
      setThinking(false);
    }, 350);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 h-14 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2 font-semibold"
        aria-label="Open AI assistant"
        data-testid="button-open-ai"
      >
        <span aria-hidden className="text-xl">🤖</span>
        <span className="hidden sm:inline">Ask AI</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col h-[85vh] sm:h-[600px]"
            onClick={(e) => e.stopPropagation()}
            data-testid="dialog-ai-assistant"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>🤖</span>
                <div>
                  <p className="text-base font-bold text-emerald-700 leading-tight">
                    HisabKitab AI
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    Your money assistant
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-emerald-50/30"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-snug ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-emerald-100 rounded-bl-md shadow-sm"
                    }`}
                    data-testid={`msg-${m.role}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 border border-emerald-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 font-medium"
                    data-testid="suggested-prompt"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your spending…"
                className="flex-1 rounded-full border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none px-4 py-2.5 text-sm"
                data-testid="input-ai-message"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-full px-4 py-2.5 text-sm"
                data-testid="button-send-ai"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
