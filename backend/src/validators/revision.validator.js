import mongoose from "mongoose";
import { body, param } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

export const createRevisionValidator = [
    body("resource").trim().notEmpty().withMessage("resource is required").custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid resource id"),
    body("scheduledAt").optional().isISO8601().toDate(),
];

export const markReviewedValidator = [
    mongoIdParamValidator("id")[0],
    body("quality").optional().isInt({ min: 0, max: 5 }).toInt(),
];

export const revisionIdValidator = mongoIdParamValidator("id");
