'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MarkdownRenderer from '../../components/MarkdownRenderer';

// ============== 类型 ==============

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '分析当前账户的核心指标表现',
  '给出3个本周的投放优化建议',
  '检查余额并预测消耗趋势',
  '帮我审查最近被拒的创意',
  '各计划的ROI排名如何',
  '如何提升CTR和转化率',
];

// ============== 组件 ==============

export default function AgentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setError(null);
    setInput('');
    setLoading(true);

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    // 占位消息，等拿到回复后替换
    const placeholderId = `ai_${Date.now()}`;
    setMessages(prev => [...prev, { id: placeholderId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/baidu/ads-agent-local-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `请求失败 (${res.status})`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const content: string = data.content || '';

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === placeholderId) {
          return [...prev.slice(0, -1), { ...last, content: content || '...' }];
        }
        return [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content }];
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === placeholderId) {
          return [...prev.slice(0, -1), { ...last, content: `⚠️ 抱歉，出错了：${msg}` }];
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setLoading(false);
  };

  const timeString = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const shouldShowAvatar = (i: number) => {
    if (i === 0) return true;
    return messages[i - 1].role !== messages[i].role;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-130 w-full overflow-hidden shadow-2xl">

      {/* ======== 顶部栏 — WhatsApp 风格 ======== */}
      <header className="flex items-center gap-3 px-4 py-2.5 bg-[#1F2C33] shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#005C4B] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#AEBAC1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-[#E9EDEF] truncate">AI 营销顾问</h3>
          <p className="text-[13px] text-[#8696A0]">在线</p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="p-1.5 rounded-lg text-[#AEBAC1] hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* ======== 消息列表 — WhatsApp 聊天背景 ======== */}
      <main
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
        style={{
          backgroundColor: '#0B141A',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 30 L30 55 L5 30 Z' fill='none' stroke='rgba(255,255,255,0.015)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      >
        {messages.length === 0 && (
          <EmptyState
            suggestions={SUGGESTIONS}
            onPick={item => {
              setInput(item);
              send(item);
            }}
          />
        )}

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isLastAssistant = !isUser && i === messages.length - 1;
          const isPending = isLastAssistant && loading && !m.content;
          const showAvatar = shouldShowAvatar(i);
          const timeStr = timeString();

          return (
            <div key={m.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''} ${i > 0 && messages[i - 1].role === m.role ? 'mt-0.5' : 'mt-3'}`}>
              {/* 头像 — WhatsApp 只在每条消息组第一条显示 */}
              <div className="shrink-0" style={{ width: 28, height: 28 }}>
                {showAvatar ? (
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center ${
                    isUser ? 'bg-[#005C4B]' : 'bg-[#313D45]'
                  }`}>
                    {isUser ? (
                      <svg className="w-3.5 h-3.5 text-[#AEBAC1]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#AEBAC1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    )}
                  </div>
                ) : (
                  <div className="w-[28px]" />
                )}
              </div>

              {/* 气泡 */}
              <div className={`relative max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`relative px-3 py-2 text-[14.2px] leading-[19px] whitespace-pre-wrap wrap-break-word ${
                    isUser
                      ? 'bg-[#005C4B] text-[#E9EDEF] rounded-lg rounded-tr-sm'
                      : 'bg-[#202C33] text-[#E9EDEF] rounded-lg rounded-tl-sm'
                  }`}
                  style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.3s]" />
                    </span>
                  ) : m.content ? (
                    isUser ? (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    ) : (
                      <MarkdownRenderer content={m.content} />
                    )
                  ) : null}
                  {/* 时间戳 */}
                  <span className="inline-block align-bottom text-[11px] text-white/35 ml-2 float-right mt-1.5">
                    {timeStr}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {error && (
          <div className="mx-4 mt-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-300 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ======== 输入栏 — WhatsApp 风格 ======== */}
      <footer className="flex items-center gap-2 px-3 py-2 bg-[#1F2C33] shrink-0">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#8696A0] hover:bg-white/5 transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息"
          rows={1}
          disabled={loading}
          className="flex-1 bg-[#2A3942] text-[#E9EDEF] placeholder-[#8696A0] text-[15px] rounded-lg px-4 py-2 outline-none resize-none disabled:opacity-40"
          style={{ minHeight: '40px', maxHeight: '100px' }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 100) + 'px';
          }}
        />

        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#005C4B] text-[#AEBAC1] hover:bg-[#007A5E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </footer>
    </div>
  );
}

// ============== 空状态 ==============

function EmptyState({ suggestions, onPick }: { suggestions: string[]; onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <div className="w-20 h-20 rounded-full bg-[#1F2C33] flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-[#005C4B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <h3 className="text-lg font-normal text-[#E9EDEF] mb-1">AI 营销顾问</h3>
      <p className="text-sm text-[#8696A0] mb-6 max-w-xs">
        我可以帮你分析账户数据、提供投放建议、审查创意质量
      </p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {suggestions.map(s => (
          <button key={s} onClick={() => onPick(s)}
            className="text-left px-3.5 py-2.5 rounded-lg bg-[#202C33] text-sm text-[#E9EDEF]/80 hover:bg-[#2A3942] transition-colors truncate">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
