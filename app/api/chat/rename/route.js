import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  console.log("RENAME API: Request received"); // API hit log
  try {
    const { userId } = getAuth(req);
    console.log("RENAME API: Authenticated User ID:", userId); // Log userId
    if (!userId) {
      console.log("RENAME API: User not authenticated!");
      // Return a proper status code for unauthorized
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }

    const { chatId, name } = await req.json();
    console.log("RENAME API: Received Data:", { chatId, name }); // Log received data

    if (!chatId || !name) {
      console.log("RENAME API: Missing chatId or name");
      return NextResponse.json(
        { success: false, message: "Missing chatId or name" },
        { status: 400 },
      );
    }

    await connectDB();
    console.log("RENAME API: Database connected"); // Log DB connection

    // Find and update, also ensure the chat belongs to the user
    const updateResult = await Chat.findOneAndUpdate(
      { _id: chatId, userId: userId }, // Match both ID and User ID
      { name: name },
      { new: true }, // Option to return the updated document
    );

    console.log("RENAME API: Update Result:", updateResult); // Log the result

    if (!updateResult) {
      // This means either the chat ID didn't exist OR it didn't belong to this user
      console.log("RENAME API: Chat not found or user mismatch");
      return NextResponse.json(
        { success: false, message: "Chat not found or permission denied" },
        { status: 404 },
      );
    }

    console.log("RENAME API: Rename successful");
    // Return updated chat data for potential frontend use
    return NextResponse.json({
      success: true,
      message: `Chat Renamed`,
      data: updateResult,
    });
  } catch (error) {
    console.error("RENAME API: Error:", error); // Log the full error
    // Return a generic server error message and status
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
