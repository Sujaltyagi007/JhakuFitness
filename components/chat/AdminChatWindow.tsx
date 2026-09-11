"use client";
import { cn } from "@/lib/utils";
import { getPusherClient } from "@/lib/pusher";
import React, { useState, useEffect, useRef } from "react";
import { getChatHistory, sendChatMessage, type ChatMessage } from "@/lib/api";

interface AdminChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export default function AdminChatWindow({ conversationId, currentUserId }: AdminChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [convType, setConvType] = useState<"SUPPORT" | "INTERNAL">("SUPPORT");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getChatHistory({ conversationId });
        setMessages(data.messages || []);
        if (data.type) setConvType(data.type);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    }
    fetchHistory();

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `chat-${conversationId}`;
    const channel = pusher.subscribe(channelName);
    channel.bind("new-message", (data: ChatMessage) => {
      if (data.senderId === currentUserId) return;
      setMessages((prev) => [...prev, data]);
    });
    return () => { channel.unbind_all(); pusher.unsubscribe(channelName) };
  }, [conversationId, currentUserId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return
    const tempMessage: ChatMessage = {
      id: "temp_" + Date.now(),
      content: inputValue,
      senderId: currentUserId,
      senderType: "ADMIN",
      conversationId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputValue("");

    try {
      await sendChatMessage({ content: tempMessage.content, conversationId });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-stone-50/50">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => {
          const isSelf = convType === "INTERNAL" ? msg.senderId === currentUserId : msg.senderType === "ADMIN";
          return (
            <div key={msg.id} className={cn("max-w-[85%] rounded-2xl p-3 text-[13px] shadow-sm font-medium", isSelf ? "ml-auto rounded-tr-sm bg-stone-900 text-white" : "mr-auto rounded-tl-sm bg-white text-stone-800 border border-stone-200")} >
              {msg.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="bg-white p-3 border-t border-stone-200 shrink-0">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400" />
        </div>
      </form>
    </div>
  );
}
