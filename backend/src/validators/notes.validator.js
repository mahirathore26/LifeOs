import mongoose from "mongoose";
import { body, query } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

const parseBooleanQuery = (field) =>
    query(field)
        .optional()
        .isBoolean()
        .withMessage(`${field} must be a boolean`)
        .toBoolean();

const parseIntegerQuery = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer`)
        .toInt();

const tagsValidator = body("tags")
    .optional()
    .isArray({ max: 25 })
    .withMessage("Tags must be an array with at most 25 items");

const tagsItemValidator = body("tags.*")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Each tag must be a valid tag id");

const projectValidator = body("project")
    .optional({ nullable: true })
    .custom((value) => value === null || mongoose.Types.ObjectId.isValid(value))
    .withMessage("project must be a valid project id");

export const createNoteValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title must be at most 200 characters long"),
    body("content")
        .optional()
        .trim()
        .isLength({ max: 20000 })
        .withMessage("Content must be at most 20000 characters long"),
    tagsValidator,
    tagsItemValidator,
    projectValidator,
    body("isPinned")
        .optional()
        .isBoolean()
        .withMessage("isPinned must be a boolean")
        .toBoolean(),
    body("isArchived")
        .optional()
        .isBoolean()
        .withMessage("isArchived must be a boolean")
        .toBoolean(),
];

export const updateNoteValidator = [
    ...mongoIdParamValidator("id"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Title must be at most 200 characters long"),
    body("content")
        .optional()
        .trim()
        .isLength({ max: 20000 })
        .withMessage("Content must be at most 20000 characters long"),
    tagsValidator,
    tagsItemValidator,
    projectValidator,
    body("isPinned")
        .optional()
        .isBoolean()
        .withMessage("isPinned must be a boolean")
        .toBoolean(),
    body("isArchived")
        .optional()
        .isBoolean()
        .withMessage("isArchived must be a boolean")
        .toBoolean(),
];

export const noteIdValidator = [...mongoIdParamValidator("id")];

export const listNotesValidator = [
    query("search")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("search must be at most 200 characters long"),
    query("project")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("project must be a valid project id"),
    query("tag")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("tag must be a valid tag id"),
    parseBooleanQuery("isPinned"),
    parseBooleanQuery("isArchived"),
    parseBooleanQuery("isDeleted"),
    parseIntegerQuery("page"),
    parseIntegerQuery("limit"),
];
