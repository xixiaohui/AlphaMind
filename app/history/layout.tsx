import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "对话历史",
  description:
    "查看您过往的所有 AI 金融研究对话记录。支持按时间排序、按资产分类筛选，随时回溯重要研究结论，继续未完成的分析讨论。",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
