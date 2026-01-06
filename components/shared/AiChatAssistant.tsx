"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { RoomCard } from "./RoomCard";
import { bubbleStyles, BubbleStyle } from "./ai-chat-bubble-styles";
import {
  aiServiceConfigs,
  ServiceType,
} from "@/components/shared/ai-service-configs";
import { AIWebSocketClient, WSResponse } from "@/lib/ws/aiWebSocket";
import { BASE_API_URL } from "@/lib/api/base";
import { cn } from "@/lib/utils";
import {
  useCreateChatSessionMutation,
  useGetChatSessionQuery,
  useGetChatbotConfigQuery,
} from "@/lib/api/services-api";

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

function storeSessionData(
  serviceType: string,
  sessionId: string,
  proxyToken: string
): void {
  if (typeof window === "undefined") return;
  const data: StoredSessionData = { sessionId, proxyToken };
  localStorage.setItem(getSessionStorageKey(serviceType), JSON.stringify(data));
}

function clearStoredSession(serviceType: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getSessionStorageKey(serviceType));
}

// Helper to decode HTML entities and strip HTML tags for plain text display
function decodeAndStripHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch (e) {
    return html; // Fallback to original string on error
  }
}
// Typewriter effect component
function TypewriterText({
  text,
  isComplete,
}: {
  text: string;
  isComplete: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setDisplayText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Adjust speed here (lower = faster)
      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, isComplete]);

  useEffect(() => {
    // Reset if text changes (new chunk arrived)
    if (text.length > displayText.length) {
      setCurrentIndex(displayText.length);
    }
  }, [text]);

  return <>{displayText}</>;
}

export interface AIChatMenuItem {
  id: string;
  name: string;
  shortDescription?: string;
  price: number;
  currencyCode: string;
  imageUrl?: string;
  prepTime?: number;
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

interface ChatMessage {
  text: string;
  sender: "user" | "ai" | "system";
  items?: (AIChatMenuItem | AIChatRoomItem)[];
  cardType?: "menuItem" | "room";
  isStreaming?: boolean;
}

interface AiChatAssistantProps {
  serviceId: string;
  branchId: string;
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

  // Fetch dynamic chatbot configuration
  const { data: chatbotConfig, isLoading: isLoadingConfig } =
    useGetChatbotConfigQuery(serviceId, {
      skip: !serviceId,
    });

  // Prepare dynamic configuration with fallbacks
  const displayName = chatbotConfig?.displayName || "AI Assistant";
  const greetingMessage = chatbotConfig?.greetingMessage
    ? decodeAndStripHtml(chatbotConfig.greetingMessage)
    : activeConfig.initialMessage;
  const avatarUrl = chatbotConfig?.avatar
    ? `${BASE_API_URL || ""}${chatbotConfig.avatar}`
    : null;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: greetingMessage, sender: "ai", isStreaming: false },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [shouldFetchSession, setShouldFetchSession] = useState(false);
  const [connectingDots, setConnectingDots] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<AIWebSocketClient | null>(null);

  const { data: storedSession } = useGetChatSessionQuery(sessionId || "", {
    skip: !shouldFetchSession || !sessionId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // WebSocket initialization
  useEffect(() => {
    try {
      const client = new AIWebSocketClient();
      wsRef.current = client;

      client.onOpen(() => {
        setIsWsConnected(true);
        console.log("[WS] Connected");
      });
      client.onClose(() => {
        setIsWsConnected(false);
        console.log("[WS] Closed");
      });
      client.onError(() => {
        setIsWsConnected(false);
        console.error("[WS] Error");
      });

      client.onMessage((rawMsg: string | WSResponse) => {
        try {
          // Handle both string and already-parsed object
          const msg: WSResponse =
            typeof rawMsg === "string" ? JSON.parse(rawMsg) : rawMsg;
          console.log("[WS] Received message:", msg);

          const structuredData = msg.payload || {};

          // Handle structured data with items (cards)
          if (
            structuredData.items &&
            Array.isArray(structuredData.items) &&
            structuredData.items.length > 0
          ) {
            const cardMessage: ChatMessage = {
              text:
                structuredData.text ||
                structuredData.title ||
                activeConfig.specialResponse.responseText,
              sender: "ai",
              items: structuredData.items,
              cardType:
                structuredData.cardType ||
                activeConfig.specialResponse.cardType,
              isStreaming: false,
            };
            setMessages((prev) => [
              ...prev.filter((m) => m.sender !== "system"),
              cardMessage,
            ]);
            setIsThinking(false);
            return;
          }

          // Handle different message types
          switch (msg.type) {
            case "connection_established":
              console.log(
                "[WS] Connection established, session:",
                msg.session_id
              );
              setMessages((prev) => prev.filter((m) => m.sender !== "system"));
              break;

            case "user_message":
              console.log("[WS] User message echoed:", msg.message);
              // Already in our state, no need to add again
              break;

            case "assistant_metadata":
              console.log("[WS] Assistant metadata:", msg.display_name);
              // You can store this if needed
              break;

            case "assistant_message_chunk":
              setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (
                  lastMessage &&
                  lastMessage.sender === "ai" &&
                  lastMessage.isStreaming
                ) {
                  console.log("[WS] Appending chunk:", msg.chunk);
                  return [
                    ...prevMessages.slice(0, -1),
                    {
                      ...lastMessage,
                      text: (lastMessage.text || "") + (msg.chunk || ""),
                      isStreaming: true,
                    },
                  ];
                } else {
                  console.log("[WS] Creating new AI message chunk:", msg.chunk);
                  return [
                    ...prevMessages,
                    { sender: "ai", text: msg.chunk || "", isStreaming: true },
                  ];
                }
              });
              break;

            case "session_state":
              console.log("[WS] Session state:", msg.state);
              // Handle session state if needed
              break;

            case "response_complete":
              setIsThinking(false);
              console.log("[WS] Response complete");
              // Mark the last message as no longer streaming
              setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (
                  lastMessage &&
                  lastMessage.sender === "ai" &&
                  lastMessage.isStreaming
                ) {
                  return [
                    ...prevMessages.slice(0, -1),
                    { ...lastMessage, isStreaming: false },
                  ];
                }
                return prevMessages;
              });
              break;

            case "error":
              console.error("[WS] Error received:", msg.error);
              setIsThinking(false);
              const errorMsg = msg.error || "Something went wrong. Please try again later.";
              setErrorMessage(errorMsg);
              setShowErrorDialog(true);
              break;

            default:
              console.warn("[WS] Unhandled message type:", msg.type);
          }
        } catch (err) {
          console.error("[WS] Failed to process message:", rawMsg, err);
        }
      });

      return () => {
        client.disconnect();
        wsRef.current = null;
      };
    } catch (err) {
      console.error("[WS] Failed to init client", err);
    }
  }, [serviceType, activeConfig.specialResponse]);

  // Clear session if token changed
  useEffect(() => {
    const storedData = getStoredSessionData(serviceType);
    if (storedData && storedData.proxyToken !== payload) {
      console.log("[Session] Token changed, clearing old session");
      clearStoredSession(serviceType);
      setSessionId(null);
      setMessages([
        { text: greetingMessage, sender: "ai", isStreaming: false },
      ]);
    }
  }, [payload, serviceType, greetingMessage]);

  // Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = isChatOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isChatOpen]);

  // Load past messages
  useEffect(() => {
    if (storedSession?.messages?.length) {
      console.log("[Session] Loading past messages", storedSession.messages);
      const convertedMessages: ChatMessage[] = storedSession.messages.map(
        (msg) => ({
          text: msg.content,
          sender: msg.role === "assistant" ? "ai" : "user",
          isStreaming: false,
        })
      );
      setMessages([
        { text: greetingMessage, sender: "ai", isStreaming: false },
        ...convertedMessages,
      ]);
      setTimeout(scrollToBottom, 100);
    }
  }, [storedSession, greetingMessage]);

  // Animate connecting dots
  useEffect(() => {
    if (!isWsConnected && sessionId) {
      const interval = setInterval(
        () => setConnectingDots((prev) => (prev.length < 3 ? prev + "." : "")),
        500
      );
      return () => clearInterval(interval);
    } else {
      setConnectingDots("");
    }
  }, [isWsConnected, sessionId]);

  const connectWebSocket = (connectSessionId: string) => {
    if (!wsRef.current) return;
    const api = BASE_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const normalizedApi = api.replace(/^https?:\/\//, "");
    const wsBase = `wss://${normalizedApi}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const qp: string[] = [];
    if (token) qp.push(`token=${encodeURIComponent(token)}`);
    const qs = qp.length ? `?${qp.join("&")}` : "";
    const wsUrl = `${wsBase}/api/v1/chatbot/sessions/${connectSessionId}/${qs}`;
    console.log("[WS] Connecting to URL:", wsUrl);
    wsRef.current.disconnect();
    wsRef.current.connect(wsUrl);

    setMessages((prev) => [
      ...prev.filter((m) => m.sender !== "system"),
      { text: `Connecting to Agent${connectingDots}`, sender: "system" },
    ]);
  };

  const initializeSession = async () => {
    setIsLoadingSession(true);
    try {
      const storedData = getStoredSessionData(serviceType);
      if (storedData && storedData.proxyToken === payload) {
        setSessionId(storedData.sessionId);
        setShouldFetchSession(true);
        connectWebSocket(storedData.sessionId);
      } else {
        if (storedData) clearStoredSession(serviceType);
        const newSession = await createSessionMutation({
          resource_id: serviceId,
          medium: "branch_service",
        }).unwrap();
        storeSessionData(serviceType, newSession.id, payload);
        setSessionId(newSession.id);
        setMessages([
          { text: greetingMessage, sender: "ai", isStreaming: false },
        ]);
        connectWebSocket(newSession.id);
      }
    } catch (err) {
      console.error("[Session] Failed to initialize session", err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const toggleChat = () => {
    const nextIsOpen = !isChatOpen;
    setIsChatOpen(nextIsOpen);
    if (nextIsOpen) initializeSession();
    else {
      wsRef.current?.disconnect();
      setIsWsConnected(false);
    }
  };

  const handleInputFocus = () => setIsInputActive(true);
  const handleInputBlur = () => setTimeout(() => setIsInputActive(false), 300);

  const sendMessage = () => {
    if (!currentInput.trim() || !isWsConnected || !sessionId || !wsRef.current)
      return;
    const userMessage: ChatMessage = { text: currentInput, sender: "user" };
    console.log("[Send] User message:", userMessage.text);
    setMessages((prev) => [
      ...prev.filter((m) => m.sender !== "system"),
      userMessage,
    ]);
    setCurrentInput("");
    setIsThinking(true);

    wsRef.current.send({ message: userMessage.text });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInput(e.target.value);
    // Auto-resize the textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <>
      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="w-[90vw] max-w-xs p-4">
          <AlertDialogTitle className="text-base">Something Went Wrong</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            An error occurred while communicating with the AI assistant. Please try again later.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={() => {
              setShowErrorDialog(false);
              setErrorMessage(null);
            }}
            className="w-full"
          >
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="fixed bottom-5 right-4 z-40">
        <Button
          onClick={toggleChat}
          size="icon"
          className="w-14 h-14 bg-primary hover:bg-primary/90 rounded-full shadow-lg"
        >
          <Bot className="w-7 h-7" />
        </Button>
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16">
          <Card className="w-[90vw] max-w-3xl shadow-xl border-primary flex flex-col py-0 border-2">
            <CardHeader className="flex flex-row items-center justify-between bg-muted px-4 py-2 rounded-t-lg">
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="AI Avatar"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Bot className="h-6 w-6 text-primary" />
                )}
                <CardTitle className="text-base">{displayName}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent
              className={`p-4 text-sm text-muted-foreground flex-grow overflow-y-auto overflow-x-hidden h-[55vh]`}
            >
              {isLoadingSession ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading session...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-end gap-2 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "ai" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt="AI Avatar"
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <Bot className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        {msg.items ? (
                          <div className="flex flex-col gap-2 max-w-[90%]">
                            {msg.text && (
                              <div className="p-2 rounded-lg bg-muted text-foreground self-start">
                                {msg.text}
                              </div>
                            )}
                            <div className="flex overflow-x-auto gap-3 p-2 -mx-2">
                              {(msg.cardType === "menuItem" ||
                                activeConfig.specialResponse?.cardType ===
                                  "menuItem") &&
                                msg.items.map((item) => (
                                  <MenuItemCard
                                    key={item.id}
                                    item={item as AIChatMenuItem}
                                    branchId={branchId}
                                    payload={payload}
                                    className="w-[180px] flex-shrink-0"
                                  />
                                ))}
                              {(msg.cardType === "room" ||
                                activeConfig.specialResponse?.cardType ===
                                  "room") &&
                                msg.items.map((item) => (
                                  <RoomCard
                                    key={item.id}
                                    room={item as AIChatRoomItem}
                                    branchId={branchId}
                                    payload={payload}
                                    className="w-[180px] flex-shrink-0"
                                  />
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-full p-2 rounded-lg ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : msg.sender === "system"
                                ? "bg-muted text-muted-foreground italic"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {msg.sender === "system" ? (
                              `Connecting to Agent${connectingDots}`
                            ) : msg.sender === "ai" &&
                              msg.isStreaming === true ? (
                              <TypewriterText
                                text={msg.text}
                                isComplete={false}
                              />
                            ) : (
                              msg.text
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start items-end gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="AI Avatar"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <Bot className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="p-2 border-t">
              <div className="flex w-full items-end space-x-2">
                <Textarea
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
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden"
                  autoComplete="on"
                  rows={1}
                  value={currentInput}
                  onChange={handleTextareaChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyPress}
                  disabled={isLoadingSession || !sessionId || !isWsConnected}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                  onClick={sendMessage}
                  disabled={isLoadingSession || !sessionId || !isWsConnected}
                >
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
