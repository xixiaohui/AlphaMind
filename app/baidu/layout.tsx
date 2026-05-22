'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { TabNav } from './panels';

export default function BaiduLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider">百度营销工作台</h1>
              <p className="text-white/40 text-sm mt-1">策略 · 投放 · 创意 · 数据分析</p>
            </div>
          </div>

          {/* Tab 导航 */}
          <TabNav />

          {/* 子页面内容 */}
          {children}
        </div>
      </div>
      <Footer />
      <style jsx global>{`body { background: #000; }`}</style>
    </div>
  );
}
