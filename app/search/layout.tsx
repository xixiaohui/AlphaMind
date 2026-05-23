import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全市场资产搜索",
  description:
    "支持股票、ETF、基金、指数、期货、数字货币的全球资产统一搜索。快速查找任意资产代码，获取实时行情、核心指标、AI 分析摘要与研究报告入口。涵盖 A 股、港股、美股、加密市场等主流市场。",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
