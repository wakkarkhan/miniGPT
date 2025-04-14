import { auth } from "./auth";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatResponse {
  chats: Chat[];
  total: number;
  page: number;
  limit: number;
}

interface SingleChatResponse {
  id: string;
  title: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface CreateChatResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "https://stg-llmbe.werifaid.com";

export const chatService = {
  async getChats(page = 1, limit = 10): Promise<ChatResponse> {
    const token = auth.getToken();
    console.log("token", token);

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/chat/?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTY1ODQyNC1mZmNlLTQzZTUtOWUxYy0xMjAyNjFiYWFhNDQiLCJleHAiOjE3NDY0MDg0Nzd9.53T4W0Dqzq-XEj2LCO7VRZZsgs44rOTw3B5TJYMn_Yk`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    return response.json();
  },

  async getSingleChat(chatId: string): Promise<SingleChatResponse> {
    const token = auth.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTY1ODQyNC1mZmNlLTQzZTUtOWUxYy0xMjAyNjFiYWFhNDQiLCJleHAiOjE3NDY0MDg0Nzd9.53T4W0Dqzq-XEj2LCO7VRZZsgs44rOTw3B5TJYMn_Yk`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat");
    }

    return response.json();
  },

  async createNewChat(chatTitle: string): Promise<CreateChatResponse> {
    const token = auth.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTY1ODQyNC1mZmNlLTQzZTUtOWUxYy0xMjAyNjFiYWFhNDQiLCJleHAiOjE3NDY0MDg0Nzd9.53T4W0Dqzq-XEj2LCO7VRZZsgs44rOTw3B5TJYMn_Yk`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: chatTitle,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    return response.json();
  },
};
