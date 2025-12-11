"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { RoomCard } from "./RoomCard";
import { aiServiceConfigs, ServiceType } from "@/components/shared/ai-service-configs";
import { AIWebSocketClient, WSMessage, WSResponse } from "@/lib/ws/aiWebSocket";
import { BASE_API_URL } from "@/lib/api/base";
import {
  useCreateChatSessionMutation,
  useGetChatSessionQuery,
} from "@/lib/api/services-api";
// Helper functions for localStorage session management
function getSessionStorageKey(serviceType: string): string {
  return `ai_chat_session_${serviceType}`;
}
interface StoredSessionData {
  sessionId: string;
  proxyToken: string;
}
function getStoredSessionData(serviceType: string): StoredSessionData | null {
  if (typeof window === "undefined") return null;
  const rawData = localStorage.getItem(getSessionStorageKey(serviceType));
  if (!rawData) return null;
  try {
    return JSON.parse(rawData) as StoredSessionData;
  } catch (e) {
    console.error("Failed to parse stored session data, clearing it.", e);
    localStorage.removeItem(getSessionStorageKey(serviceType));
    return null;
  }
}

function storeSessionData(serviceType: string, sessionId: string, proxyToken: string): void {
  if (typeof window === "undefined") return;
  const data: StoredSessionData = { sessionId, proxyToken };
  localStorage.setItem(getSessionStorageKey(serviceType), JSON.stringify(data));
}

function clearStoredSession(serviceType: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getSessionStorageKey(serviceType));
}

// Define the type for a menu item as it will be displayed in the chat
export interface AIChatMenuItem {
  id: string;
  name: string;
  shortDescription?: string;
  price: number;
  currencyCode: string; // e.g., "USD"
  imageUrl?: string;
  prepTime?: number; // in minutes
}

export interface AIChatRoomItem {
  id: string;
  name: string;
  shortDescription?: string;
  price: number;
  currencyCode: string;
  imageUrl?: string;
  amenities?: string[];
}

// Define the type for a chat message, now supporting menu items
interface ChatMessage {
  text?: string; // Make text optional
  sender: "user" | "ai" | "system";
  items?: (AIChatMenuItem | AIChatRoomItem)[];
  cardType?: "menuItem" | "room"; // indicates how to render items
}

interface AiChatAssistantProps {
  serviceId: string; // The branch service id (not branch id)
  branchId: string;  // Needed for navigation links in cards
  payload: string;
  serviceType: ServiceType;
}

export function AiChatAssistant({
  serviceId,
  branchId,
  payload,
  serviceType,
}: AiChatAssistantProps) {
  

  const activeConfig = aiServiceConfigs[serviceType];
  const [createSessionMutation] = useCreateChatSessionMutation();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: activeConfig.initialMessage, sender: "ai" },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [shouldFetchSession, setShouldFetchSession] = useState(false);
  const [connectingDots, setConnectingDots] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<AIWebSocketClient | null>(null);

  // Hook to fetch a stored session's data
  const { data: storedSession, refetch: refetchSession } =
    useGetChatSessionQuery(sessionId || "", {
      skip: !shouldFetchSession || !sessionId,
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Initialize WebSocket client
  useEffect(() => {
    try {
      const client = new AIWebSocketClient();
      wsRef.current = client;

      client.onOpen(() => setIsWsConnected(true));
      client.onClose(() => setIsWsConnected(false));
      client.onError(() => setIsWsConnected(false));

      client.onMessage((msg: WSResponse) => {
        const payload = msg.payload || {};

        if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
          const aiMsg: ChatMessage = {
            text: payload.text || payload.title || activeConfig.specialResponse.responseText,
            sender: "ai",
            items: payload.items,
            cardType: payload.cardType || activeConfig.specialResponse.cardType,
          };
          setMessages((prev) => [...prev.filter(m => m.sender !== "system"), aiMsg]);
          setIsThinking(false);
          return;
        }

        if (payload.text) {
          const aiMsg: ChatMessage = { text: payload.text, sender: "ai" };
          setMessages((prev) => [...prev.filter(m => m.sender !== "system"), aiMsg]);
          setIsThinking(false);
          return;
        }

        if (typeof msg.payload === "string") {
          const aiMsg: ChatMessage = { text: msg.payload as string, sender: "ai" };
          setMessages((prev) => [...prev.filter(m => m.sender !== "system"), aiMsg]);
          setIsThinking(false);
        }
      });

      return () => {
        client.disconnect();
        wsRef.current = null;
      };
    } catch (err) {
      console.warn("AiChatAssistant: failed to init WS client", err);
    }
  }, [serviceType]);

  // Invalidate session if the proxy token (payload) changes
  useEffect(() => {
    const storedData = getStoredSessionData(serviceType);
    if (storedData && storedData.proxyToken !== payload) {
      console.log("[AiChatAssistant] Proxy token changed. Clearing old session.");
      clearStoredSession(serviceType);
      // Reset component state to reflect the cleared session
      setSessionId(null);
      setMessages([{ text: activeConfig.initialMessage, sender: "ai" }]);
    }
  }, [payload, serviceType, activeConfig.initialMessage]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = isChatOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isChatOpen]);

  // Load past messages
  useEffect(() => {
    if (storedSession?.messages?.length) {
      const convertedMessages: ChatMessage[] = storedSession.messages.map(
        (msg) => ({ text: msg.content, sender: msg.role === "assistant" ? "ai" : "user" })
      );
      setMessages([{ text: activeConfig.initialMessage, sender: "ai" }, ...convertedMessages]);
      setTimeout(scrollToBottom, 100);
    }
  }, [storedSession, activeConfig.initialMessage]);

  // Animate connecting dots
  useEffect(() => {
    if (!isWsConnected && sessionId) {
      const interval = setInterval(() => {
        setConnectingDots(prev => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setConnectingDots("");
    }
  }, [isWsConnected, sessionId]);

  const connectWebSocket = (connectSessionId: string) => {
    if (!wsRef.current) return;
    try {
      const api = BASE_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const normalizedApi = api.replace(/^https?:\/\//, '');
      const wsBase = `wss://${normalizedApi}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const qp: string[] = [];
      if (token) qp.push(`token=${encodeURIComponent(token)}`);
      const qs = qp.length ? `?${qp.join("&")}` : "";
      const wsUrl = `${wsBase}/api/v1/chatbot/sessions/${connectSessionId}/${qs}`;
      console.log("[AiChatAssistant] Connecting WS to session:", wsUrl);
      wsRef.current.disconnect();
      wsRef.current.connect(wsUrl);

      // Show connecting system message
      setMessages(prev => [...prev, { text: `Connecting to Agent${connectingDots}`, sender: "system" }]);
    } catch (err) {
      console.warn("AiChatAssistant: failed to connect WS", err);
    }
  };

  const initializeSession = async () => {
    setIsLoadingSession(true);
    try {
      const storedData = getStoredSessionData(serviceType);
      if (storedData && storedData.proxyToken === payload) {
        console.log("[AiChatAssistant] Valid session found in storage. Loading:", storedData.sessionId);
        setSessionId(storedData.sessionId);
        setShouldFetchSession(true);
        connectWebSocket(storedData.sessionId);
      } else {
        if (storedData) clearStoredSession(serviceType); // Clean up mismatched session
        console.log("[AiChatAssistant] No valid session in storage. Creating a new one.");
        const newSession = await createSessionMutation({ resource_id: serviceId, medium: "branch_service" }).unwrap();
        storeSessionData(serviceType, newSession.id, payload);
        setSessionId(newSession.id);
        setMessages([{ text: activeConfig.initialMessage, sender: "ai" }]);
        connectWebSocket(newSession.id);
      }
    } catch (err) {
      console.error("AiChatAssistant: failed to initialize session", err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const toggleChat = () => {
    const nextIsOpen = !isChatOpen;
    setIsChatOpen(nextIsOpen);
    if (nextIsOpen) initializeSession();
    else { wsRef.current?.disconnect(); setIsWsConnected(false); }
  };

  const handleInputFocus = () => setIsInputActive(true);
  const handleInputBlur = () => setTimeout(() => setIsInputActive(false), 300);

  const sendMessage = () => {
    if (!currentInput.trim() || !isWsConnected || !sessionId || !wsRef.current) return;
    const userMessage: ChatMessage = { text: currentInput, sender: "user" };
    setMessages(prev => [...prev.filter(m => m.sender !== "system"), userMessage]);
    setCurrentInput("");
    setIsThinking(true);

    const clientId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const msg: WSMessage = { type: "user_message", id: clientId, payload: { text: userMessage.text, serviceId, payload, serviceType, sessionId } };
    wsRef.current.send(msg);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <div className="fixed bottom-5 right-4 z-40">
        <Button onClick={toggleChat} size="icon" className="w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg">
          <Bot className="w-7 h-7" />
        </Button>
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16">
          <Card className="w-[90vw] max-w-3xl shadow-xl border-teal-200 flex flex-col py-0 border-2 ">
            <CardHeader className="flex flex-row items-center justify-between bg-muted px-4 py-2 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-teal-600" />
                <CardTitle className="text-base">AI Assistant</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className={`p-4 text-sm text-muted-foreground flex-grow overflow-y-auto overflow-x-hidden ${isInputActive ? "h-[20vh]" : "h-[55vh]"}`}>
              {isLoadingSession ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading session...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.items ? (
                        <div className="flex flex-col gap-2 max-w-[90%]">
                          {msg.text && <div className="p-2 rounded-lg bg-muted text-foreground self-start">{msg.text}</div>}
                          <div className="flex overflow-x-auto gap-3 p-2 -mx-2">
                            {(msg.cardType === "menuItem" || activeConfig.specialResponse?.cardType === "menuItem") &&
                              msg.items.map((item) => <MenuItemCard key={item.id} item={item as AIChatMenuItem} branchId={branchId} payload={payload} className="w-[180px] flex-shrink-0" />)}
                            {(msg.cardType === "room" || activeConfig.specialResponse?.cardType === "room") &&
                              msg.items.map((item) => <RoomCard key={item.id} room={item as AIChatRoomItem} branchId={branchId} payload={payload} className="w-[180px] flex-shrink-0" />)}
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-[80%] p-2 rounded-lg ${msg.sender === "user" ? "bg-teal-600 text-white" : msg.sender === "system" ? "bg-text-teal-600 text-black italic" : "bg-muted text-foreground"}`}>
                          {msg.sender === "system" ? `Connecting to Agent${connectingDots}` : msg.text}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="p-2 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="message"
                  placeholder={
                    isLoadingSession
                      ? "Loading session..."
                      : !sessionId
                      ? "Initializing chat..."
                      : !isWsConnected
                      ? `Connecting to Agent${connectingDots}`
                      : "Type your question..."
                  }
                  className="flex-1"
                  autoComplete="on"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyPress}
                  disabled={isLoadingSession || !sessionId || !isWsConnected}
                />
                <Button type="submit" size="icon" className="bg-teal-600 hover:bg-teal-700" onClick={sendMessage} disabled={isLoadingSession || !sessionId || !isWsConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
