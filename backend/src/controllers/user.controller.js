import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser=asyncHandler(async (req, res) => {
    const { fullName,email,password,userName } = req.body;
    if([fullName,email,password,userName].some(field => !field || field?.trim() === "")) {
        throw new ApiError("All fields are required", 400);
    }
    const existedUser=await User.findOne({
        $or:[
            { email },
            { userName }
        ]
    })
    if(existedUser) {
        throw new ApiError("User already exists", 409); 
    }
    const user = await User.create({ fullName, email, password, userName });
    const createdUser=await User.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse("User registered successfully", createdUser));
 });

const loginUser=asyncHandler(async (req, res) => {});