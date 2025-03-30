export const maxDuration = 60;

import OpenAI from "openai";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Chat from "@/models/Chat";
import connectDB from "@/config/db";

// Initialize OpenAI SDK with DeepSeek configuration
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY, // Renamed for clarity
});

// Utility function to log messages (can be replaced with a proper logger later)
const log = (message, data = {}) => {
  console.log(`[API /chat/ai] ${message}`, JSON.stringify(data, null, 2));
};

export async function POST(req) {
  try {
    // Log request initiation
    log("Request received");

    // Authenticate user
    const { userId } = getAuth(req);
    if (!userId) {
      log("Authentication failed: No user ID");
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }
    log("User authenticated", { userId });

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      log("Failed to parse request body", { error: parseError.message });
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { chatId, prompt } = body;
    log("Request body parsed", { chatId, prompt });

    // Validate inputs
    if (!chatId || typeof chatId !== "string") {
      log("Validation failed: Invalid or missing chatId");
      return NextResponse.json(
        { success: false, message: "Invalid or missing chatId" },
        { status: 400 },
      );
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      log("Validation failed: Invalid or missing prompt");
      return NextResponse.json(
        { success: false, message: "Invalid or missing prompt" },
        { status: 400 },
      );
    }

    // Connect to database
    log("Connecting to database");
    await connectDB();
    log("Database connected");

    // Find chat document
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      log("Chat not found", { userId, chatId });
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 },
      );
    }
    log("Chat retrieved", { chatId: chat._id });

    // Create user message
    const userPrompt = {
      role: "user",
      content: prompt.trim(),
      timestamp: Date.now(),
    };
    chat.messages.push(userPrompt);
    log("User message added to chat", { userPrompt });

    // Verify API key existence
    if (!process.env.DEEPSEEK_API_KEY) {
      log("DeepSeek API key missing");
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: API key missing",
        },
        { status: 500 },
      );
    }

    // Call DeepSeek API
    log("Calling DeepSeek API", { prompt });
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true,
    });
    log("DeepSeek API response received", { completion });

    // Extract and validate AI response
    if (
      !completion.choices ||
      !completion.choices[0] ||
      !completion.choices[0].message
    ) {
      log("Invalid DeepSeek response format", { completion });
      return NextResponse.json(
        { success: false, message: "Invalid response from AI service" },
        { status: 500 },
      );
    }

    const aiMessage = {
      role: completion.choices[0].message.role || "assistant",
      content: completion.choices[0].message.content || "",
      timestamp: Date.now(),
    };
    chat.messages.push(aiMessage);
    log("AI message added to chat", { aiMessage });

    // Save updated chat
    await chat.save();
    log("Chat saved to database");

    // Return response
    const response = {
      success: true,
      data: aiMessage,
    };
    log("Response sent", { response });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Detailed error logging
    log("Error occurred", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Specific error handling
    if (error.response) {
      // DeepSeek API error
      log("DeepSeek API error", {
        status: error.response.status,
        data: error.response.data,
      });
      return NextResponse.json(
        {
          success: false,
          message: `AI service error: ${error.response.data?.error || "Unknown error"}`,
        },
        { status: error.response.status || 500 },
      );
    }

    if (error.name === "MongoError") {
      log("Database error");
      return NextResponse.json(
        { success: false, message: "Database error" },
        { status: 500 },
      );
    }

    // Generic error
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
