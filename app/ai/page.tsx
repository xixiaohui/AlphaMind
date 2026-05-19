'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

const STORAGE_KEY = 'alphamind-chat-messages';

export default function AgentChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error('读取聊天记录失败:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('保存聊天记录失败:', e);
      }
    }
  }, [messages, isLoaded]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    }]);
    
    setInput('');
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '请求失败');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.delta) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: newMessages[lastIndex].content + data.delta
                      };
                    }
                    return newMessages;
                  });
                }
                if (data.done) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        isStreaming: false
                      };
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // ignore parse error
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Agent调用失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('清除聊天记录失败:', e);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity" style={{ letterSpacing: '1.17px' }}>
            ← 返回首页
          </a>
          <div className="w-px h-6 bg-white/20"></div>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ letterSpacing: '1.17px' }}>
            AI 对话
          </span>
        </div>
        <button
          onClick={clearChat}
          className="px-4 py-2 text-sm font-bold uppercase tracking-wider border border-white/20 rounded-full hover:bg-white hover:text-black transition-all"
          style={{ letterSpacing: '1.17px' }}
        >
          清空对话
        </button>
      </nav>

      {/* Messages Container */}
      <main className="pt-24 pb-32 px-8 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <p className="text-xs uppercase tracking-widest opacity-50 mb-6" style={{ letterSpacing: '0.96px' }}>
                AI 金融研究助手
              </p>
              <h2 className="text-4xl font-bold uppercase tracking-widest mb-8" style={{ letterSpacing: '1.6px' }}>
                开始对话
              </h2>
              <p className="text-lg opacity-50 mb-12 max-w-lg">
                输入您的金融问题，AI将为您提供专业的研究分析
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                {[
                  { text: '分析贵州茅台' },
                  { text: '解读最新财报' },
                  { text: '市场趋势分析' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(item.text)}
                    className="px-6 py-4 text-sm border border-white/20 rounded-lg hover:bg-white hover:text-black transition-all"
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-6 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5'
                  }`}>
                    {msg.role === 'user' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold uppercase">AI</span>
                    )}
                  </div>

                  {/* Message content */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div
                      className={`px-6 py-5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-white text-black rounded-tr-sm'
                          : 'bg-white/5 border border-white/10 rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert max-w-none
                          prose-p:leading-8 prose-p:mb-4
                          prose-headings:font-semibold prose-headings:mb-3 prose-headings:mt-6
                          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                          prose-code:text-pink-400
                          prose-pre:p-0 prose-pre:bg-transparent
                          prose-ul:my-4 prose-ol:my-4 prose-li:my-2
                          prose-li:marker:text-zinc-500
                          prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:bg-white/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:my-4
                          prose-table:text-sm prose-th:bg-white/10 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2
                          prose-hr:border-white/10 prose-my-6
                        ">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const code = String(children).replace(/\n$/, '');
                                const isInline = !match && !className;

                                if (isInline) {
                                  return (
                                    <code className="px-1.5 py-0.5 bg-white/10 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  );
                                }

                                return (
                                  <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10">
                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                                      <span className="text-xs text-zinc-400 font-mono">{match ? match[1] : 'code'}</span>
                                      <button
                                        onClick={() => copyToClipboard(code)}
                                        className="opacity-0 group-hover:opacity-100 text-xs text-zinc-400 hover:text-white transition-opacity"
                                      >
                                        复制
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match ? match[1] : 'text'}
                                      PreTag="div"
                                      customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        background: 'transparent',
                                      }}
                                    >
                                      {code}
                                    </SyntaxHighlighter>
                                  </div>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                                    <table className="w-full text-sm">{children}</table>
                                  </div>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-white/50 ml-1 animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs text-zinc-500 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="flex justify-start">
              <div className="flex gap-6 max-w-[80%]">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="px-6 py-5 rounded-2xl rounded-tl-sm bg-red-500/10 border border-red-500/30 text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4 border border-white/20 rounded-2xl px-6 py-4 bg-white/5 focus-within:border-white/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              className="flex-1 bg-transparent resize-none text-white placeholder-zinc-500 focus:outline-none py-1 max-h-36"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex-shrink-0 px-6 py-3 bg-white text-black text-sm font-bold uppercase rounded-full hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ letterSpacing: '1.17px' }}
            >
              发送
            </button>
          </div>
          <p className="text-center text-xs text-zinc-600 mt-4">
            AI助手可能会产生不准确的信息，请酌情参考
          </p>
        </div>
      </footer>
    </div>
  );
}
