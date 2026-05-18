import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config();
const apiSecret = process.env.STREAM_API_SECRET;
const apiKey = process.env.STREAM_API_KEY;


if (!apiSecret || !apiKey) {
  console.error(
    "STEAM_API_SECRET_KEY and STEAM_API_KEY must be defined in environment variables",
  );
}

const streamCLient = StreamChat.getInstance(apiKey, apiSecret);
console.log(streamCLient);

export const upertStreamUser = async (userData) => {
  try {
    await streamCLient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("error in upserting stream user:", error);
  }
};

export const generateStreamToken = (userId) => {};
