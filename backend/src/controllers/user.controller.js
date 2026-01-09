import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens
= async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError("Failed to generate tokens", 500);
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, userName } = req.body;
  if (
    [fullName, email, password, userName].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError("All fields are required", 400);
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    throw new ApiError("User already exists", 409);
  }
  const user = await User.create({ fullName, email, password, userName });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new ApiResponse("User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!(email || userName)) {
    throw new ApiError("Email or username is required", 400);
  }
  if (!password) {
    throw new ApiError("Password is required", 400);
  }
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError("Invalid password", 401);
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loggedInUser) {
    throw new ApiError("User not found", 404);
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,            //For production purpose
      })
    );
});

export { registerUser, loginUser };
