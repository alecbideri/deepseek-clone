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

  //   Get the  payload and verify it

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);

  //   prepare the user data to be saved in the database

  const userData = {
    _id: data._id,
    email: data.email_address[0].email_address,
    name: `${data.first_name} ${data.last_name}`,
    image_url: data.image_url,
  };

  await connectDB();

  switch (type) {
    case "user.created":
      await user.created(userData);
      break;
    case "user.updated":
      await user.findByIdAndUpdate(data.id, userData);
      break;
    case "user.deleted":
      await user.findByIdAndDelete(data.id);
      break;
  }

  return NextRequest.json({ message: "Event received" });
}
