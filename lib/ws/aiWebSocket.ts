export type WSResponse = {
  type: string;
  id?: string;
  // Add known properties for different message types
  session_id?: string; // for connection_established
  message?: string; // for user_message echo
  display_name?: string; // for assistant_metadata
  chunk?: string; // for assistant_message_chunk
  state?: any; // for session_state
  payload?: {
    items?: any[];
    text?: string;
    title?: string;
    cardType?: "menuItem" | "room";
  };
};

type MessageHandler = (msg: string | WSResponse) => void;
type VoidHandler = () => void;

export class AIWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private shouldReconnect = true;
  private messageHandlers: MessageHandler[] = [];
  private openHandlers: VoidHandler[] = [];
  private closeHandlers: VoidHandler[] = [];
  private errorHandlers: ((err: Event) => void)[] = [];
  private backoffBase = 500; // ms

  constructor(url?: string) {
    this.url = url || (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_AI_WS_URL || '') : '');
    if (!this.url) {
      // The file is intentionally permissive: it doesn't throw during import.
      // The application should set `NEXT_PUBLIC_AI_WS_URL` before calling `connect()`.
      console.warn('[AIWebSocketClient] No WS URL provided. Set NEXT_PUBLIC_AI_WS_URL or pass url to constructor.');
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onOpen(handler: VoidHandler) {
    this.openHandlers.push(handler);
    return () => {
      this.openHandlers = this.openHandlers.filter((h) => h !== handler);
    };
  }

  onClose(handler: VoidHandler) {
    this.closeHandlers.push(handler);
    return () => {
      this.closeHandlers = this.closeHandlers.filter((h) => h !== handler);
    };
  }

  onError(handler: (err: Event) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }

  connect(url?: string) {
    if (url) this.url = url;
    if (!this.url) {
      console.error('[AIWebSocketClient] No URL provided to connect to.');
      return;
    }

    this.shouldReconnect = true;
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      console.error('[AIWebSocketClient] Failed to create WebSocket:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.openHandlers.forEach((h) => h());
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSResponse;
        this.messageHandlers.forEach((h) => h(data));
      } catch (err) {
        console.warn('[AIWebSocketClient] Received non-JSON message:', event.data);
        // If backend sends raw strings, wrap them into a payload
        const wrapped: WSResponse = { type: 'raw', payload: event.data };
        this.messageHandlers.forEach((h) => h(wrapped));
      }
    };

    this.ws.onclose = () => {
      this.closeHandlers.forEach((h) => h());
      this.ws = null;
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      this.errorHandlers.forEach((h) => h(err));
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (err) {
        console.warn('[AIWebSocketClient] Error closing socket', err);
      }
    }
    this.ws = null;
  }

  send(message: Record<string, any>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[AIWebSocketClient] Socket not open. Message not sent:', message);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('[AIWebSocketClient] Failed to send message', err);
      return false;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[AIWebSocketClient] Max reconnect attempts reached. Giving up.');
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(30000, this.backoffBase * Math.pow(2, this.reconnectAttempts));
    console.info(`[AIWebSocketClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => {
      if (!this.shouldReconnect) return;
      this.connect();
    }, delay);
  }
}
