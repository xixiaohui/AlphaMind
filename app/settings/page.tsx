'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SettingsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    defaultMarket: 'all',
    riskDisclaimer: true,
    autoRefresh: false,
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings({ ...settings, [key]: value });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 border-b border-white/10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">设置</h1>
          <p className="text-white/50 text-sm">配置您的偏好和选项</p>
        </div>
      </section>

      {/* Settings Form */}
      <section className="px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Theme */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bold mb-4">显示设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">主题模式</div>
                  <div className="text-xs text-white/40">选择界面显示模式</div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="dark">深色</option>
                  <option value="light">浅色</option>
                  <option value="auto">自动</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">默认市场</div>
                  <div className="text-xs text-white/40">首页默认展示的市场</div>
                </div>
                <select
                  value={settings.defaultMarket}
                  onChange={(e) => handleChange('defaultMarket', e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">全部市场</option>
                  <option value="A">A 股</option>
                  <option value="HK">港 股</option>
                  <option value="US">美 股</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bold mb-4">功能设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">风险提示</div>
                  <div className="text-xs text-white/40">始终显示风险提示</div>
                </div>
                <button
                  onClick={() => handleChange('riskDisclaimer', !settings.riskDisclaimer)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.riskDisclaimer ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.riskDisclaimer ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">自动刷新</div>
                  <div className="text-xs text-white/40">自动刷新市场数据</div>
                </div>
                <button
                  onClick={() => handleChange('autoRefresh', !settings.autoRefresh)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoRefresh ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bold mb-4">AI 研究设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">AI 模型</div>
                  <div className="text-xs text-white/40">选择 AI 分析引擎</div>
                </div>
                <select
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option>混元大模型</option>
                  <option>DeepSeek</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bold mb-4">数据来源</h3>
            
            <div className="space-y-3">
              {['Yahoo Finance', 'Finnhub', 'CoinGecko'].map((source) => (
                <div key={source} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/70">{source}</span>
                  <span className="text-xs text-green-400">已连接</span>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="font-bold mb-4">关于</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/70">版本</span>
                <span className="text-sm">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/70">构建日期</span>
                <span className="text-sm">2026-05-20</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-white/70">技术支持</span>
                <span className="text-sm">混元大模型 + MCP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body { background: #000; }
      `}</style>
    </div>
  );
}
