import mongoose from "mongoose";
import { body, query } from "express-validator";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/index.js";
import { mongoIdParamValidator } from "./common.validator.js";

const booleanQueryValidator = (field) =>
    query(field)
        .optional()
        .isBoolean()
        .withMessage(`${field} must be a boolean`)
        .toBoolean();

const integerQueryValidator = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer`)
        .toInt();

const sortFieldValidator = query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "dueDate", "priority", "status", "title"])
    .withMessage("sortBy must be one of createdAt, updatedAt, dueDate, priority, status or title");

const sortOrderValidator = query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be either asc or desc");

const dueDateValidator = body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date")
    .toDate();

const projectValidator = body("project")
    .optional({ nullable: true })
    .custom((value) => value === null || mongoose.Types.ObjectId.isValid(value))
    .withMessage("project must be a valid project id");

const tagsValidator = body("tags")
    .optional()
    .isArray({ max: 25 })
    .withMessage("tags must be an array with at most 25 items");

const tagsItemValidator = body("tags.*")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Each tag must be a valid tag id");

export const createTaskValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title must be at most 200 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    body("status")
        .optional()
        .isIn(Object.values(TASK_STATUS))
        .withMessage("Invalid task status"),
    body("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage("Invalid task priority"),
    projectValidator,
    tagsValidator,
    tagsItemValidator,
    dueDateValidator,
];

export const updateTaskValidator = [
    ...mongoIdParamValidator("id"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Title must be at most 200 characters long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must be at most 5000 characters long"),
    body("status")
        .optional()
        .isIn(Object.values(TASK_STATUS))
        .withMessage("Invalid task status"),
    body("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage("Invalid task priority"),
    projectValidator,
    tagsValidator,
    tagsItemValidator,
    dueDateValidator,
];

export const taskIdValidator = [...mongoIdParamValidator("id")];

export const listTasksValidator = [
    query("search")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("search must be at most 200 characters long"),
    query("status")
        .optional()
        .isIn(Object.values(TASK_STATUS))
        .withMessage("Invalid task status"),
    query("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage("Invalid task priority"),
    query("project")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("project must be a valid project id"),
    query("tag")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("tag must be a valid tag id"),
    query("dueDateFrom")
        .optional()
        .isISO8601()
        .withMessage("dueDateFrom must be a valid ISO 8601 date")
        .toDate(),
    query("dueDateTo")
        .optional()
        .isISO8601()
        .withMessage("dueDateTo must be a valid ISO 8601 date")
        .toDate(),
    booleanQueryValidator("isDeleted"),
    integerQueryValidator("page"),
    integerQueryValidator("limit"),
    sortFieldValidator,
    sortOrderValidator,
];
