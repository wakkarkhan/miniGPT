"use client";

import React from 'react';
import { ReactNode, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useToast } from "./toast-context";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
  id?: string; // Optional ID for tracking streaming messages
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isStreaming = message.role === "assistant" && message.content === "";
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const copyToClipboard = async () => {
    if (!message.content) return;
    
    try {
      // Try the modern Clipboard API first
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast("Copied to clipboard!", "success", 2000);
    } catch (err) {
      // Fallback method using textarea
      const textArea = document.createElement("textarea");
      textArea.value = message.content;
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
        if (successful) showToast("Copied to clipboard!", "success", 2000);
      } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
      }
      
      document.body.removeChild(textArea);
    }
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl rounded-lg px-4 py-2 ${
        isUser 
          ? 'bg-[#7957f8] text-white' 
          : 'bg-[#2d2e3a] text-white'
      }`}>
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;

// Helper components
function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></div>
    </div>
  );
}

function CopyIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
} 