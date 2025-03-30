import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// Change function name from POST to DELETE
export async function DELETE(req) {
  console.log("DELETE API: Request received"); // Add log
  try {
    // For DELETE requests handled by Next.js API routes, data sent in the body
    // might need to be parsed explicitly if not automatically done.
    // req.json() should work if the Content-Type header is correct.
    const { chatId } = await req.json();
    const { userId } = getAuth(req); // Get userId after parsing body potentially

    console.log("DELETE API: Authenticated User ID:", userId);
    console.log("DELETE API: Received Data:", { chatId });

    if (!userId) {
      console.log("DELETE API: User not authenticated!");
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!chatId) {
      console.log("DELETE API: Missing chatId");
      return NextResponse.json(
        { success: false, message: "Missing chatId" },
        { status: 400 },
      );
    }

    await connectDB();
    console.log("DELETE API: Database connected");

    // Use findOneAndDelete and check the result
    const deleteResult = await Chat.findOneAndDelete({
      _id: chatId,
      userId: userId, // Ensure the chat belongs to the authenticated user
    });

    console.log("DELETE API: Delete Result:", deleteResult);

    if (!deleteResult) {
      // This means either the chat ID didn't exist OR it didn't belong to this user
      console.log("DELETE API: Chat not found or user mismatch");
      return NextResponse.json(
        { success: false, message: "Chat not found or permission denied" },
        { status: 404 },
      );
    }

    console.log("DELETE API: Delete successful");
    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("DELETE API: Error:", error);
    // Check if the error is due to JSON parsing if needed
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
