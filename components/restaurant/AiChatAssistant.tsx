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

export function AiChatAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "ai" }[]
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

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
      const userMessage = { text: currentInput, sender: 'user' as const };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentInput("");
      setIsThinking(true);
      setTimeout(() => {
        const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
        const aiMessage = { text: randomReply, sender: 'ai' as const };
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
          <Card className="w-[90vw] max-w-3xl shadow-xl border-teal-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between bg-muted p-3">
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
                  <div
                    key={index} 
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-teal-600 text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                  {isThinking && (
      <div className="flex justify-start">
        <div className="max-w-[80%] p-2 rounded-lg bg-muted text-foreground">
          Thinking
          <span className="dot-animation">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    )}
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
