"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { mockMenuItemsData } from "@/components/restaurant/menu-items";
import { MenuItemCard } from "./MenuItemCard";

// Define the type for a menu item as it will be displayed in the chat
interface AIChatMenuItem {
  id: string;
  name: string;
  shortDescription?: string;
  price: number;
  currencyCode: string; // e.g., "USD"
  imageUrl?: string;
  prepTime?: number; // in minutes
}

// Define the type for a chat message, now supporting menu items
interface ChatMessage {
  text?: string; // Make text optional
  sender: "user" | "ai";
  menuItems?: AIChatMenuItem[]; // New optional field for displaying menu items
}

interface AiChatAssistantProps {
  branchId: string;
  payload: string;
}
export function AiChatAssistant({ branchId, payload }: AiChatAssistantProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [messages, setMessages] = useState<
    ChatMessage[]
  >([{
      text: "Hello! 👋 I'm your smart menu assistant. Ask me anything about our dishes, ingredients, prices, or allergens..",
      sender: "ai",
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Mock data for AI replies
  const mockReplies = [
    "Our 'Spicy Burger' is a customer favorite! It includes a special chili sauce and jalapenos.",
    "Yes, all our beef dishes are made with 100% locally sourced Angus beef.",
    "The 'Ocean's Delight' pizza contains shrimp, calamari, and mussels. It does contain shellfish allergens.",
    "A side of fries costs $3.50. You can upgrade to sweet potato fries for an extra $1.00.",
    "We do offer gluten-free bread for any of our sandwiches upon request. Please allow an extra 5 minutes for preparation.",
    "Our business hours are from 11:00 AM to 10:00 PM, Tuesday to Sunday. We are closed on Mondays.",
    "I can certainly help with that. To place a delivery order, please use the 'Checkout' button in your cart."
  ];

  // Mock menu items for demonstration
  // Map the detailed mock data to the simpler format needed for the chat cards.
  const mockMenuItems: AIChatMenuItem[] = mockMenuItemsData.map(item => ({
    id: item.id,
    name: item.menuItem.name,
    shortDescription: item.menuItem.shortDescription,
    price: item.menuItem.price,
    currencyCode: item.currency?.[0]?.code || "USD",
    imageUrl: item.menuItem.images?.[0],
    prepTime: item.menuItem.prepTime,
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Prevent background scrolling when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatOpen]);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const handleInputFocus = () => {
    setIsInputActive(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputActive(false);
    }, 300);
  };

  const sendMessage = () => {
    if (currentInput.trim()) {
      const userMessage: ChatMessage = { text: currentInput, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentInput("");
      setIsThinking(true);

      const lowerCaseInput = currentInput.toLowerCase();
      const isMenuRequest = lowerCaseInput.includes("menu") || lowerCaseInput.includes("dishes") || lowerCaseInput.includes("items") || lowerCaseInput.includes("food");

      setTimeout(() => {
        let aiMessage: ChatMessage;
        if (isMenuRequest) {
          aiMessage = { text: "Here are some of our popular menu items:", sender: 'ai', menuItems: mockMenuItems };
        } else {
          const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
          aiMessage = { text: randomReply, sender: 'ai' };
        }
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setIsThinking(false);
      }, 1500); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* The Floating Chat Button */}
      <div className="fixed bottom-5 right-4 z-40">
        <Button
          onClick={toggleChat}
          size="icon"
          className="w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg"
        >
          <Bot className="w-7 h-7" />
        </Button>
      </div>

      {/* The Chat Window */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16">
          <Card className="w-[90vw] max-w-3xl shadow-xl border-teal-200 flex flex-col py-0 border-2 ">
            <CardHeader className="flex flex-row items-center justify-between bg-muted px-4 py-2 rounded-t-lg"> 
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-teal-600" />
                <CardTitle className="text-base">AI Assistant</CardTitle>
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
              className={`p-4 text-sm text-muted-foreground flex-grow overflow-y-auto overflow-x-hidden ${
                isInputActive ? "h-[20vh]" : "h-[55vh]"
              }`}
            >
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.menuItems ? (
                      // Render menu items if present
                      <div className="flex flex-col gap-2 max-w-[90%]">
                        {msg.text && (
                          <div className="p-2 rounded-lg bg-muted text-foreground">
                            {msg.text}
                          </div>
                        )}
                        <div className="flex overflow-x-auto gap-3 p-2 -mx-2"> {/* Added padding and negative margin to make scrollbar visible */}
                          {msg.menuItems.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              branchId={branchId}
                              payload={payload}
                              className="w-[180px] flex-shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Render text message as before
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-teal-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="p-2 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="message"
                  placeholder="Type your question..."
                  className="flex-1"
                  autoComplete="on"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyPress}
                />
                {/* send button */}
                <Button
                  type="submit"
                  size="icon"
                  className="bg-teal-600 hover:bg-teal-700" onClick={sendMessage}
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
