'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamContentRef = useRef('');

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streaming, scrollToBottom]);

  const appendAssistant = useCallback(() => {
    const content = streamContentRef.current;
    streamContentRef.current = '';

    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant') {
        const updated: Message = { ...last, content: content || '...' };
        return [...prev.slice(0, -1), updated];
      }
      if (content) {
        return [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content }];
      }
      return prev;
    });
  }, []);

  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || streaming) return;

    setError(null);
    setInput('');

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    setStreaming(true);
    streamContentRef.current = '';

    // 占位 assistant 消息用于流式更新
    setMessages(prev => [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content: '' }]);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch('/api/baidu/ads-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `请求失败 (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 行
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.delta) {
                streamContentRef.current += payload.delta;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: streamContentRef.current }];
                  }
                  return prev;
                });
              }
              if (payload.done) {
                // 标记完成
              }
              if (payload.error) {
                throw new Error(payload.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
      streamContentRef.current += `\n\n⚠️ 抱歉，出错了：${msg}`;
    } finally {
      setStreaming(false);
      appendAssistant();
      abortRef.current = null;
    }
  }, [input, messages, streaming, appendAssistant]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const clearChat = () => {
    stopStreaming();
    setMessages([]);
    setError(null);
    streamContentRef.current = '';
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-130 border border-white/10 rounded-2xl bg-white/2 overflow-hidden">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI 营销顾问</h3>
            <p className="text-xs text-white/40">CloudBase Agent · 实时回答</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {streaming && (
            <button onClick={stopStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20 hover:bg-red-500/20 transition-colors">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              停止生成
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="text-white/30 hover:text-white/60 text-xs transition-colors">
              清空对话
            </button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
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
          const isStreamingMessage = isLastAssistant && streaming && m.content === streamContentRef.current;

          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isUser
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {isUser ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                )}
              </div>

              {/* 消息气泡 */}
              <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
                <span className="block text-xs text-white/30 mb-1">
                  {isUser ? '我' : 'AI 营销顾问'}
                </span>
                <div className={`inline-block text-left px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white/6 text-white/90 border border-white/8 rounded-bl-md'
                }`}>
                  {m.content || (
                    isStreamingMessage
                      ? <span className="inline-flex items-center gap-1 text-white/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.3s]" />
                        </span>
                      : ''
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 自动滚动锚点 */}
        <div ref={bottomRef} />
      </div>

      {/* 错误横幅 */}
      {error && (
        <div className="mx-4 mb-1 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 animate-in fade-in">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-300 flex-1">{error}</span>
          <button onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/3">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题，按 Enter 发送..."
            rows={1}
            disabled={streaming}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none disabled:opacity-40"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          {streaming ? (
            <button onClick={stopStreaming}
              className="px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="px-3 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-xs text-white/20 mt-2 pl-1">
          Enter 发送 · Shift+Enter 换行 · AI生成内容仅供运营参考
        </p>
      </div>
    </div>
  );
}

// ============== 空状态 ==============

function EmptyState({ suggestions, onPick }: { suggestions: string[]; onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">AI 营销顾问</h3>
      <p className="text-sm text-white/35 mb-6 max-w-xs">
        我可以帮你分析账户数据、提供投放建议、审查创意质量，试试下面的问题吧
      </p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map(s => (
          <button key={s} onClick={() => onPick(s)}
            className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all truncate">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
