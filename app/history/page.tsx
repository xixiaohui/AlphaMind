'use client';

import { useState, useEffect, useMemo } from 'react';
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

// 主题分类
type TopicType = '个股分析' | '财报解读' | '行业研究' | '市场热点' | '技术分析' | '宏观策略' | '其他';

interface GroupedHistory {
  date: string;
  dateKey: string;
  conversations: Conversation[];
}

// ============== 常量 ==============

const STORAGE_KEY = 'alphamind_conversations';

// 主题关键词映射
const topicKeywords: Record<TopicType, string[]> = {
  '个股分析': ['贵州茅台', '腾讯', '阿里巴巴', '苹果', '特斯拉', '英伟达', '分析', '投资价值', '估值'],
  '财报解读': ['财报', '营收', '利润', '净利润', '每股收益', 'EPS', '季报', '年报'],
  '行业研究': ['行业', '产业链', '赛道', '对比', '竞争格局', '市场份额'],
  '市场热点': ['市场', '热点', '板块', '大盘', 'A股', '美股', '港股', '机会'],
  '技术分析': ['技术', 'K线', '均线', 'MACD', 'RSI', '支撑', '阻力', '走势'],
  '宏观策略': ['宏观', '经济', '政策', '利率', '通胀', '美联储', '央行', 'GDP'],
  '其他': [],
};

// ============== 工具函数 ==============

function classifyTopic(conversation: Conversation): TopicType {
  const content = conversation.title + ' ' + 
    (conversation.messages[0]?.content || '');
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (topic === '其他') continue;
    if (keywords.some(keyword => content.includes(keyword))) {
      return topic as TopicType;
    }
  }
  return '其他';
}

function getTopicColor(topic: TopicType): string {
  const colors: Record<TopicType, string> = {
    '个股分析': 'bg-blue-500/10 text-blue-400',
    '财报解读': 'bg-green-500/10 text-green-400',
    '行业研究': 'bg-purple-500/10 text-purple-400',
    '市场热点': 'bg-orange-500/10 text-orange-400',
    '技术分析': 'bg-pink-500/10 text-pink-400',
    '宏观策略': 'bg-cyan-500/10 text-cyan-400',
    '其他': 'bg-white/10 text-white/60',
  };
  return colors[topic];
}

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getDateGroupKey(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'older';
}

// ============== 组件 ==============

function TopicBadge({ topic }: { topic: TopicType }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${getTopicColor(topic)}`}>
      {topic}
    </span>
  );
}

function ConversationCard({ 
  conversation, 
  onDelete 
}: { 
  conversation: Conversation; 
  onDelete: (id: string) => void;
}) {
  const topic = classifyTopic(conversation);
  const messageCount = conversation.messages.length;
  const firstUserMessage = conversation.messages.find(m => m.role === 'user');

  return (
    <div className="group relative">
      <Link
        href={`/ai?conversation=${conversation.id}`}
        className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TopicBadge topic={topic} />
            <span className="text-xs text-white/30">
              {messageCount} 条消息
            </span>
          </div>
          <span className="text-xs text-white/30 whitespace-nowrap">
            {formatFullDate(conversation.updatedAt)}
          </span>
        </div>
        
        <h3 className="font-medium text-white/90 mb-1 line-clamp-1">
          {conversation.title}
        </h3>
        
        {firstUserMessage && (
          <p className="text-sm text-white/50 line-clamp-2">
            {firstUserMessage.content}
          </p>
        )}
      </Link>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
        title="删除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function DateSection({ 
  group, 
  onDelete,
  isExpanded 
}: { 
  group: GroupedHistory; 
  onDelete: (id: string) => void;
  isExpanded: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white/80">{group.date}</h2>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">{group.conversations.length} 条对话</span>
      </div>
      
      {isExpanded && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicFilter({ 
  selectedTopic, 
  onSelect,
  counts 
}: { 
  selectedTopic: TopicType | '全部';
  onSelect: (topic: TopicType | '全部') => void;
  counts: Record<string, number>;
}) {
  const topics: (TopicType | '全部')[] = ['全部', '个股分析', '财报解读', '行业研究', '市场热点', '技术分析', '宏观策略', '其他'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelect(topic)}
          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
            selectedTopic === topic
              ? 'bg-white text-black font-medium'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          {topic}
          {counts[topic] !== undefined && (
            <span className="ml-1.5 text-xs opacity-60">({counts[topic]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============== 主页面 ==============

export default function HistoryPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicType | '全部'>('全部');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today', 'yesterday', 'week']));

  useEffect(() => {
    // 从 localStorage 加载对话
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setConversations(parsed.sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt));
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
    setIsLoaded(true);
  }, []);

  // 过滤和分组
  const filteredAndGrouped = useMemo(() => {
    let filtered = conversations;

    // 按主题过滤
    if (selectedTopic !== '全部') {
      filtered = filtered.filter(conv => classifyTopic(conv) === selectedTopic);
    }

    // 按搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some(m => m.content.toLowerCase().includes(query))
      );
    }

    // 按日期分组
    const groups: Record<string, GroupedHistory> = {
      today: { date: '今天', dateKey: 'today', conversations: [] },
      yesterday: { date: '昨天', dateKey: 'yesterday', conversations: [] },
      week: { date: '本周', dateKey: 'week', conversations: [] },
      month: { date: '本月', dateKey: 'month', conversations: [] },
      older: { date: '更早', dateKey: 'older', conversations: [] },
    };

    filtered.forEach(conv => {
      const groupKey = getDateGroupKey(conv.updatedAt);
      groups[groupKey]?.conversations.push(conv);
    });

    // 返回非空组
    return Object.values(groups).filter(g => g.conversations.length > 0);
  }, [conversations, searchQuery, selectedTopic]);

  // 主题统计
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': conversations.length };
    const topics: TopicType[] = ['个股分析', '财报解读', '行业研究', '市场热点', '技术分析', '宏观策略', '其他'];
    
    topics.forEach(topic => {
      counts[topic] = conversations.filter(conv => classifyTopic(conv) === topic).length;
    });
    
    return counts;
  }, [conversations]);

  // 删除对话
  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这条对话记录吗？')) return;
    
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // 切换日期组展开/收起
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalCount = filteredAndGrouped.reduce((sum, g) => sum + g.conversations.length, 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider">历史记录</h1>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-medium text-sm rounded-full hover:bg-white/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新对话
            </Link>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="搜索对话内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Topic Filter */}
          <TopicFilter
            selectedTopic={selectedTopic}
            onSelect={setSelectedTopic}
            counts={topicCounts}
          />
        </div>
      </section>

      {/* History List */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {totalCount > 0 ? (
            <>
              <div className="mb-6 text-sm text-white/40">
                共 {totalCount} 条对话
              </div>
              
              {filteredAndGrouped.map((group) => (
                <DateSection
                  key={group.dateKey}
                  group={group}
                  onDelete={handleDelete}
                  isExpanded={expandedGroups.has(group.dateKey)}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">暂无记录</h3>
              <p className="text-white/50 text-sm mb-6">
                {searchQuery ? '没有找到匹配的对话' : '您的对话历史将显示在这里'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium text-sm rounded-full hover:bg-white/20 transition-colors"
                >
                  清除搜索
                </button>
              ) : (
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors"
                >
                  开始对话
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body { background: #000; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
