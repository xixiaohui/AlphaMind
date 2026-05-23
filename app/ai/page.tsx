'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// ============== 类型定义 ==============

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// ============== 常量 ==============

const STORAGE_KEY = 'alphamind_conversations';
const MAX_CONVERSATIONS = 50;

// 快捷提示
const quickPrompts = [
  { label: '分析贵州茅台', prompt: '分析贵州茅台（600519）的投资价值，包括基本面、行业地位、估值水平' },
  { label: '解读财报', prompt: '帮我解读最近的财报数据，重点关注营收、利润和现金流' },
  { label: '市场热点', prompt: '今日A股市场有什么热点板块和投资机会？' },
  { label: '行业对比', prompt: '对比新能源汽车行业头部企业的竞争优势和投资价值' },
  { label: '宏观分析', prompt: '分析当前宏观经济形势对股市的影响' },
  { label: '技术分析', prompt: '分析贵州茅台近期技术走势和关键支撑位' },
];

// ============== 工具函数 ==============

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - timestamp;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============== 存储操作 ==============

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

// ============== 组件 ==============

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-white/10 border border-white/20' 
          : 'hover:bg-white/5 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{conversation.title}</div>
        <div className="text-xs text-white/40 mt-0.5">
          {formatTime(conversation.updatedAt)}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-red-400 transition-all"
        title="删除对话"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white/5 border border-white/10 rounded-bl-md'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-white/60 ml-1 animate-pulse" />
          )}
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-white/30'}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AIChatContent />
    </Suspense>
  );
}

function AIChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化
  useEffect(() => {
    setIsLoaded(true);
    const saved = loadConversations();
    setConversations(saved);
    
    // 检查是否为移动端
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // 从 URL 参数获取初始提示
    const prompt = searchParams.get('prompt');
    if (prompt && saved.length === 0) {
      setInput(prompt);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 创建新对话
  const createNewConversation = useCallback((firstMessage?: string): Conversation => {
    const title = firstMessage 
      ? truncateText(firstMessage, 30) 
      : `新对话 ${conversations.length + 1}`;
    
    const newConversation: Conversation = {
      id: generateId(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const updated = [newConversation, ...conversations].slice(0, MAX_CONVERSATIONS);
    setConversations(updated);
    saveConversations(updated);
    setCurrentConversationId(newConversation.id);
    
    return newConversation;
  }, [conversations]);

  // 切换对话
  const switchConversation = useCallback((id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setMessages(conv.messages);
      setCurrentConversationId(id);
      if (isMobile) setIsSidebarOpen(false);
    }
  }, [conversations, isMobile]);

  // 删除对话
  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    
    if (currentConversationId === id) {
      if (updated.length > 0) {
        switchConversation(updated[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  }, [conversations, currentConversationId, switchConversation]);

  // 保存消息到对话
  const saveMessage = useCallback((newMessages: Message[]) => {
    if (!currentConversationId) return;
    
    const updated = conversations.map(c => {
      if (c.id === currentConversationId) {
        return {
          ...c,
          messages: newMessages,
          updatedAt: Date.now(),
          title: c.messages.length === 0 && newMessages.length > 0 
            ? truncateText(newMessages[0].content, 30) 
            : c.title
        };
      }
      return c;
    });
    
    setConversations(updated);
    saveConversations(updated);
  }, [conversations, currentConversationId]);

  // 发送消息（调用 API）
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    let conversationId = currentConversationId;
    let conversation = conversations.find(c => c.id === conversationId);
    
    // 如果没有当前对话，创建新对话
    if (!conversation) {
      conversation = createNewConversation(input.trim());
      conversationId = conversation.id;
    }
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessage(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    // 创建 AI 消息占位
    const aiMessageId = generateId();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages([...updatedMessages, aiMessage]);

    try {
      // 调用 API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.delta) {
                  fullContent += data.delta;
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: fullContent }
                      : msg
                  ));
                } else if (data.done) {
                  break;
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch {
                // 忽略 JSON 解析错误，继续处理下一行
              }
            }
          }
        }
      }

      // 移除 streaming 状态
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

      // 保存最终消息
      saveMessage([...updatedMessages, { ...aiMessage, content: fullContent, isStreaming: false }]);

    } catch (err: unknown) {
      const e = err as Error;
      console.error('API 调用失败:', e);
      setError(e.message || '请求失败，请重试');
      
      // 更新 AI 消息为错误提示
      const errorContent = `抱歉，发生了错误：${e.message || '未知错误'}\n\n请稍后重试。`;
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: errorContent, isStreaming: false }
          : msg
      ));

      // 保存错误消息
      saveMessage([...updatedMessages, { ...aiMessage, content: errorContent, isStreaming: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 清空当前对话
  const clearConversation = () => {
    setMessages([]);
    setError(null);
    if (currentConversationId) {
      const updated = conversations.map(c => {
        if (c.id === currentConversationId) {
          return { ...c, messages: [], updatedAt: Date.now() };
        }
        return c;
      });
      setConversations(updated);
      saveConversations(updated);
    }
  };

  // 跳转到历史页面
  const goToHistory = () => {
    router.push('/history');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased flex flex-col">
      <Header />

      <div className="flex-1 flex pt-16">
        {/* 侧边栏 - 对话列表 */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${!isMobile ? 'relative translate-x-0' : ''}
        `}>
          <div className="flex flex-col h-full">
            {/* 侧边栏头部 */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">对话历史</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg lg:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  createNewConversation();
                  setMessages([]);
                  setError(null);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建对话
              </button>
            </div>

            {/* 对话列表 */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onClick={() => switchConversation(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  暂无对话记录
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={goToHistory}
                className="w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                查看全部历史
              </button>
            </div>
          </div>
        </aside>

        {/* 移动端遮罩 */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* 错误提示 */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
              <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* 聊天区域 */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {/* 移动端菜单按钮 */}
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="fixed left-4 bottom-24 z-30 p-3 bg-white text-black rounded-full shadow-lg hover:bg-white/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {messages.length === 0 ? (
                /* 空状态 */
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  {/* AI 助手信息 */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">AI 研究助手</h2>
                      <p className="text-sm text-white/50">基于混元大模型 · 7×24 小时在线</p>
                    </div>
                  </div>
                  
                  <p className="text-white/60 text-center mb-8 max-w-md">
                    输入您想了解的金融问题，AI 将为您提供结构化的研究分析
                  </p>

                  {/* 快捷提示 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
                    {quickPrompts.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(item.prompt)}
                        className="p-4 text-left bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="text-sm font-medium mb-1">{item.label}</div>
                        <div className="text-xs text-white/40 line-clamp-2">{item.prompt.slice(0, 40)}...</div>
                      </button>
                    ))}
                  </div>

                  {/* 功能入口 */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/search" className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                      搜索资产
                    </Link>
                    <Link href="/watchlist" className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                      我的自选
                    </Link>
                    <Link href="/reports" className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                      报告中心
                    </Link>
                  </div>
                </div>
              ) : (
                /* 消息列表 */
                <div className="space-y-4 pb-4">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* 输入区域 */}
          <div className="px-4 py-4 border-t border-white/10 bg-black/80 backdrop-blur-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                {/* 操作按钮 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearConversation}
                    disabled={messages.length === 0}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="清空对话"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={goToHistory}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="对话历史"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                {/* 输入框 */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={isTyping ? "AI 正在思考中..." : "输入您的问题..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isTyping}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* 发送按钮 */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-white text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* 底部提示 */}
              <div className="text-center mt-3 text-xs text-white/30">
                AI 助手基于混元大模型生成，内容仅供参考
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <style jsx global>{`
        body { background: #000; }
      `}</style>
    </div>
  );
}
