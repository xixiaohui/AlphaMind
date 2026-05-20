import Link from 'next/link';

// 按照 ARCHITECTURE.md 的页面结构定义链接
const footerSections = [
  {
    title: '研究功能',
    links: [
      { label: '股票研究', href: '/search' },
      { label: 'ETF 研究', href: '/search?type=etf' },
      { label: '宏观研究', href: '/search?type=macro' },
      { label: 'Crypto 研究', href: '/search?type=crypto' },
    ],
  },
  {
    title: '支持资产',
    links: [
      { label: 'A股', href: '/search?market=cn' },
      { label: '港股', href: '/search?market=hk' },
      { label: '美股', href: '/search?market=us' },
      { label: '数字货币', href: '/search?market=crypto' },
    ],
  },
  {
    title: '用户服务',
    links: [
      { label: '我的自选', href: '/watchlist' },
      { label: '报告中心', href: '/reports' },
      { label: '设置', href: '/settings' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '产品介绍', href: '#' },
      { label: '使用条款', href: '#' },
      { label: '隐私政策', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 md:px-6 pt-12 md:pt-16 pb-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        {/* Brand Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 mb-10 md:mb-12">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <img src="/logo2.png" alt="混元智投" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-lg font-bold tracking-wider">混元智投</span>
            </Link>
            <p className="text-sm text-white/50 text-center md:text-left leading-relaxed max-w-xs">
              AI 金融研究助手<br />
              面向全球市场的智能研究平台
            </p>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 flex-1 w-full">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3 md:mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/5 rounded-lg p-4 md:p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-white/40 leading-relaxed">
              <p className="mb-2">
                <strong className="text-white/60">免责声明：</strong>
                混元智投提供的数据和分析仅供研究参考，不构成投资建议。投资有风险，决策需谨慎。
              </p>
              <p>
                系统中的所有内容仅用于研究、学习与信息参考场景。任何 AI 生成的分析结论都必须结合真实市场环境、公开数据和用户自身判断综合理解。
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30 text-center">
          <span>&copy; 2026 混元智投 · AI Financial Research Agent</span>
          <span>Powered by 混元大模型 · MCP</span>
        </div>
      </div>
    </footer>
  );
}
