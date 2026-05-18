import User from "../model/User.model.js";
import apiError from "../utils/api.error.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getRecommendatedUsers = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { $id: { $nin: currentUser.friends } }, // exclude current user'frineds
        { isOnboarded: true },
      ],
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { recommendedUsers },
          "Recommended users fetched successfully",
        ),
      );
  } catch (error) {
    console.log(error.message);

    res.status(500).json(new apiError(500, error.message));
  }
});

const getMyFriends = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage",
      );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          userFriends: user.friends,
        },
        "User's friends fetched successfully",
      ),
    );
  } catch (error) {
    throw new apiError(500, error.message);
  }
});

const sendFriendRequest = asyncHandler(async (req, res) => {});

export { getRecommendatedUsers, getMyFriends ,sendFriendRequest};
