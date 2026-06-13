import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config();
const apiSecret = process.env.STREAM_API_SECRET;
const apiKey = process.env.STREAM_API_KEY;


if (!apiSecret || !apiKey) {
  console.error(
    "STREAM_API_SECRET_KEY and STREAM_API_KEY must be defined in environment variables",
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

export const generateStreamToken = (userId) => {
  try {
   const userIdStr = userId.toString();
   return streamCLient.createToken(userIdStr);
  } catch (error) {
    console.error("error in generating stream token:", error); 
  }
};
