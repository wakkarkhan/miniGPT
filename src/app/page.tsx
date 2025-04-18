"use client";

import { useState, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import ChatWindow from '@/components/ChatWindow';
import { Message } from "@/components/MessageBubble";
import { getChatCompletion, streamChatCompletion } from "@/services/openai";
import {
  socketListener,
  socketEmitter,
} from '@/services/socket/socket-listner'
import { useToast } from "@/components/toast-context";
import ChatHistorySidebar, { GroupedChats, ChatItem } from '@/components/ChatHistorySidebar';
import { Menu, User, PlusCircle, Moon, Sun, LogOut, Edit2 } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth";
import { useAuth } from '@/hooks/useAuth'
import { chatService } from '@/services/chat'
import Image from 'next/image';
import { SOCKET_EVENT_NAME } from "@/constants/socketEvents";
import { log } from "console";

export default function Home() {
  useAuth() // This will handle auth checks and redirects
  let addedWithMessageDone: Boolean = false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [useStream, setUseStream] = useState(false);
  const { showToast } = useToast();
  const [chatHistory, setChatHistory] = useState<GroupedChats>({
    Today: [],
    Yesterday: [],
    "Previous 7 Days": []
  });
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTyping, setIsTyping]: any = useState(false);
  const [currentChunk, setCurrentChunk]: any = useState("");
  const [stopResponse, setStopResponse]: any = useState(false);
  const [messageDone, setMessageDone]: any = useState(true);

  // 
  useEffect(() => {
    socketListener(SOCKET_EVENT_NAME.TYPING, handleTyping);
    socketListener(SOCKET_EVENT_NAME.MESSAGES, handleMessages);
    socketListener(SOCKET_EVENT_NAME.MESSAGE_CHUNK, handleMessageChunk);
    socketListener(SOCKET_EVENT_NAME.MESSAGE_DONE, handleMessageDone);
    socketListener(SOCKET_EVENT_NAME.NEW_MESSAGE, newMessageHandle);
    socketListener(SOCKET_EVENT_NAME.ERROR, handleError);
    socketListener(SOCKET_EVENT_NAME.STREAM_STOPPED, handleStopResponse);

    return () => {
      // Cleanup listeners to prevent duplication
      socketListener(SOCKET_EVENT_NAME.TYPING, null);
      socketListener(SOCKET_EVENT_NAME.MESSAGES, null);
      socketListener(SOCKET_EVENT_NAME.MESSAGE_CHUNK, null);
      socketListener(SOCKET_EVENT_NAME.MESSAGE_DONE, null);
      socketListener(SOCKET_EVENT_NAME.NEW_MESSAGE, null);
      socketListener(SOCKET_EVENT_NAME.ERROR, null);
    };
  }, []);

  useEffect(()=>{
    if(activeChat){
      handleSelectChat(activeChat)
    }
  },[activeChat])

  // Set initial sidebar state and handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        // For desktop, maintain user's preference
        setSidebarOpen((prev) => prev);
      } else {
        // For mobile, always start closed
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth >= 640) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatService.getChats();
        const groupedData = groupByDate(response.chats);
        setChatHistory(groupedData);

        // Set active chat to the most recent one if exists
        const allChats = [...groupedData.Today, ...groupedData.Yesterday, ...groupedData["Previous 7 Days"]];
        if (allChats.length > 0) {
          setActiveChat(allChats[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        showToast('Failed to load chat history', 'error', 5000);
      }
    };

    fetchChats();
  }, []);

  const handleError = (error: any,data:any) => {
    console.log("Error received:", error,data);
  };

  const handleMessages = (_: any, data: any) => {
    setIsTyping(false);
  };

  const handleTyping = (_: any, data: any) => {
    if (data?.is_bot) {
      setIsTyping(true);
      setStopResponse(true);
      addedWithMessageDone = false;
    }
  };

  const handleStopResponseClick = () => {
    socketEmitter(SOCKET_EVENT_NAME.STOP_STREAM, { chat_id: activeChat });
    setStopResponse(false);
  };

  const handleStopResponse = (_: any, data: any) => {
    setIsTyping(false);
    setStopResponse(false);
    // messageDone(true);
    setMessageDone(true)
  };

  const handleMessageChunk = (_: any, data: any) => {
    console.log("chunk ==>", data, useStream);
    if (useStream) {
      console.log("chunk inside  ==>", data, useStream);
      setIsTyping(false);
      addedWithMessageDone = true;

      setMessages((prev: any) => {
        const lastMessage = prev[prev.length - 1];

        if (lastMessage?.isBot) {
          return prev.map((msg: any, index: number) =>
            index === prev.length - 1
              ? { ...msg, content: msg.content + data.content }
              : msg
          );
        } else {
          return [
            ...prev,
            { id: Date.now(), content: data.content, isBot: true },
          ];
        }
      });
    }
  };

  const handleMessageDone = (_: any, data: any) => {
    setIsTyping(false);
    setStopResponse(false);

    addedWithMessageDone = true;
    setMessageDone(true);
    // setMessageList((prev) => {
    //   if (prev.length > 0 && prev[prev.length - 1].isBot) {
    //     return prev.map((msg, index) =>
    //       index === prev.length - 1 ? { ...msg, content: data.content } : msg
    //     );
    //   } else {
    //     return [...prev, { id: Date.now(), content: data.content, isBot: true }];
    //   }
    // });

    setCurrentChunk("");
  };

  const newMessageHandle = (_: any, data: any) => {
    setIsTyping(false);
    setStopResponse(false);
    if (addedWithMessageDone || !data?.isBot) {
      // setMessageDone(true)
      setMessages((prev: any) => {
        if (!data?.isBot) return prev;

        const contentMatchIndex = prev.findLastIndex(
          (msg: any) => msg.isBot && msg.content === data.content
        );

        let newMessages = [...prev];

        if (contentMatchIndex !== -1) {
          newMessages[contentMatchIndex] = {
            ...newMessages[contentMatchIndex],
            id: data.id
          };
        } else if (!newMessages.some(msg => msg.id === data.id)) {
          newMessages.push(data);
        }

        return newMessages;
      });
      return;
    }
    setMessages((prev) => {
      if (!prev.some((msg) => msg.id === data.id)) {
        return [...prev, data];
      }
      return prev;
    });
    // setMessageDone(true)
  };

  const groupByDate = (chats: any[]): GroupedChats => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // yyyy-mm-dd
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const previous7Start = new Date(now);
    previous7Start.setDate(now.getDate() - 7);

    const groups: GroupedChats = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": []
    };

    console.log("chats", chats);

    chats.forEach((chat) => {
      const itemDate = new Date(chat.updatedAt);
      const itemDateStr = itemDate.toISOString().slice(0, 10);

      if (itemDateStr === today) {
        groups.Today.push(chat);
      } else if (itemDateStr === yesterdayStr) {
        groups.Yesterday.push(chat);
      } else if (itemDate >= previous7Start && itemDate < yesterday) {
        groups["Previous 7 Days"].push(chat);
      }
    });

    return groups;
  };

  const handleSendMessage = async (content: string) => {
    // if (!apiKey) {
    // setError("Please enter your OpenAI API key");
    // showToast("Please enter your OpenAI API key", "error", 5000);
    // setShowApiKeyInput(true);

    if (!content.trim()) return;

    const newMessage = { id: Date.now(), content: content };
    setMessages((prev: any) => [...prev, newMessage]);
    if (activeChat) {
      console.log("activeChat==.", activeChat, content)
      socketEmitter(SOCKET_EVENT_NAME.MESSAGE, { chat_id: activeChat, message: content });
      setMessageDone(false);
    } else {
      const title = content.slice(0, 30);
      const result:any = await chatService.createNewChat(title);
      if (result?.id) {
        setChatHistory((prev) => ({
          ...prev,
          Today: [result, ...prev.Today],
          Yesterday: [...prev.Yesterday],
          "Previous 7 Days": [...prev["Previous 7 Days"]]
        }));
        setActiveChat(result?.id)
        socketEmitter(SOCKET_EVENT_NAME.MESSAGE, {
          chat_id: result.id,
          message: content,
        });
        setStopResponse(true);
      } else {
        console.log("Something went wrong", result);
      }
    }
    return;
    // }

    // const userMessage: Message = { role: "user", content };

    // setIsLoading(true);
    // setError(null);

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

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    // Save API key to localStorage
    localStorage.setItem("openai-api-key", apiKey);
    showToast("API key saved successfully!", "success", 3000);
    setError(null);
    setShowApiKeyInput(false);
    // let message = stripHtmlAndGetTitle(messageData);
    // if (!message.trim()) return;

    // const newMessage = { id: Date.now(), content: message };
    // setMessage((prev) => [...prev, newMessage]);
    // if (chatId) {
    //   socketEmitter(SOCKET_EVENT_NAME.MESSAGE, { chat_id: chatId, message });
    //   setMessageDone(false);
    // } else {
    //   // const title = message.slice(0, 30);
    //   const title = stripHtmlAndGetTitle(message, 30, true);
    //   const result = await chatService.createNewChat(title);
    //   if (result?.id) {
    //     dispatch(chatAction.setChatId(result.id));
    //     socketEmitter(SOCKET_EVENT_NAME.MESSAGE, {
    //       chat_id: result.id,
    //       message,
    //     });
    //     setStopResponse(true);
    //   } else {
    //     console.log("Something went wrong", result);
    //   }
    // }
  };

  // Toggle streaming mode
  const toggleStreamMode = () => {
    setUseStream(!useStream);
    showToast(`Streaming mode ${!useStream ? "enabled" : "disabled"}`, "info", 2000);
  };

  const handleSelectChat = async (chatId: string) => {
    console.log("chatId", chatId);
    // setActiveChat(chatId);

    const result: any = await chatService.getSingleChat(chatId);

    console.log("result", result);

    if (result?.messages) {
      setMessages(result.messages);
    }
    // In a real app, you would load the chat messages for this chat ID
  };

  const handleStartNewChat = () => {
    // const newChatId = Date.now().toString();
    // const newChat: ChatItem = {
    //   id: newChatId,
    //   title: "New conversation",
    //   updatedAt: new Date().toISOString(),
    // };

    // setChatHistory((prev) => ({
    //   ...prev,
    //   Today: [newChat, ...prev.Today],
    //   Yesterday: [...prev.Yesterday],
    //   "Previous 7 Days": [...prev["Previous 7 Days"]]
    // }));

    setActiveChat('');
    setMessages([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Add logout handler
  const handleLogout = async () => {
    try {
      await auth.logout();
      router.push('/login');
      showToast('Logged out successfully', 'success', 2000);
    } catch (error) {
      showToast('Failed to logout', 'error', 2000);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const giveFeedback = (messageId: string, feedback: string) => {
    let feedbackNumber = 0;
    switch (feedback) {
      case "POSITIVE":
        feedbackNumber = 1;
        break;
      case "NEGATIVE":
        feedbackNumber = -1;
        break;
      case "NEUTRAL":
      default:
        feedbackNumber = 0;
        break;
    }
    chatService.submitFeedback(messageId, feedbackNumber)
      .then((res) => {
        // refresh();
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, feedback: feedback } : msg
          )
        );
      })
      .catch((error) => console.log("err", error));
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-3 border-b border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-[var(--app-text)]"
            title="Toggle sidebar"
          >
            <Image
              src="/toggle.png"
              alt="toggle-sidebar"
              width={24}
              height={24}
              priority
              className={`transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={handleStartNewChat}
            className="p-1 sm:p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-[var(--app-text)]"
            title="Start new chat"
          >
            <Image
              src="/new-chat.png"
              alt="new-chat"
              width={24}
              height={24}
              priority
            />
          </button>
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="logo"
              width={28}
              height={28}
              priority
              className="mr-2"
            />
            <span className="font-semibold text-lg text-[var(--app-text)]">EnterpriseGPT</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3">
          {showApiKeyInput && (
            <form onSubmit={handleApiKeySubmit} className="hidden sm:flex items-center">
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

          {!showApiKeyInput && (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="hidden sm:block text-xs px-3 py-1 rounded-full bg-[var(--app-message-bg)] hover:bg-opacity-80 text-[var(--app-text)]"
            >
              API Key
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-xs text-[var(--app-text)] opacity-70">Stream</span>
            <button
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--app-button-bg)] ${useStream ? 'bg-[var(--app-button-bg)]' : 'bg-gray-600'}`}
              onClick={toggleStreamMode}
              role="switch"
              aria-checked={useStream ? "true" : "false"}
              title="Toggle streaming mode"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useStream ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="hidden sm:block p-1 sm:p-2 rounded-full bg-[var(--app-message-bg)] hover:bg-opacity-80 text-[var(--app-text)]"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="relative user-menu-container">
            <button
              className="p-1 sm:p-2 bg-[var(--app-button-bg)] rounded-full hover:opacity-90 transition-colors"
              title="User profile"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              style={{ background: 'var(--app-button-gradient)'}}
            >
              <Image
                src="/profile.png"
                alt="profile"
                width={24}
                height={24}
                priority
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--app-bg)] border border-[var(--app-header-border)] z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-message-bg)]"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ChatHistorySidebar
          chatHistory={chatHistory}
          activeChat={activeChat}
          sidebarOpen={sidebarOpen}
          onSelectChat={(chatId:string)=>{setActiveChat(chatId)}}
          onStartNewChat={handleStartNewChat}
          onToggleSidebar={toggleSidebar}
        >
          {/* Add theme toggle to sidebar footer for mobile */}
          {/* <div className="p-3 sm:p-4 border-t border-[var(--app-sidebar-border)]"> */}
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--app-button-bg)] flex items-center justify-center mr-2">
                  <span className="text-white font-medium text-xs sm:text-sm">JD</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[var(--app-text)]">John Doe</p>
                  <p className="text-[10px] sm:text-xs text-[var(--app-text)] opacity-50">Free Plan</p>
                </div>
              </div> */}
              {/* <div className="flex items-center space-x-2"> */}
                <button 
                  onClick={toggleTheme}
                  className="sm:hidden p-2 rounded-full bg-[var(--app-message-bg)] hover:bg-opacity-80 text-[var(--app-text)]"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {/* <button 
                  className="text-[var(--app-text)] opacity-70 hover:opacity-100"
                  title="Edit profile"
                >
                  <Edit2 size={12} className="sm:hidden" />
                  <Edit2 size={14} className="hidden sm:block" />
                </button> */}
              {/* </div> */}
            {/* </div> */}
          </div>
        </ChatHistorySidebar>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col relative ${sidebarOpen ? 'sm:ml-0' : 'ml-0'}`}>
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              giveFeedback={giveFeedback}
              isTyping={isTyping}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
