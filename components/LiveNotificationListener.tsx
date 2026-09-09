"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher";
import { X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  sender: string;
  timestamp: string;
}

export default function LiveNotificationListener() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("global-notifications");

    channel.bind("new-notification", (data: any) => {
      const newNotification: NotificationData = { id: Math.random().toString(36).substring(7), ...data };
      setNotifications((prev) => [newNotification, ...prev]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
      }, 10000);
    });

    return () => {
      pusher.unsubscribe("global-notifications");
    };
  }, []);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Bell size={16} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.sender}</p>
                </div>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{notif.message}</p>
              </div>
              <button onClick={() => dismiss(notif.id)} className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
