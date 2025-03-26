import { Webhook } from "svix";
import connectDB from "@/config/db";
import user from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayLoad = await headers();
  const svixHeaders = {
    "svix-id": headerPayLoad.get("svix-id"),
    "svix-timestamp": headerPayLoad.get("svix-timestamp"),
    "svix-signature": headerPayLoad.get("svix-signature"),
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);

  // Connect to the database and handle errors
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return new Response(
      JSON.stringify({ error: "Database connection failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Rest of your code...
  switch (type) {
    case "user.created":
    case "user.updated":
      const userData = {
        _id: data.id,
        email:
          data.email_addresses && data.email_addresses.length > 0
            ? data.email_addresses[0].email_address
            : null,
        name: `${data.first_name} ${data.last_name}`,
        image_url: data.image_url,
      };
      if (type === "user.created") {
        const newUser = await user.create(userData);
        console.log("User created:", newUser);
      } else {
        await user.findByIdAndUpdate(data.id, userData);
      }
      break;
    case "user.deleted":
      await user.findByIdAndDelete(data.id);
      break;
    default:
      console.log("Unhandled event type:", type);
  }

  return new Response(JSON.stringify({ message: "Event received" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
