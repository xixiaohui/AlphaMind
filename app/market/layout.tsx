import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全球市场总览",
  description:
    "实时查看全球主要市场指数、行业涨跌热力图、ETF 资金流向、大宗商品、数字货币与大类资产表现。AI 驱动的市场综述与宏观事件摘要，帮您快速把握全球市场脉动。",
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
