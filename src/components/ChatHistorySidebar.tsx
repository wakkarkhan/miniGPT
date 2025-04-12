import React from 'react';
import { MessageSquare, Search, Trash2, Edit2, Clock } from 'lucide-react';

// Define types for chat history items
export type ChatHistoryItem = {
  id: string;
  title: string;
  timestamp: Date;
};

interface ChatHistorySidebarProps {
  chatHistory?: ChatHistoryItem[];
  activeChat?: string | null;
  sidebarOpen?: boolean;
  onSelectChat?: (chatId: string) => void;
  onStartNewChat?: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  chatHistory = [],
  activeChat = null,
  sidebarOpen = true,
  onSelectChat = () => {},
  onStartNewChat = () => {},
}) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group chats by date
  const groupedHistory: Record<string, ChatHistoryItem[]> = {};
  chatHistory.forEach(chat => {
    const dateGroup = formatDate(chat.timestamp);
    if (!groupedHistory[dateGroup]) {
      groupedHistory[dateGroup] = [];
    }
    groupedHistory[dateGroup].push(chat);
  });

  return (
    <div className="h-full flex flex-col w-72 bg-[var(--app-sidebar-bg)] border-r border-[var(--app-sidebar-border)]">
      {/* Search bar */}
      <div className="p-4 border-b border-[var(--app-sidebar-border)]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--app-text)] opacity-50" />
          </div>
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full py-2 pl-10 pr-4 rounded-md bg-[var(--app-message-bg)] text-[var(--app-text)] border-none focus:outline-none focus:ring-1 focus:ring-[var(--app-button-bg)] text-sm"
          />
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--app-text)] opacity-70">Recent Conversations</h2>
          <button 
            onClick={onStartNewChat}
            className="text-xs px-2 py-1 rounded-md bg-[var(--app-button-bg)] text-white hover:bg-[var(--app-button-hover)] transition-colors"
          >
            New Chat
          </button>
        </div>
        
        {Object.entries(groupedHistory).length > 0 ? (
          Object.entries(groupedHistory).map(([dateGroup, chats]) => (
            <div key={dateGroup} className="mb-2">
              <div className="px-4 py-2 flex items-center">
                <Clock size={14} className="text-[var(--app-text)] opacity-50 mr-2" />
                <h3 className="text-xs font-medium text-[var(--app-text)] opacity-50">{dateGroup}</h3>
              </div>
              <ul className="space-y-1">
                {chats.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-[var(--app-message-bg)] transition-colors flex items-start gap-3
                                ${activeChat === chat.id ? 'bg-[var(--app-message-bg)] border-l-2 border-[var(--app-button-bg)]' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium truncate text-sm text-[var(--app-text)]">{chat.title}</p>
                          <span className="text-xs text-[var(--app-text)] opacity-50 ml-2 whitespace-nowrap">
                            {formatTime(chat.timestamp)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-[var(--app-text)] opacity-70 mt-1">
                          Last message from this conversation...
                        </p>
                      </div>
                    </button>
                    <div className={`flex px-4 py-1 space-x-2 ${activeChat === chat.id ? 'opacity-100' : 'opacity-0'}`}>
                      <button className="text-xs text-[var(--app-text)] opacity-70 hover:opacity-100 flex items-center">
                        <Edit2 size={12} className="mr-1" /> Rename
                      </button>
                      <button className="text-xs text-red-400 hover:text-red-500 flex items-center">
                        <Trash2 size={12} className="mr-1" /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="w-16 h-16 mx-auto bg-[var(--app-message-bg)] rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-[var(--app-text)] opacity-50" />
            </div>
            <p className="text-[var(--app-text)] opacity-70 text-sm">No conversations yet</p>
            <p className="text-[var(--app-text)] opacity-50 text-xs mt-1">Start a new chat to begin</p>
            <button 
              onClick={onStartNewChat}
              className="mt-4 px-4 py-2 bg-[var(--app-button-bg)] text-white rounded-md hover:bg-[var(--app-button-hover)] transition-colors text-sm"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[var(--app-sidebar-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[var(--app-button-bg)] flex items-center justify-center mr-2">
              <span className="text-white font-medium text-sm">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--app-text)]">John Doe</p>
              <p className="text-xs text-[var(--app-text)] opacity-50">Free Plan</p>
            </div>
          </div>
          <button className="text-[var(--app-text)] opacity-70 hover:opacity-100">
            <Edit2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar; 