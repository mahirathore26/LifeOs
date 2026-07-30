import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { COOKIE_NAMES } from "../constants/index.js";
import { verifyToken } from "../utils/jwt.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = verifyToken(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -passwordResetToken -passwordResetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry"
    );

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
});

export default verifyJWT;
