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
    image:""
  })
} catch (error) {
  console.error("Error upserting user to Stream:", error);
}

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new apiError(500, "Failed to create user");
  }

  return res
    .status(201)
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
    "-password -refreshToken"
  );

  console.log(loggedInUser.refreshToken);
  
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200, "Login successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
    );
});

const logout = asyncHandler(async (req, res) => {
  console.log(req.user,"erersf");
  
  await User.findByIdAndUpdate(req.user._id,
    {$unset: { refreshToken: 1 },},
    { new: true,},
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logout successfully"));
});

export { signup, login, logout };
