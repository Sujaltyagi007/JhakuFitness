"use client";
import { cn } from "@/lib/utils";
import { getPusherClient } from "@/lib/pusher";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minus } from "lucide-react";
import { getChatHistory, sendChatMessage } from "@/lib/api";


function getVisitorId() {
  if (typeof window === "undefined") return "temp-visitor";
  let id = localStorage.getItem("jf-visitor-id");
  if (!id) {
    id = "vis_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("jf-visitor-id", id);
  }
  return id;
}

export default function StorefrontChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; content: string; senderType: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const visitorId = getVisitorId();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getChatHistory({ visitorId });
        if (data.messages && data.messages.length > 0) { setMessages(data.messages); }
      } catch (err) { console.error("Failed to fetch chat history", err); }
    }
    fetchHistory();
  }, [visitorId]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channelName = `chat-visitor-${visitorId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (data: any) => {
      if (data.senderId === visitorId) return;
      setMessages((prev) => [...prev, data]);
      if (!isOpen && data.senderType === "ADMIN") { setIsOpen(true); }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [visitorId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const tempMessage = {
      id: "temp_" + Date.now(),
      content: inputValue,
      senderType: "VISITOR",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputValue("");

    try {
      await sendChatMessage({
        content: tempMessage.content,
        senderId: visitorId,
        senderType: "VISITOR",
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className={cn("fixed z-50", isOpen ? "inset-0 sm:bottom-6 sm:right-6 sm:inset-auto" : "bottom-6 right-6")}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button key="chat-bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-lg shadow-black/20" >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-125 sm:max-h-[calc(100vh-2rem)] sm:w-87.5 sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl sm:border sm:border-stone-200 sm:shadow-2xl"
          >
            <div className="flex items-center justify-between bg-stone-900 p-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold">
                  JF
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Jakhu Fitness Support</h3>
                  <p className="text-xs text-stone-300">We typically reply in minutes</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition-colors hover:bg-stone-800">
                <Minus className="hidden sm:block h-5 w-5" />
                <X className="block sm:hidden h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
              <div className="flex flex-col gap-3">
                <div className="mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-stone-800 shadow-sm border border-stone-100">
                  Hello! How can we help you with your fitness equipment needs today?
                </div>
                {messages.map((msg) => {
                  const isVisitor = msg.senderType === "VISITOR";
                  return (
                    <div key={msg.id} className={cn("max-w-[80%] rounded-2xl p-3 text-sm shadow-sm", isVisitor ? "ml-auto rounded-tr-sm bg-gold text-stone-900" : "mr-auto rounded-tl-sm bg-white text-stone-800 border border-stone-100")} >
                      {msg.content}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSend} className="border-t border-stone-200 bg-white p-3 shrink-0 mb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold">
                <input type="text" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400" />
                <button type="submit" disabled={!inputValue.trim()} className="flex shrink-0 items-center justify-center text-gold disabled:opacity-50"><Send className="h-5 w-5" /></button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
