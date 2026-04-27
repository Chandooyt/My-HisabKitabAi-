import { useEffect, useRef, useState } from "react";
import type { Budget, Expense } from "@/firebase/expenses";
import {
  generateAiReply,
  SUGGESTED_PROMPTS,
  type ChatMessage,
} from "@/lib/aiAssistant";
import { PremiumLock } from "@/components/PremiumLock";
import type { PageId } from "@/components/Sidebar";

type Props = {
  expenses: Expense[];
  budget: Budget;
  isPremium: boolean;
  onNavigate: (id: PageId) => void;
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AssistantPage({ expenses, budget, isPremium, onNavigate }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      ts: Date.now(),
      text: "Salam! I'm your HisabKitab AI assistant. Ask me about your spending — I can spot leaks, suggest savings, and analyze your week.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AI Assistant
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Personal financial advice powered by your data.
          </p>
        </div>
        <PremiumLock
          title="AI Assistant is a Premium feature"
          description="Get personal money advice in chat: 'where am I wasting money?', 'how can I save?', 'analyze my spending'. Upgrade to unlock it."
          onUpgrade={() => onNavigate("payment")}
        />
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AI Assistant
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask anything about your money.
          </p>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-3 py-1">
          👑 Premium
        </span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[70vh] min-h-[400px]">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3 bg-emerald-50/30"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-snug ${
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
              <div className="bg-white text-gray-500 border border-emerald-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm shadow-sm">
                <span className="inline-flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2">
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
          className="p-3 sm:p-4 border-t border-gray-100 flex items-center gap-2 bg-white"
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
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-full px-5 py-2.5 text-sm"
            data-testid="button-send-ai"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
