"use client";

import { useState, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import ChatWindow from '@/components/ChatWindow';
import { Message } from "@/components/MessageBubble";
import { getChatCompletion, streamChatCompletion } from "@/services/openai";
import { useToast } from "@/components/toast-context";
import ChatHistorySidebar, { ChatHistoryItem } from '@/components/ChatHistorySidebar';
import { Menu, User, PlusCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [useStream, setUseStream] = useState(false);
  const { showToast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Previous chat about React', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'TypeScript help', timestamp: new Date(Date.now() - 43200000) },
    { id: '3', title: 'Next.js routing question', timestamp: new Date() },
  ]);
  const [activeChat, setActiveChat] = useState<string | null>('3');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      setError("Please enter your OpenAI API key");
      showToast("Please enter your OpenAI API key", "error", 5000);
      setShowApiKeyInput(true);
      return;
    }

    // Create user message
    const userMessage: Message = { role: "user", content };
    
    setIsLoading(true);
    setError(null);

    try {
      if (useStream) {
        // For streaming response
        // Add user message and empty assistant message
        const assistantMessageId = Date.now().toString(); // Using timestamp as a unique ID
        setMessages((prev) => [
          ...prev,
          userMessage,
          { role: "assistant", content: "", id: assistantMessageId }
        ]);
        
        let streamContent = "";
        await streamChatCompletion(
          messages.concat(userMessage),
          apiKey,
          (chunk) => {
            streamContent += chunk;
            // Update only the assistant message with the new content
            setMessages((prev) => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: streamContent } 
                  : msg
              )
            );
          }
        );
        
        // Show success toast after streaming completes
        showToast("Response received successfully", "success", 2000);
      } else {
        // Add user message to chat
        setMessages((prev) => [...prev, userMessage]);
        
        // For regular response
        const response = await getChatCompletion(
          messages.concat(userMessage),
          apiKey
        );
        
        // Add assistant response to chat
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Show success toast
        showToast("Response received successfully", "success", 2000);
      }
    } catch (err) {
      console.error("Error getting response:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get response from OpenAI";
      setError(errorMessage);
      showToast(errorMessage, "error", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    // Save API key to localStorage
    localStorage.setItem("openai-api-key", apiKey);
    showToast("API key saved successfully!", "success", 3000);
    setError(null);
    setShowApiKeyInput(false);
  };

  // Toggle streaming mode
  const toggleStreamMode = () => {
    setUseStream(!useStream);
    showToast(`Streaming mode ${!useStream ? "enabled" : "disabled"}`, "info", 2000);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    // In a real app, you would load the chat messages for this chat ID
  };

  const handleStartNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistoryItem = {
      id: newChatId,
      title: "New conversation",
      timestamp: new Date(),
    };
    
    setChatHistory([newChat, ...chatHistory]);
    setActiveChat(newChatId);
    setMessages([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-[var(--app-text)]"
          >
            <Menu size={20} />
          </button>
          <button 
            onClick={handleStartNewChat}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-[var(--app-text)]"
          >
            <PlusCircle size={20} />
          </button>
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded p-1 mr-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
            </div>
            <span className="font-semibold text-lg text-[var(--app-text)]">EnterpriseGPT</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* API Key Input */}
          {showApiKeyInput && (
            <form onSubmit={handleApiKeySubmit} className="flex items-center">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="OpenAI API Key"
                className="text-sm px-2 py-1 rounded-l border border-[var(--app-header-border)] bg-[var(--app-input-bg)] text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-[var(--app-button-bg)]"
              />
              <button
                type="submit"
                className="text-xs px-2 py-1 bg-[var(--app-button-bg)] text-white rounded-r hover:bg-[var(--app-button-hover)] transition-colors"
              >
                Save
              </button>
            </form>
          )}
          
          {/* API Key Button */}
          {!showApiKeyInput && (
            <button 
              onClick={() => setShowApiKeyInput(true)}
              className="text-xs px-3 py-1 rounded-full bg-[var(--app-message-bg)] hover:bg-opacity-80 text-[var(--app-text)]"
            >
              API Key
            </button>
          )}
          
          {/* Stream Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[var(--app-text)] opacity-70">Stream</span>
            <div 
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--app-button-bg)] ${useStream ? 'bg-[var(--app-button-bg)]' : 'bg-gray-600'}`}
              onClick={toggleStreamMode}
              role="switch"
              aria-checked={useStream}
              tabIndex={0}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useStream ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[var(--app-message-bg)] hover:bg-opacity-80 text-[var(--app-text)]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          {/* Profile Button */}
          <button className="p-2 bg-[var(--app-button-bg)] rounded-full hover:opacity-90 transition-colors">
            <User size={20} className="text-white" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <ChatHistorySidebar 
            chatHistory={chatHistory}
            activeChat={activeChat}
            sidebarOpen={sidebarOpen}
            onSelectChat={handleSelectChat}
            onStartNewChat={handleStartNewChat}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatWindow 
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
