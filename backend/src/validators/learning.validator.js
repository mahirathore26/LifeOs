import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import { mongoIdParamValidator } from "./common.validator.js";

const isValidUrl = (value) => {
	if (!value) return true;
	try {
		// eslint-disable-next-line no-new
		new URL(value);
		return true;
	} catch (err) {
		return false;
	}
};

const parseIntegerQuery = (field) =>
	query(field).optional().isInt({ min: 1 }).withMessage(`${field} must be a positive integer`).toInt();

export const createLearningValidator = [
	body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 300 }).withMessage("Title too long"),
	body("description").optional().trim().isLength({ max: 20000 }).withMessage("Description too long"),
	body("resourceType").optional().isIn(["Course", "Video", "Article", "Book", "Documentation", "Podcast", "Other"]).withMessage("Invalid resource type"),
	body("subject").optional({ nullable: true }).trim(),
	body("topics").optional().isArray().withMessage("Topics must be an array"),
	body("topics.*.title").optional().trim().isLength({ max: 200 }).withMessage("Topic title too long"),
	body("progress").optional().isIn(["Not Started", "In Progress", "Completed"]).withMessage("Invalid progress value"),
	body("completionPercentage").optional().isInt({ min: 0, max: 100 }).withMessage("completionPercentage must be between 0 and 100").toInt(),
	body("difficulty").optional().isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid difficulty"),
	body("priority").optional().isIn(["Low", "Medium", "High", "Critical"]).withMessage("Invalid priority"),
	body("estimatedDurationMinutes").optional().isInt({ min: 0 }).withMessage("estimatedDurationMinutes must be a non-negative integer").toInt(),
	body("timeSpentMinutes").optional().isInt({ min: 0 }).withMessage("timeSpentMinutes must be a non-negative integer").toInt(),
	body("sourceUrl").optional({ nullable: true }).custom((value) => isValidUrl(value)).withMessage("sourceUrl must be a valid URL"),
	body("instructor").optional().trim().isLength({ max: 200 }).withMessage("Instructor too long"),
	body("platform").optional().trim().isLength({ max: 200 }).withMessage("Platform too long"),
	body("personalNotes").optional().trim().isLength({ max: 20000 }).withMessage("personalNotes too long"),
	body("tags").optional().isArray().withMessage("Tags must be an array"),
	body("tags.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each tag must be a valid id"),
	body("isFavorite").optional().isBoolean().toBoolean(),
	// relationships
	body("notes").optional().isArray().withMessage("notes must be an array"),
	body("notes.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each note must be a valid id"),
	body("tasks").optional().isArray().withMessage("tasks must be an array"),
	body("tasks.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each task must be a valid id"),
	body("documents").optional().isArray().withMessage("documents must be an array"),
	body("documents.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each document must be a valid id"),
	body("attachments").optional().isArray().withMessage("attachments must be an array"),
	body("attachments.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each attachment must be a valid id"),
	body("goals").optional().isArray().withMessage("goals must be an array"),
	body("goals.*").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Each goal must be a valid id"),
];

export const updateLearningValidator = [
	...mongoIdParamValidator("id"),
	...createLearningValidator,
];

export const learningIdValidator = [...mongoIdParamValidator("id")];

export const listLearningValidator = [
	query("search").optional().trim().isLength({ max: 200 }).withMessage("search too long"),
	query("resourceType").optional().isIn(["Course", "Video", "Article", "Book", "Documentation", "Podcast", "Other"]),
	query("progress").optional().isIn(["Not Started", "In Progress", "Completed"]),
	query("difficulty").optional().isIn(["Beginner", "Intermediate", "Advanced"]),
	query("priority").optional().isIn(["Low", "Medium", "High", "Critical"]),
	query("tag").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("tag must be a valid id"),
	query("subject").optional().trim(),
	query("isFavorite").optional().isBoolean().toBoolean(),
	parseIntegerQuery("page"),
	parseIntegerQuery("limit"),
];

export const sessionCreateValidator = [
	...mongoIdParamValidator("id"),
	body("startedAt").optional().isISO8601().toDate(),
	body("endedAt").optional().isISO8601().toDate(),
	body("durationMinutes").optional().isInt({ min: 0 }).toInt(),
	body("notes").optional().trim().isLength({ max: 2000 }),
];

export const sessionIdValidator = [
	...mongoIdParamValidator("id"),
	param("sessionId").trim().notEmpty().withMessage("sessionId is required").custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid sessionId"),
];

