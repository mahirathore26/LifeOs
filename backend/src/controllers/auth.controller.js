import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { COOKIE_NAMES } from "../constants/index.js";
import {
    accessTokenCookieOptions,
    clearCookieOptions,
    refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService,
    getCurrentUserService,
    updateProfileService,
    changePasswordService,
    forgotPasswordService,
    resetPasswordService,
    verifyEmailService,
    resendVerificationEmailService,
} from "../services/auth.service.js";

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie(
        COOKIE_NAMES.ACCESS_TOKEN,
        accessToken,
        accessTokenCookieOptions
    );
    res.cookie(
        COOKIE_NAMES.REFRESH_TOKEN,
        refreshToken,
        refreshTokenCookieOptions
    );
};

const clearAuthCookies = (res) => {
    res.clearCookie(
        COOKIE_NAMES.ACCESS_TOKEN,
        clearCookieOptions
    );
    res.clearCookie(
        COOKIE_NAMES.REFRESH_TOKEN,
        clearCookieOptions
    );
};

export const registerUser = asyncHandler(async (req, res) => {
    const result = await registerUserService(req.body);

    return res.status(201).json(
        new ApiResponse(201, result, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const result = await loginUserService(req.body);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Login successful"
        )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await logoutUserService(req.user._id);
    clearAuthCookies(res);

    return res.status(200).json(
        new ApiResponse(200, null, "Logged out successfully")
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ||
        req.body?.refreshToken;

    const result = await refreshAccessTokenService(incomingRefreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Access token refreshed successfully"
        )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await getCurrentUserService(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await updateProfileService(req.user._id, req.body);

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

export const changePassword = asyncHandler(async (req, res) => {
    await changePasswordService(req.user._id, req.body);

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const result = await forgotPasswordService(req.body.email);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Password reset instructions generated successfully"
        )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    await resetPasswordService(req.params.token, req.body.password);
    clearAuthCookies(res);

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await verifyEmailService(req.params.token);

    return res.status(200).json(
        new ApiResponse(200, user, "Email verified successfully")
    );
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
    const result = await resendVerificationEmailService(req.body.email);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Verification email generated successfully"
        )
    );
});
