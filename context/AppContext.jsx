"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

const isArray = (value) => Array.isArray(value);

const log = (message, data = {}) => {
  console.log(`[AppContextProvider] ${message}`, JSON.stringify(data, null, 2));
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchUsersChats = async () => {
    log("Attempting to fetch user chats");
    try {
      const token = await getToken();
      if (!token) {
        log("No token available");
        return;
      }

      const API_ENDPOINT = "/api/chat/get"; // Should be adjusted later
      log(`Calling API endpoint: ${API_ENDPOINT}`);

      const { data } = await axios.get(
        API_ENDPOINT,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      log("API response received", { data });

      if (data && data.success) {
        let fetchedChats = [];

        if (data.data) {
          if (isArray(data.data)) {
            log("data.data is an array", { chats: data.data });
            fetchedChats = data.data;
          } else if (typeof data.data === "object") {
            log("data.data is a single chat object", { chat: data.data });
            fetchedChats = [data.data];
          } else {
            log("Unexpected data.data format", { data: data.data });
            toast.error("Received unexpected chat data format");
            setChats([]);
            setSelectedChat(null);
            return;
          }
        } else {
          log("No data.data in response, assuming new chat created", { data });
          // If no data.data, assume chat was created and fetch again or create explicitly
          const newChat = await createNewChat();
          if (newChat) {
            fetchedChats = [newChat];
          } else {
            log("Failed to create fallback chat");
            setChats([]);
            setSelectedChat(null);
            return;
          }
        }

        const sortedChats = [...fetchedChats].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
        setChats(sortedChats);
        log("Chats set", { sortedChats });

        if (sortedChats.length > 0) {
          setSelectedChat(sortedChats[0]);
          log("Selected chat set", { selectedChat: sortedChats[0] });
        } else {
          log("No chats available after processing");
          setChats([]);
          setSelectedChat(null);
        }
      } else {
        const errorMessage =
          data?.message || "Failed to fetch chats. Unknown error.";
        log("API error", { errorMessage, data });
        toast.error(errorMessage);
      }
    } catch (error) {
      log("Error fetching chats", {
        message: error.message,
        stack: error.stack,
      });
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching chats.";
      toast.error(message);
    }
  };

  const createNewChat = async () => {
    log("Attempting to create a new chat");
    try {
      if (!user) {
        log("User not logged in");
        toast.error("Please log in to create a chat.");
        return null;
      }

      const token = await getToken();
      if (!token) {
        log("No token available");
        toast.error("Authentication error. Please log in again.");
        return null;
      }

      const { data } = await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      log("Create chat API response", { data });

      if (data && data.success) {
        if (data.data) {
          toast.success("New chat created!");
          const newChat = data.data;
          setChats((prev) => {
            const updatedChats = [newChat, ...prev].sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
            );
            log("Chats updated with new chat", { updatedChats });
            return updatedChats;
          });
          setSelectedChat(newChat);
          log("Selected chat set to new chat", { newChat });
          return newChat;
        } else {
          log("New chat created but no data.data returned", { data });
          toast.success("New chat created, but details unavailable");
          return {
            id: `temp_${Date.now()}`,
            messages: [],
            updatedAt: new Date(),
          }; // Fallback
        }
      } else {
        const errorMessage = data?.message || "Failed to create chat.";
        log("API error during creation", { errorMessage, data });
        toast.error(errorMessage);
        return null;
      }
    } catch (error) {
      log("Error creating new chat", {
        message: error.message,
        stack: error.stack,
      });
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while creating the chat.";
      toast.error(message);
      return null;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
      log("User logged out or not available, clearing chat state");
    }
  }, [user?.id]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
