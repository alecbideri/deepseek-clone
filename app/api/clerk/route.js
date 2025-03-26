import { Webhook } from "svix";
import connectDB from "@/config/db";
import user from "@/models/User";
import { headers } from "next/headers";

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
  console.log("Webhook data:", data);

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
        image: data.image_url || null, // Match schema field name
      };
      if (type === "user.created") {
        try {
          const newUser = await user.create(userData);
          console.log("User created:", newUser);
        } catch (error) {
          console.error("Error creating user:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create user" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
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
