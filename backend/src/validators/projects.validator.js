import { body, query } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

const colorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createProjectValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Project name is required")
        .isLength({ max: 120 })
        .withMessage("Project name must be at most 120 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    body("color")
        .optional()
        .trim()
        .matches(colorPattern)
        .withMessage("color must be a valid hex color"),
    body("icon")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("icon cannot be empty")
        .isLength({ max: 50 })
        .withMessage("icon must be at most 50 characters long"),
];

export const updateProjectValidator = [
    ...mongoIdParamValidator("id"),
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Project name cannot be empty")
        .isLength({ max: 120 })
        .withMessage("Project name must be at most 120 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    body("color")
        .optional()
        .trim()
        .matches(colorPattern)
        .withMessage("color must be a valid hex color"),
    body("icon")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("icon cannot be empty")
        .isLength({ max: 50 })
        .withMessage("icon must be at most 50 characters long"),
];

export const projectIdValidator = [...mongoIdParamValidator("id")];

export const listProjectsValidator = [
    query("search")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("search must be at most 200 characters long"),
    query("isArchived")
        .optional()
        .isBoolean()
        .withMessage("isArchived must be a boolean")
        .toBoolean(),
];
