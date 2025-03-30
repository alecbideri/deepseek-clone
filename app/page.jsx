"use client";
import { useEffect, useRef, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const [expand, setExpand] = useState(true);
  const [loading, setLoading] = useState(false);
  // REMOVED: const [messages, setMessages] = useState([]); // No longer needed
  const { selectedChat } = useAppContext();
  const containerRef = useRef(null);

  // REMOVED: The useEffect hook that called setMessages

  // Get the messages directly from selectedChat, provide empty array fallback
  const currentMessages = selectedChat?.messages || [];

  // Effect to scroll down when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentMessages]); // Depend on the derived messages array

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expand={expand} setExpand={setExpand} />

        <div className="flex-1 flex flex-col items-center justify-between px-4 pb-8 bg-dark text-white relative">
          {/* Mobile Header */}
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image
              onClick={() => setExpand(!expand)}
              className="rotate-180 hover:cursor-pointer"
              src={assets.menu_icon}
              alt={"menu icon"}
              width={24}
              height={24}
            />
            <Image
              className="opacity-70"
              src={assets.chat_icon}
              alt={"chat icon"}
              width={24}
              height={24}
            />
          </div>

          {/* Message Display Area */}
          {/* Check selectedChat directly or use currentMessages length */}
          {!selectedChat || currentMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} alt="" className="h-16" />
                <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="flex-1 flex flex-col items-center w-full max-w-3xl overflow-y-auto pt-20 pb-4"
            >
              <p className="fixed top-8 bg-dark border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold z-10">
                {selectedChat?.name || "Chat"}
              </p>

              {/* Use currentMessages directly */}
              {currentMessages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}

              {loading && (
                <div className="flex gap-4 max-w-3xl w-full py-3 px-4 md:px-0">
                  <Image
                    src={assets.logo_icon.src}
                    alt="logo"
                    height={36}
                    width={36}
                    className="p-1 border border-white/15 rounded-full"
                  />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-0"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-300"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt Box Area */}
          <div className="w-full flex justify-center">
            <PromptBox isLoading={loading} setIsloading={setLoading} />
          </div>
          <p className="text-xs mt-2 text-gray-500">
            AI-generated, for reference only
          </p>
        </div>
      </div>
    </div>
  );
}
