import mongoose from "mongoose";
import { param } from "express-validator";

export const mongoIdParamValidator = (field = "id") => [
    param(field)
        .trim()
        .notEmpty()
        .withMessage(`${field} is required`)
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage(`Invalid ${field}`),
];
