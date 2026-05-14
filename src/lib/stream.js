import dotenv from "dotenv";
dotenv.config();

import { StreamChat } from "stream-chat";

const apiSecret = process.env.STEAM_API_SECRET_KEY;
const apiKey = process.env.STEAM_API_KEY;


if (!apiSecret || !apiKey) {
  console.error(
    "STEAM_API_SECRET_KEY and STEAM_API_KEY must be defined in environment variables",
  );
}

const streamCLient = StreamChat.getInstance(apiKey, apiSecret);

export const upertStreamUser = async (userData) => {
  try {
    await streamCLient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("error in upserting stream user:", error);
  }
};

export const generateStreamToken = (userId) => {};
