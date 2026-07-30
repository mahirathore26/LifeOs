import mongoose from "mongoose";
import { body } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

const colorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createTagValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Tag name is required")
        .isLength({ max: 50 })
        .withMessage("Tag name must be at most 50 characters long"),
    body("color")
        .optional()
        .trim()
        .matches(colorPattern)
        .withMessage("color must be a valid hex color"),
];

export const renameTagValidator = [
    ...mongoIdParamValidator("id"),
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Tag name is required")
        .isLength({ max: 50 })
        .withMessage("Tag name must be at most 50 characters long"),
    body("color")
        .optional()
        .trim()
        .matches(colorPattern)
        .withMessage("color must be a valid hex color"),
];

export const tagIdValidator = [...mongoIdParamValidator("id")];

export const assignTagValidator = [
    ...mongoIdParamValidator("id"),
    body("resourceType")
        .trim()
        .isIn(["note", "task"])
        .withMessage("resourceType must be either note or task"),
    body("resourceId")
        .trim()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("resourceId must be a valid resource id"),
];
