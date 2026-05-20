'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// 按照 ARCHITECTURE.md 的页面结构定义导航
const navLinks = [
  { href: '/', label: '首页' },
  { href: '/market', label: '市场总览' },
  { href: '/search', label: '搜索' },
  { href: '/watchlist', label: '自选' },
  { href: '/reports', label: '报告' },
  { href: '/ai', label: 'AI问答' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between backdrop-blur-md bg-black/90 border-b border-white/10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 md:gap-3">
        <img src="/logo2.png" alt="混元智投" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain" />
        <span className="text-sm md:text-base font-bold tracking-wider">混元智投</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Global Search Button - Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/search"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden lg:inline">搜索股票、ETF、宏观...</span>
          <span className="lg:hidden">搜索</span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
        aria-label="菜单"
      >
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 py-4 px-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/10">
              <Link
                href="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
