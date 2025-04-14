"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import "highlight.js/styles/github-dark.css";
import { useToast } from "./toast-context";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-pre:my-0 max-w-none prose-headings:text-[var(--app-text)] prose-p:text-[var(--app-text)] prose-li:text-[var(--app-text)] prose-strong:text-[var(--app-text)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }], rehypeMathjax]}
        components={{
          // Custom code block rendering with copy button
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              );
            }
            return (
              <code className={`${className} text-[var(--app-text)]`} {...props}>
                {children}
              </code>
            );
          },
          // Custom table rendering
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-[var(--app-sidebar-border)] text-[var(--app-text)]" {...props} />
              </div>
            );
          },
          thead({ node, ...props }) {
            return <thead className="bg-[var(--app-message-bg)] text-[var(--app-text)]" {...props} />;
          },
          th({ node, ...props }) {
            return (
              <th
                className="border border-[var(--app-sidebar-border)] px-4 py-2 text-left text-[var(--app-text)]"
                {...props}
              />
            );
          },
          td({ node, ...props }) {
            return (
              <td
                className="border border-[var(--app-sidebar-border)] px-4 py-2 text-[var(--app-text)]"
                {...props}
              />
            );
          },
          a({ node, ...props }) {
            return (
              <a
                className="text-blue-400 hover:text-blue-300"
                {...props}
              />
            );
          },
          blockquote({ node, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-[var(--app-sidebar-border)] pl-4 text-[var(--app-text)] opacity-80"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Code block component with copy functionality
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const copyToClipboard = async () => {
    console.log("Copying to clipboard", value);
    try {
      // Try the modern Clipboard API first
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast("Code copied to clipboard!", "success", 2000);
    } catch (err) {
      // Fallback method using textarea
      const textArea = document.createElement("textarea");
      textArea.value = value;
      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        setCopied(successful);
        if (successful) showToast("Code copied to clipboard!", "success", 2000);
      } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
      }
      
      document.body.removeChild(textArea);
    }
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className={`language-${language} rounded-md bg-[var(--app-message-bg)] text-[var(--app-text)]`}>
        <code className={`language-${language}`}>{value}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code to clipboard"
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4" />
            <span className="ml-1">Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-4 w-4" />
            <span className="ml-1">Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

// Icons
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}