import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import apiError from "../utils/api.error.js";
import { generateStreamToken } from "../lib/stream.js";

const getStreamToken = asyncHandler(async (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);
    res
      .status(200)
      .json(
        new ApiResponse(200, { token }, "Stream token generated successfully"),
      );
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

export { getStreamToken };
