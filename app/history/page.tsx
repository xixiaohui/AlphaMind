'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  date: string;
  dateLabel: string;
  firstMessage: string;
  messageCount: number;
  messages: Message[];
}

const STORAGE_KEY = 'alphamind-chat-messages';

export default function ChatHistory() {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [groupBy, setGroupBy] = useState<'date' | 'topic'>('date');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAllMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error('读取聊天记录失败:', e);
    }
    setIsLoaded(true);
  }, []);

  const sessions = useMemo(() => {
    if (allMessages.length === 0) return [];

    const result: ChatSession[] = [];
    let currentSession: Message[] = [];
    let lastUserTime = 0;

    allMessages.forEach((msg) => {
      if (msg.role === 'user') {
        if (lastUserTime > 0 && msg.timestamp - lastUserTime > 5 * 60 * 1000) {
          if (currentSession.length > 0) {
            const firstUserMsg = currentSession.find(m => m.role === 'user');
            result.push({
              id: `session-${result.length}`,
              date: new Date(currentSession[0].timestamp).toISOString().split('T')[0],
              dateLabel: formatDateLabel(currentSession[0].timestamp),
              firstMessage: firstUserMsg?.content.slice(0, 50) || '',
              messageCount: currentSession.length,
              messages: currentSession
            });
          }
          currentSession = [];
        }
        lastUserTime = msg.timestamp;
      }
      currentSession.push(msg);
    });

    if (currentSession.length > 0) {
      const firstUserMsg = currentSession.find(m => m.role === 'user');
      result.push({
        id: `session-${result.length}`,
        date: new Date(currentSession[0].timestamp).toISOString().split('T')[0],
        dateLabel: formatDateLabel(currentSession[0].timestamp),
        firstMessage: firstUserMsg?.content.slice(0, 50) || '',
        messageCount: currentSession.length,
        messages: currentSession
      });
    }

    return result.reverse();
  }, [allMessages]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, ChatSession[]> = {};
    sessions.forEach(session => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }
      groups[session.date].push(session);
    });
    return groups;
  }, [sessions]);

  const groupedByTopic = useMemo(() => {
    const topics: Record<string, ChatSession[]> = {};
    sessions.forEach(session => {
      const topic = session.firstMessage || '其他';
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(session);
    });
    return topics;
  }, [sessions]);

  function formatDateLabel(timestamp: number): string {
    const now = new Date();
    const date = new Date(timestamp);
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    
    if (date.toDateString() === today) return '今天';
    if (date.toDateString() === yesterday) return '昨天';
    
    const diff = now.getTime() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatFullDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const goBack = () => {
    setSelectedSession(null);
    setViewMode('list');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-4" style={{ letterSpacing: '0.96px' }}>
            历史记录
          </p>
          <p className="text-3xl font-bold uppercase tracking-widest mb-4" style={{ letterSpacing: '1.6px' }}>
            暂无聊天记录
          </p>
          <p className="text-lg opacity-50 mb-8">开始与AI对话后，这里将显示您的聊天历史</p>
          <a
            href="/ai"
            className="inline-block px-8 py-4 border border-white text-white text-sm font-bold uppercase rounded-full hover:bg-white hover:text-black transition-colors"
            style={{ letterSpacing: '1.17px' }}
          >
            开始聊天
          </a>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedSession) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            <button
              onClick={goBack}
              className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
              style={{ letterSpacing: '1.17px' }}
            >
              ← 返回
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold uppercase tracking-widest truncate opacity-80" style={{ letterSpacing: '1.17px' }}>
                {selectedSession.firstMessage}
              </h1>
              <p className="text-xs opacity-50 mt-1">{formatFullDate(selectedSession.messages[0].timestamp)}</p>
            </div>
            <span className="px-4 py-2 text-xs font-bold uppercase border border-white/20 rounded-full" style={{ letterSpacing: '1.17px' }}>
              {selectedSession.messageCount} 条消息
            </span>
          </div>
        </header>

        <main className="pt-24 pb-12 px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {selectedSession.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-6 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                  <div className="flex flex-col gap-2">
                    <div
                      className={`px-6 py-5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-white text-black'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs text-zinc-500 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity" style={{ letterSpacing: '1.17px' }}>
                ← 返回首页
              </a>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <h1 className="text-lg font-bold uppercase tracking-widest" style={{ letterSpacing: '1.6px' }}>
                  聊天记录
                </h1>
                <p className="text-xs opacity-50 mt-1">{sessions.length} 个会话</p>
              </div>
            </div>
            <div className="flex gap-2 border border-white/20 rounded-full p-1">
              <button
                onClick={() => setGroupBy('date')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-full transition-all ${
                  groupBy === 'date'
                    ? 'bg-white text-black'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ letterSpacing: '1.17px' }}
              >
                按日期
              </button>
              <button
                onClick={() => setGroupBy('topic')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-full transition-all ${
                  groupBy === 'topic'
                    ? 'bg-white text-black'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ letterSpacing: '1.17px' }}
              >
                按主题
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-12 px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {groupBy === 'date' ? (
            Object.entries(groupedByDate).map(([date, dateSessions]) => (
              <div key={date}>
                <h2 className="text-xs uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.96px' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {dateSessions[0]?.dateLabel}
                </h2>
                <div className="space-y-3">
                  {dateSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session);
                        setViewMode('detail');
                      }}
                      className="w-full text-left p-6 border border-white/10 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
                            {session.firstMessage}
                          </p>
                          <div className="flex items-center gap-6 text-sm opacity-50">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {session.messageCount} 条消息
                            </span>
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(session.messages[session.messages.length - 1].timestamp)}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 opacity-30 group-hover:opacity-80 transition-opacity flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            Object.entries(groupedByTopic).map(([topic, topicSessions]) => (
              <div key={topic}>
                <h2 className="text-xs uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.96px' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {topic}
                </h2>
                <div className="space-y-3">
                  {topicSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session);
                        setViewMode('detail');
                      }}
                      className="w-full text-left p-6 border border-white/10 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm opacity-50 mb-2">{session.dateLabel}</p>
                          <div className="flex items-center gap-6 text-sm opacity-50">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {session.messageCount} 条消息
                            </span>
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(session.messages[session.messages.length - 1].timestamp)}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 opacity-30 group-hover:opacity-80 transition-opacity flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
