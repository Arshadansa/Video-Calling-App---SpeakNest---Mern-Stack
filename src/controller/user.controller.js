import User from "../model/User.model.js";
import apiError from "../utils/api.error.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import FriendRequest from "../model/FriendRequest.js";

const getRecommendatedUsers = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user'frineds
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

const sendFriendRequest = asyncHandler(async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res
        .status(400)
        .json(new apiError(400, "You cannot send friend request to yourself"));
    }

    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res
        .status(404)
        .json(new apiError(404, "Recipient user not found"));
    }

    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json(new apiError(400, "You are already friends with this user"));
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      res
        .status(400)
        .json(
          new apiError(
            400,
            "A friend request already exists between you and this user",
          ),
        );
    }

    const friendRequest = new FriendRequest({
      sender: myId,
      recipient: recipientId,
    });
    await friendRequest.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { friendRequest },
          "Friend request sent successfully",
        ),
      );
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  try {
    const { id: recipientId } = req.params;

    const friendRequest = await FriendRequest.findById(recipientId);

    if (!friendRequest) {
      return res
        .status(404)
        .json(new apiError(404, "Friend request not found"));
    }
    //verify the cureent user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json(
          new apiError(
            403,
            "You are not authorized to accept this friend request",
          ),
        );
    }

    //update the friend request status to accepted
    friendRequest.status = "accepted";
    await friendRequest.save();

    //add each other to the other's friends list
    // $addToSet operator adds a value to an array only if it doesn't already exist in the array, preventing duplicates.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Friend request accepted successfully"));
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

const getFriendRequests = asyncHandler(async (req, res) => {
  try {
    const incommingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    const acceptedRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { incommingRequests, acceptedRequests },
          "Friend requests fetched successfully",
        ),
      );
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

const outgoingFriendRequests = asyncHandler(async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { outgoingRequests },
          "Outgoing friend requests fetched successfully",
        ),
      );
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

export {
  getRecommendatedUsers,
  getMyFriends,
  sendFriendRequest,
  outgoingFriendRequests,
  getFriendRequests,
  acceptFriendRequest,
};
