import { upertStreamUser } from "../lib/stream.js";
import User from "../model/User.model.js";
import apiError from "../utils/api.error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/// for generateaccesstokenandrefreshtoken
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while generating access and refresh tokens",
    );
  }
};

const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new apiError(400, "All fields are required");
  }
  if (password.length < 6) {
    throw new apiError(400, "Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ $or: [{ fullName }, { email }] });

  if (existingUser) {
    throw new apiError(400, "User with this email or full name already exists");
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
  });

  try {
    await upertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: "",
    });
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
  }
 const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(newUser._id);

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new apiError(500, "Failed to create user");
  }
 const options = {
  httpOnly: true,
  secure: true,        // MUST be true in production HTTPS
  sameSite: "none",    // REQUIRED for cross-site cookies
};

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(400, "Invalid email or password");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logout successfully"));
});

const onboard = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;

    const missingFields = [];

    if (!fullName) missingFields.push("fullName");
    if (!bio) missingFields.push("bio");
    if (!nativeLanguage) missingFields.push("nativeLanguage");
    if (!learningLanguage) missingFields.push("learningLanguage");
    if (!location) missingFields.push("location");

    if (missingFields.length > 0) {
      throw new apiError(400, `Missing fields: ${missingFields.join(", ")}`);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new apiError(500, "Failed to update user");
    }
    //update user in stream

    try {
      upertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: "",
      });
    } catch (error) {
      new apiError(500, "Failed to update user in Stream");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User onboarded successfully"));
  } catch (error) {
    throw new apiError(500, error.message);
  }
});

export { signup, login, logout, onboard };
