"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getPusherClient } from "@/lib/pusher";
import { toast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { motion, AnimatePresence } from "motion/react";
import AdminChatWindow from "@/components/chat/AdminChatWindow";
import { ChevronUp, ChevronLeft, MessageCircle, X } from "lucide-react";
import { getChatHistory, type ChatConversationSummary } from "@/lib/api";

export default function AdminChatBar() {
  const { isAuthenticated, user } = useAdminAuth();
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState("User Chat");
  const [isBarOpen, setIsBarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    async function fetchRecent() {
      try {
        const data = await getChatHistory();
        if (data.conversations) { setConversations(data.conversations); }
      } catch (err) { console.error("Failed to fetch admin chats", err); }
    }
    fetchRecent();
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe("admin-chat-inbox");
    channel.bind("new-message", () => { fetchRecent(); });
    const handleOpenChat = async (e: Event) => {
      const customEvent = e as CustomEvent<{ targetUserId: string; name: string }>;
      const { targetUserId, name } = customEvent.detail;
      try {
        const data = await getChatHistory({ targetUserId, create: true });
        if (data.conversationId) {
          setActiveChatId(data.conversationId);
          setActiveChatTitle(data.otherParticipant?.name || name || "User Chat");
          setIsBarOpen(true);
          fetchRecent();
        } else { toast.error("Could not fetch or create conversation."); }
      } catch (err) {
        console.error("Failed to open chat", err);
        toast.error(`Failed to open chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    window.addEventListener("open-admin-chat", handleOpenChat);
    return () => {
      channel.unbind_all(); pusher.unsubscribe("admin-chat-inbox");
      window.removeEventListener("open-admin-chat", handleOpenChat);
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) return null;

  const openConversation = (conv: ChatConversationSummary) => {
    setActiveChatId(conv.id);
    setActiveChatTitle(conv.type === "INTERNAL" ? (conv.otherParticipant?.name || "User Chat") : `Visitor ${(conv.visitorId ?? "").slice(-4)}`);
  };

  return (
    <div className={cn("fixed z-50 font-sans", isBarOpen ? "inset-0 md:inset-auto md:bottom-0 md:right-10" : "bottom-6 right-6 md:bottom-0 md:right-10")}>
      <div className="md:hidden">
        <AnimatePresence>
          {!isBarOpen && (
            <motion.button key="admin-chat-bubble" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsBarOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg shadow-black/20 relative" >
              <MessageCircle className="h-6 w-6" />
              {conversations.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-black border-2 border-white">
                  {conversations.length}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className={cn("flex flex-col overflow-hidden bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all", isBarOpen ? "h-full w-full md:h-auto md:w-80 md:rounded-t-2xl md:border md:border-stone-200" : "hidden md:flex md:w-80 md:rounded-t-2xl md:border md:border-stone-200")}>
        <button onClick={() => setIsBarOpen(!isBarOpen)} className="flex items-center justify-between bg-white p-4 transition-colors hover:bg-stone-50 w-full text-left border-b border-stone-100 shrink-0" >
          <div className="flex items-center gap-2.5 font-bold text-stone-900">
            {activeChatId ? (
              <div onClick={(e) => { e.stopPropagation(); setActiveChatId(null); }} className="p-1 -ml-1.5 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer text-stone-500 hover:text-stone-900" title="Back to Inbox" >
                <ChevronLeft className="w-5 h-5" />
              </div>
            ) : (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-xs text-black shadow-sm">{conversations.length}</span>
            )}
            <span className="text-[15px]">{activeChatId ? activeChatTitle : "Messaging"}</span>
          </div>
          <div className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
            <ChevronUp className={cn("hidden md:block h-5 w-5 transition-transform duration-300", isBarOpen && "rotate-180")} />
            <X className="block md:hidden h-5 w-5" />
          </div>
        </button>

        <AnimatePresence>
          {isBarOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} exit={{ height: 0 }} className="flex flex-col bg-white overflow-hidden relative flex-1 md:h-105">
              {activeChatId ? (<AdminChatWindow conversationId={activeChatId} currentUserId={user.id} />) : (
                <div className="flex-1 overflow-y-auto p-2">
                  {conversations.map((conv) => {
                    const isInternal = conv.type === "INTERNAL";
                    const title = isInternal ? (conv.otherParticipant?.name || "Unknown User") : `Visitor ${(conv.visitorId ?? "").slice(-4)}`;
                    const initials = isInternal ? (conv.otherParticipant?.name || "??").slice(0, 2) : (conv.visitorId ?? "??").slice(0, 2);
                    return (
                      <button key={conv.id} onClick={() => openConversation(conv)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-stone-50 group">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 font-bold uppercase tracking-wider text-xs border border-stone-200 group-hover:border-gold/30 transition-colors">
                          {initials}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-bold text-stone-900">{title}</div>
                          <div className="truncate text-xs text-stone-500 mt-0.5 font-medium">{conv.messages?.[0]?.content || "New conversation"}</div>
                        </div>
                      </button>
                    );
                  })}
                  {conversations.length === 0 && (<div className="p-8 text-center text-xs font-medium text-stone-400">No recent messages</div>)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
