import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { COOKIE_NAMES } from "../constants/index.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import crypto from "crypto";

const getUserPublicProjection =
    "-password -refreshToken -passwordResetToken -passwordResetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry";

const buildActionUrl = (path, token) => {
    const baseUrl =
        process.env.FRONTEND_URL ||
        process.env.APP_BASE_URL ||
        "http://localhost:5173";

    return `${baseUrl}${path}${token}`;
};

const buildDevelopmentTokenPayload = (token, url) => {
    if (process.env.NODE_ENV === "production") {
        return null;
    }

    return {
        token,
        url,
    };
};

const generateAccessToken = (userId) =>
    signToken(
        { _id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRY
    );

const generateRefreshToken = (userId) =>
    signToken(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRY
    );

const issueAuthTokens = async (user) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const findUserByEmailOrUsername = async ({ email, username }) =>
    User.findOne({
        $or: [{ email }, { username }],
    });

export const registerUserService = async ({
    fullName,
    username,
    email,
    password,
}) => {
    const existingUser = await findUserByEmailOrUsername({
        email,
        username,
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new ApiError(409, "Email already exists");
        }

        throw new ApiError(409, "Username already exists");
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
    });

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select(
        getUserPublicProjection
    );

    const verificationUrl = buildActionUrl(
        "/verify-email/",
        verificationToken
    );

    return {
        user: createdUser,
        verification: buildDevelopmentTokenPayload(
            verificationToken,
            verificationUrl
        ),
    };
};

export const loginUserService = async ({ email, password }) => {
    const user = await User.findOne({ email }).select(
        "+password +refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);
    const safeUser = await User.findById(user._id).select(getUserPublicProjection);

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

export const logoutUserService = async (userId) => {
    await User.findByIdAndUpdate(userId, {
    $unset: {
        refreshToken: 1,
    },
});
};

export const refreshAccessTokenService = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decodedToken = verifyToken(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
        "+refreshToken"
    );

    if (!user || !user.refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token has been rotated");
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);
    const safeUser = await User.findById(user._id).select(getUserPublicProjection);

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

export const getCurrentUserService = async (userId) => {
    const user = await User.findById(userId).select(getUserPublicProjection);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

export const updateProfileService = async (userId, payload) => {
    const updates = {};

    if (payload.fullName !== undefined) {
        updates.fullName = payload.fullName;
    }

    if (payload.username !== undefined) {
        const existingUsernameUser = await User.findOne({
            username: payload.username,
            _id: { $ne: userId },
        });

        if (existingUsernameUser) {
            throw new ApiError(409, "Username already exists");
        }

        updates.username = payload.username;
    }

    if (payload.bio !== undefined) {
        updates.bio = payload.bio;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updates,
        {
            new: true,
            runValidators: true,
        }
    ).select(getUserPublicProjection);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

export const changePasswordService = async (
    userId,
    { oldPassword, newPassword }
) => {
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();
};

export const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email }).select(
        "+passwordResetToken +passwordResetTokenExpiry"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = buildActionUrl("/reset-password/", resetToken);

    return {
        reset: buildDevelopmentTokenPayload(resetToken, resetUrl),
    };
};

export const resetPasswordService = async (rawToken, password) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { $gt: new Date() },
    }).select(
        "+password +passwordResetToken +passwordResetTokenExpiry +refreshToken"
    );

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();
};

export const verifyEmailService = async (rawToken) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: new Date() },
    }).select(
        "+emailVerificationToken +emailVerificationTokenExpiry"
    );

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return User.findById(user._id).select(getUserPublicProjection);
};

export const resendVerificationEmailService = async (email) => {
    const user = await User.findOne({ email }).select(
        "+emailVerificationToken +emailVerificationTokenExpiry"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = buildActionUrl(
        "/verify-email/",
        verificationToken
    );

    return {
        verification: buildDevelopmentTokenPayload(
            verificationToken,
            verificationUrl
        ),
    };
};
