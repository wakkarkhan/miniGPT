import React, { useRef, useEffect, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Message } from '@/components/MessageBubble';
import { ArrowUp, User, AlertTriangle } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[var(--app-bg)]"
        ref={messagesEndRef}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[var(--app-text)]">What can I help with?</h2>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="animate-fadeIn">
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
                {message.role === 'assistant' && (
                  <div className="mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-[#7957f8] flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-5 h-5 text-white"
                      >
                        <path d="M12 8V4H8"></path>
                        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                        <path d="M2 14h2"></path>
                        <path d="M20 14h2"></path>
                        <path d="M15 13v2"></path>
                        <path d="M9 13v2"></path>
                      </svg>
                    </div>
                  </div>
                )}
                <div className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-[var(--app-user-message-bg)] text-white' 
                    : 'bg-[var(--app-message-bg)] text-[var(--app-text)]'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="text-[var(--app-text)]">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="ml-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message actions for assistant messages */}
              {message.role === 'assistant' && (
                <div className="flex ml-11 mt-1 space-x-2">
                  <button className="text-[var(--app-text)] opacity-60 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  </button>
                  <button className="text-[var(--app-text)] opacity-60 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </button>
                  <button className="text-[var(--app-text)] opacity-60 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#7957f8] flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5 text-white"
                >
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
              </div>
            </div>
            <div className="max-w-3xl rounded-lg px-4 py-2 bg-[var(--app-message-bg)]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 bg-[var(--app-bg)]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-4 pr-12 rounded-full bg-[var(--app-input-bg)] border-none text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-button-bg)]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[var(--app-button-bg)] text-white disabled:opacity-50"
            >
              <ArrowUp size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 