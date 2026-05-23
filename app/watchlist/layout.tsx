import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "自选跟踪",
  description:
    "管理您的自选资产列表，持续跟踪感兴趣的股票、ETF 与数字货币。获取实时涨跌概览、风险提醒与最新 AI 分析更新，支持分组管理与个性化排序。",
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
