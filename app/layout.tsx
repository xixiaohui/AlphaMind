import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hunyuanzhitou.com"
  ),
  title: {
    template: "%s | 混元智投",
    default: "混元智投 - AI 金融研究助手",
  },
  description:
    "面向全球市场的 AI 金融研究 Agent。提供市场数据解读、财报分析、基本面分析、技术面分析、宏观分析、风险识别与研究报告生成。基于腾讯混元大模型与 Agent 工作流，定位是 AI 金融研究助手。",
  keywords: [
    "AI金融研究",
    "股票分析",
    "财报分析",
    "ETF研究",
    "数字货币研究",
    "宏观研究",
    "AI研究报告",
    "混元大模型",
    "金融AI",
    "市场分析",
    "风险识别",
    "基本面分析",
  ],
  authors: [{ name: "混元智投" }],
  creator: "混元智投",
  publisher: "混元智投",
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://hunyuanzhitou.com",
    siteName: "混元智投",
    title: "混元智投 - AI 金融研究助手",
    description:
      "面向全球市场的 AI 金融研究 Agent。市场数据解读、财报分析、基本面分析、技术面分析、宏观分析、风险识别与研究报告生成。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "混元智投 - AI 金融研究助手",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "混元智投 - AI 金融研究助手",
    description:
      "面向全球市场的 AI 金融研究 Agent。市场数据解读、财报分析、风险识别与研究报告生成。",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://hunyuanzhitou.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
