import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import {
    changePasswordValidator,
    forgotPasswordValidator,
    loginValidator,
    registerValidator,
    resendVerificationEmailValidator,
    resetPasswordValidator,
    updateProfileValidator,
    verifyEmailValidator,
} from "../validators/auth.validator.js";
import {
    changePassword,
    forgotPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resendVerificationEmail,
    resetPassword,
    updateProfile,
    verifyEmail,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginValidator, validate, loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/profile", verifyJWT, updateProfileValidator, validate, updateProfile);
router.post(
    "/change-password",
    verifyJWT,
    changePasswordValidator,
    validate,
    changePassword
);
router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);
router.post(
    "/reset-password/:token",
    resetPasswordValidator,
    validate,
    resetPassword
);
router.get(
    "/verify-email/:token",
    verifyEmailValidator,
    validate,
    verifyEmail
);
router.post(
    "/resend-verification-email",
    resendVerificationEmailValidator,
    validate,
    resendVerificationEmail
);

export default router;
