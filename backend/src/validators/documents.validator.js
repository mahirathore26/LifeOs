import mongoose from "mongoose";
import { body, query } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

const projectValidator = body("project")
    .optional({ nullable: true })
    .custom((value) => value === null || mongoose.Types.ObjectId.isValid(value))
    .withMessage("project must be a valid project id");

export const createDocumentValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Document title is required")
        .isLength({ max: 200 })
        .withMessage("Document title must be at most 200 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    projectValidator,
];

export const updateDocumentValidator = [
    ...mongoIdParamValidator("id"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Document title cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Document title must be at most 200 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    projectValidator,
];

export const documentIdValidator = [...mongoIdParamValidator("id")];

export const listDocumentsValidator = [
    query("search")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("search must be at most 200 characters long"),
    query("project")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("project must be a valid project id"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("page must be a positive integer")
        .toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("limit must be a positive integer")
        .toInt(),
];
