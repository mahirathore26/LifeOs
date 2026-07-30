import mongoose from "mongoose";
import { query } from "express-validator";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/index.js";

const searchableTypes = ["note", "task", "project", "document"];

export const globalSearchValidator = [
    query("q")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("q must be at most 200 characters long"),
    query("types")
        .optional()
        .customSanitizer((value) =>
            String(value)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
        )
        .custom((value) =>
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => searchableTypes.includes(item))
        )
        .withMessage("types must contain note, task, project or document"),
    query("project")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("project must be a valid project id"),
    query("tag")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("tag must be a valid tag id"),
    query("status")
        .optional()
        .isIn(Object.values(TASK_STATUS))
        .withMessage("Invalid task status"),
    query("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage("Invalid task priority"),
    query("isArchived")
        .optional()
        .isBoolean()
        .withMessage("isArchived must be a boolean")
        .toBoolean(),
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
