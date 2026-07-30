import { body, param } from "express-validator";

export const registerValidator = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Full name must be between 2 and 50 characters"),

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be between 3 and 20 characters")
        .matches(/^[a-z0-9_]+$/i)
        .withMessage(
            "Username can contain only letters, numbers and underscores"
        ),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

export const updateProfileValidator = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Full name must be between 2 and 50 characters"),

    body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be between 3 and 20 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage(
            "Username can contain only letters, numbers and underscores"
        ),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Bio cannot exceed 300 characters"),
];

export const changePasswordValidator = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters long")
        .custom((value, { req }) => value !== req.body.oldPassword)
        .withMessage("New password must be different from old password"),
];

export const forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
];

export const resetPasswordValidator = [
    param("token")
        .trim()
        .notEmpty()
        .withMessage("Reset token is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];

export const verifyEmailValidator = [
    param("token")
        .trim()
        .notEmpty()
        .withMessage("Verification token is required"),
];

export const resendVerificationEmailValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
];
