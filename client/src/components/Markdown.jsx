import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children, className = '' }) {
  return (
    <div className={`text-left w-full ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: nodeChildren }) => (
            <h1 className="text-2xl font-bold text-stone-900 mb-3">{nodeChildren}</h1>
          ),
          h2: ({ children: nodeChildren }) => (
            <h2 className="text-xl font-bold text-stone-900 mt-4 mb-2">{nodeChildren}</h2>
          ),
          h3: ({ children: nodeChildren }) => (
            <h3 className="text-lg font-semibold text-stone-900 mt-3 mb-1">{nodeChildren}</h3>
          ),
          p: ({ children: nodeChildren }) => (
            <p className="text-sm text-stone-600 leading-relaxed mb-2">{nodeChildren}</p>
          ),
          ul: ({ children: nodeChildren }) => (
            <ul className="list-disc list-inside text-sm text-stone-600 mb-2">{nodeChildren}</ul>
          ),
          ol: ({ children: nodeChildren }) => (
            <ol className="list-decimal list-inside text-sm text-stone-600 mb-2">{nodeChildren}</ol>
          ),
          li: ({ children: nodeChildren }) => <li className="mb-1">{nodeChildren}</li>,
          strong: ({ children: nodeChildren }) => (
            <strong className="font-semibold text-stone-900">{nodeChildren}</strong>
          ),
          em: ({ children: nodeChildren }) => <em className="italic">{nodeChildren}</em>,
          table: ({ children: nodeChildren }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-stone-200 text-sm text-left">
                {nodeChildren}
              </table>
            </div>
          ),
          thead: ({ children: nodeChildren }) => <thead className="bg-stone-100">{nodeChildren}</thead>,
          tbody: ({ children: nodeChildren }) => <tbody>{nodeChildren}</tbody>,
          tr: ({ children: nodeChildren }) => <tr className="border-b border-stone-200">{nodeChildren}</tr>,
          th: ({ children: nodeChildren }) => (
            <th className="px-3 py-2 font-semibold text-stone-900">{nodeChildren}</th>
          ),
          td: ({ children: nodeChildren }) => (
            <td className="px-3 py-2 align-top text-stone-700">{nodeChildren}</td>
          ),
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}
