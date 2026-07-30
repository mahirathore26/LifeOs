import { body, param, query } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

export const createGoalValidator = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 300 }),
    body("description").optional().trim().isLength({ max: 5000 }),
    body("targetDate").optional().isISO8601().toDate(),
];

export const updateGoalValidator = [
    ...mongoIdParamValidator("id"),
    ...createGoalValidator,
];

export const goalIdValidator = [...mongoIdParamValidator("id")];

export const addResourceValidator = [
    ...mongoIdParamValidator("id"),
    body("resourceId").trim().notEmpty().withMessage("resourceId is required"),
];
