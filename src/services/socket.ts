import { SOCKET_EVENT_NAME } from '@/constants/socketEvents';

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: any) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private errorHandlers: ErrorHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay

  constructor() {
    this.initializeEventHandlers();
  }

  private initializeEventHandlers() {
    // Initialize empty arrays for each event type
    Object.values(SOCKET_EVENT_NAME).forEach(eventName => {
      this.messageHandlers.set(eventName, []);
    });
  }

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected');
      return;
    }

    try {
      this.socket = new WebSocket(`wss://stg-llmbe.werifaid.com`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication immediately after connection
        this.socket?.send(JSON.stringify({ 
          type: 'authentication',
          token 
        }));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventType = data.type;
          const handlers = this.messageHandlers.get(eventType);
          
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(token);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleReconnect(token);
    }
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  on(eventName: keyof typeof SOCKET_EVENT_NAME, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(SOCKET_EVENT_NAME[eventName]) || [];
    handlers.push(handler);
    this.messageHandlers.set(SOCKET_EVENT_NAME[eventName], handlers);
  }

  off(eventName: keyof typeof SOCKET_EVENT_NAME, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(SOCKET_EVENT_NAME[eventName]) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(SOCKET_EVENT_NAME[eventName], handlers);
    }
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }

  offError(handler: ErrorHandler) {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  send(eventName: keyof typeof SOCKET_EVENT_NAME, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: SOCKET_EVENT_NAME[eventName],
        ...data
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create a singleton instance
export const socketService = new SocketService(); 