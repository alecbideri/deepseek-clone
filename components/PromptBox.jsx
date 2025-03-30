import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const PromptBox = ({ setIsloading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(e);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSendPrompt = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) return toast.error("Please enter a message");
    if (!user) return toast.error("Login to send message");
    if (isLoading) return toast.error("Wait for previous response");
    if (!selectedChat || !selectedChat._id)
      return toast.error("No chat selected");

    const promptCopy = prompt.trim();
    setIsloading(true);
    setPrompt("");

    try {
      const userPrompt = {
        role: "user",
        content: promptCopy,
        timestamp: Date.now(),
      };

      // Optimistic update: Add user message
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), userPrompt],
      }));
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...(chat.messages || []), userPrompt] }
            : chat,
        ),
      );

      // API request
      const response = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt: promptCopy,
      });

      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.message || "API request failed");
      }

      const responseMessage =
        data.data && typeof data.data === "object" && data.data.content
          ? data.data.content
          : "Unexpected response format";

      const assistantMessage = {
        role: "assistant",
        content: responseMessage,
        timestamp: Date.now(),
      };

      // Add assistant message placeholder
      setSelectedChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          { ...assistantMessage, content: "" },
        ],
      }));

      // Animate response
      const messageTokens = responseMessage.split("");
      const messageLength = messageTokens.length;
      // Dynamic chunk size: smaller for short messages, larger for long ones
      const chunkSize = Math.max(1, Math.floor(messageLength / 50)); // Aim for ~20 updates max
      const delay = messageLength > 100 ? 5 : 10; // Faster delay for long messages

      let animatedContent = "";
      for (let i = 0; i < messageTokens.length; i += chunkSize) {
        await new Promise((resolve) => {
          setTimeout(() => {
            animatedContent = messageTokens.slice(0, i + chunkSize).join("");
            setSelectedChat((prev) => {
              const updatedMessages = [...(prev.messages || [])];
              const lastMsgIndex = updatedMessages.length - 1;
              if (updatedMessages[lastMsgIndex]?.role === "assistant") {
                updatedMessages[lastMsgIndex] = {
                  ...updatedMessages[lastMsgIndex],
                  content: animatedContent,
                };
              }
              return { ...prev, messages: updatedMessages };
            });
            resolve();
          }, delay); // Fixed delay, not cumulative
        });
      }

      // Final sync to chats array
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                messages: [
                  ...(chat.messages || []).slice(0, -1), // Remove placeholder
                  assistantMessage,
                ],
              }
            : chat,
        ),
      );
    } catch (error) {
      toast.error(error.message || "An error occurred");
      setPrompt(promptCopy);
      setSelectedChat((prev) => ({
        ...prev,
        messages:
          prev.messages?.filter(
            (msg) => msg.timestamp !== userPrompt.timestamp,
          ) || [],
      }));
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                messages:
                  chat.messages?.filter(
                    (msg) => msg.timestamp !== userPrompt.timestamp,
                  ) || [],
              }
            : chat,
        ),
      );
    } finally {
      setIsloading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${false ? "max-w-3xl" : "max-w-2xl"} bg-light-darker p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        onChange={handlePromptChange}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        value={prompt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image
              className="h-5"
              src={assets.deepthink_icon}
              alt="DeepThink"
            />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="Search" />
            Search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image
            className="w-4 cursor-pointer"
            src={assets.pin_icon}
            alt="Pin"
          />
          <button
            type="submit"
            className={`${prompt.trim() ? "bg-primary" : "bg-lighter-dark"} rounded-full p-2 cursor-pointer transition-colors duration-200`}
            disabled={!prompt.trim() || isLoading}
          >
            <Image
              className="w-5 aspect-square"
              src={prompt.trim() ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
