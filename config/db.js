import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

// Cache the mongoose instance globally
if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function connectDB() {
  // If already connected, return the cached connection
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  // If no connection and no promise, create a new connection
  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        // Optional: Add connection options if needed
        bufferCommands: false, // Disable buffering if connection fails
      })
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error; // Re-throw to be caught by the caller
      });
  }

  // Wait for the connection to resolve
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise on failure to allow retry
    throw error; // Propagate the error
  }

  return cached.conn;
}
