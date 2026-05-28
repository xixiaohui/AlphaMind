'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

const components: Partial<Components> = {
  // 代码块（围栏代码）
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const isInline = !match && !codeString.includes('\n');

    if (!isInline && (match || codeString.includes('\n'))) {
      return (
        <div className="my-2 rounded-md overflow-hidden border border-white/10">
          {match && (
            <div className="px-3 py-1.5 text-[11px] text-white/40 bg-white/5 border-b border-white/5 uppercase tracking-wide">
              {match[1]}
            </div>
          )}
          <SyntaxHighlighter
            style={oneDark}
            language={match?.[1] || 'text'}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.3)',
              fontSize: '13px',
              lineHeight: '1.5',
              borderRadius: 0,
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code className="px-1 py-0.5 text-[13px] bg-white/10 rounded font-mono text-[#E9EDEF]/90" {...props}>
        {children}
      </code>
    );
  },

  // 段落
  p({ children }) {
    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
  },

  // 标题
  h1({ children }) {
    return <h1 className="text-lg font-bold mt-3 mb-2 first:mt-0 text-[#E9EDEF]">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-base font-bold mt-3 mb-1.5 first:mt-0 text-[#E9EDEF]">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-[15px] font-semibold mt-2.5 mb-1 first:mt-0 text-[#E9EDEF]">{children}</h3>;
  },
  h4({ children }) {
    return <h4 className="text-[14px] font-semibold mt-2 mb-1 first:mt-0 text-[#E9EDEF]/90">{children}</h4>;
  },

  // 列表
  ul({ children }) {
    return <ul className="mb-2 pl-4 space-y-0.5 list-disc text-[#E9EDEF]/90">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="mb-2 pl-4 space-y-0.5 list-decimal text-[#E9EDEF]/90">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },

  // 引用
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-[#005C4B] pl-3 my-2 text-[#E9EDEF]/70 italic">
        {children}
      </blockquote>
    );
  },

  // 表格
  table({ children }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="min-w-full text-sm border-collapse border border-white/10">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-white/5">{children}</thead>;
  },
  th({ children }) {
    return (
      <th className="px-3 py-2 text-left text-[#E9EDEF] font-medium border border-white/10 text-[13px]">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-3 py-1.5 border border-white/10 text-[#E9EDEF]/80 text-[13px]">
        {children}
      </td>
    );
  },

  // 链接
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#00A884] hover:underline"
      >
        {children}
      </a>
    );
  },

  // 分割线
  hr() {
    return <hr className="my-3 border-white/10" />;
  },

  // 强调
  strong({ children }) {
    return <strong className="font-semibold text-[#E9EDEF]">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-[#E9EDEF]/80">{children}</em>;
  },

  // 删除线
  del({ children }) {
    return <del className="line-through text-[#E9EDEF]/50">{children}</del>;
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
