import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// Utility function for logging
const log = (message, data = {}) => {
  console.log(`[API /chat/create] ${message}`, JSON.stringify(data, null, 2));
};

export async function POST(req) {
  try {
    log("Request received");

    const { userId } = getAuth(req);
    if (!userId) {
      log("Authentication failed: No user ID");
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }
    log("User authenticated", { userId });

    // Prepare chat data
    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };
    log("Chat data prepared", { chatData });

    // Connect to database and create chat
    await connectDB();
    log("Database connected");

    const newChat = await Chat.create(chatData);
    log("New chat created", { newChat });

    // Return the created chat in data
    return NextResponse.json({
      success: true,
      message: "Successfully created chat",
      data: newChat, // Include the full chat object
    });
  } catch (error) {
    log("Error", { message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
