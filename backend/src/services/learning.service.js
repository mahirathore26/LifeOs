import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import LearningResource from "../models/LearningResource.model.js";
import Tag from "../models/Tag.model.js";
import Note from "../models/Note.model.js";
import Task from "../models/Task.model.js";
import Document from "../models/Document.model.js";
import LearningRevision from "../models/LearningRevision.model.js";
import pick from "../utils/pick.js";
import { buildPaginationResponse, getPagination } from "../utils/pagination.js";

const allowedFields = [
	"title",
	"description",
	"resourceType",
	"subject",
	"topics",
	"progress",
	"completionPercentage",
	"difficulty",
	"priority",
	"estimatedDurationMinutes",
	"timeSpentMinutes",
	"sourceUrl",
	"instructor",
	"platform",
	"personalNotes",
	"tags",
	"isFavorite",
];

const normalizeTagIds = (tags = []) =>
	[...new Set(tags.map((t) => String(t)).filter(Boolean))];

const buildFilters = (userId, query = {}) => {
	const filters = { user: new mongoose.Types.ObjectId(userId) };

	if (query.isDeleted === true) {
		filters.isDeleted = true;
	} else {
		filters.isDeleted = false;
	}

	if (query.resourceType) {
		filters.resourceType = query.resourceType;
	}

	if (query.subject) {
		filters.subject = query.subject;
	}

	if (query.progress) {
		filters.progress = query.progress;
	}

	if (query.difficulty) {
		filters.difficulty = query.difficulty;
	}

	if (query.priority) {
		filters.priority = query.priority;
	}

	if (query.tag) {
		if (!mongoose.isValidObjectId(query.tag)) {
			throw new ApiError(400, "Invalid tag ID format");
		}
		filters.tags = new mongoose.Types.ObjectId(query.tag);
	}

	if (query.isFavorite === true || query.isFavorite === false) {
		filters.isFavorite = query.isFavorite;
	}

	if (query.search) {
		const regex = new RegExp(query.search.trim(), "i");

		filters.$or = [
			{ title: regex },
			{ description: regex },
			{ instructor: regex },
			{ platform: regex },
			{ subject: regex },
		];
	}

	return filters;
};

const findOwned = async (userId, id, includeDeleted = true) => {
	if (!mongoose.isValidObjectId(id)) {
		throw new ApiError(400, "Invalid learning resource ID format");
	}

	const filters = { _id: id, user: userId };

	if (!includeDeleted) filters.isDeleted = false;

	const doc = await LearningResource.findOne(filters);

	if (!doc) throw new ApiError(404, "Learning resource not found");

	return doc;
};

const ensureTagsOwnership = async (userId, tagIds = []) => {
	const normalized = normalizeTagIds(tagIds || []);
	if (normalized.length === 0) return [];

	const tags = await Tag.find({ _id: { $in: normalized }, user: userId }).select("_id");

	if (tags.length !== normalized.length) {
		throw new ApiError(400, "Invalid tag reference");
	}

	return normalized;
};

const normalizeRefIds = (ids = []) => [...new Set(ids.map((t) => String(t)).filter(Boolean))];

const ensureNotesOwnership = async (userId, noteIds = []) => {
	const normalized = normalizeRefIds(noteIds || []);
	if (normalized.length === 0) return [];

	const notes = await Note.find({ _id: { $in: normalized }, user: userId }).select("_id");
	if (notes.length !== normalized.length) throw new ApiError(400, "Invalid note reference");
	return normalized;
};

const ensureTasksOwnership = async (userId, taskIds = []) => {
	const normalized = normalizeRefIds(taskIds || []);
	if (normalized.length === 0) return [];

	const tasks = await Task.find({ _id: { $in: normalized }, user: userId }).select("_id");
	if (tasks.length !== normalized.length) throw new ApiError(400, "Invalid task reference");
	return normalized;
};

const ensureDocumentsOwnership = async (userId, docIds = []) => {
	const normalized = normalizeRefIds(docIds || []);
	if (normalized.length === 0) return [];

	const docs = await Document.find({ _id: { $in: normalized }, user: userId }).select("_id");
	if (docs.length !== normalized.length) throw new ApiError(400, "Invalid document reference");
	return normalized;
};

const recalcCompletion = (doc) => {
	// If topics defined, use topic completion
	if (Array.isArray(doc.topics) && doc.topics.length > 0) {
		const total = doc.topics.length;
		const completed = doc.topics.filter((t) => !!t.completed).length;
		doc.completionPercentage = Math.round((completed / total) * 100);
		doc.progress = doc.completionPercentage >= 100 ? "Completed" : doc.completionPercentage > 0 ? "In Progress" : "Not Started";
		return;
	}

	// fallback to time-based if estimatedDurationMinutes set
	if (typeof doc.estimatedDurationMinutes === "number" && doc.estimatedDurationMinutes > 0) {
		const pct = Math.min(100, Math.round(((doc.timeSpentMinutes || 0) / doc.estimatedDurationMinutes) * 100));
		doc.completionPercentage = pct;
		doc.progress = pct >= 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started";
		return;
	}

	// default: respect explicit progress or set Not Started
	if (!doc.progress) doc.progress = "Not Started";
	if (doc.progress === "Completed") doc.completionPercentage = 100;
};

export const createLearningService = async (userId, payload) => {
	const data = pick(payload, allowedFields);

	if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
		data.tags = await ensureTagsOwnership(userId, payload.tags);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
		data.notes = await ensureNotesOwnership(userId, payload.notes);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "tasks")) {
		data.tasks = await ensureTasksOwnership(userId, payload.tasks);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "documents")) {
		data.documents = await ensureDocumentsOwnership(userId, payload.documents);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "attachments")) {
		data.attachments = await ensureDocumentsOwnership(userId, payload.attachments);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "goals")) {
		data.goals = normalizeRefIds(payload.goals || []);
	}

	const doc = await LearningResource.create({ user: userId, ...data });

	// compute initial progress
	recalcCompletion(doc);
	await doc.save();

	return doc;
};

export const getLearningsService = async (userId, query) => {
	const filters = buildFilters(userId, query);
	const { page, limit, skip } = getPagination(query);

	const [items, totalDocuments] = await Promise.all([
		LearningResource.find(filters)
			.sort({ isFavorite: -1, updatedAt: -1 })
			.skip(skip)
			.limit(limit),
		LearningResource.countDocuments(filters),
	]);

	return buildPaginationResponse({ data: items, totalDocuments, page, limit });
};

export const getLearningByIdService = async (userId, id) => findOwned(userId, id);

export const updateLearningService = async (userId, id, payload) => {
	const doc = await findOwned(userId, id, false);
	const updates = pick(payload, allowedFields);

	if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
		updates.tags = await ensureTagsOwnership(userId, payload.tags);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
		updates.notes = await ensureNotesOwnership(userId, payload.notes);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "tasks")) {
		updates.tasks = await ensureTasksOwnership(userId, payload.tasks);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "documents")) {
		updates.documents = await ensureDocumentsOwnership(userId, payload.documents);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "attachments")) {
		updates.attachments = await ensureDocumentsOwnership(userId, payload.attachments);
	}

	if (Object.prototype.hasOwnProperty.call(payload, "goals")) {
		updates.goals = normalizeRefIds(payload.goals || []);
	}

	Object.assign(doc, updates);

	if (doc.progress === "Completed") {
		doc.completionPercentage = 100;
	}

	recalcCompletion(doc);
	await doc.save();

	return doc;
};

export const deleteLearningService = async (userId, id) => {
	const doc = await findOwned(userId, id, false);

	doc.isDeleted = true;
	doc.deletedAt = new Date();
	await doc.save();

	return doc;
};

export const restoreLearningService = async (userId, id) => {
	const doc = await findOwned(userId, id);

	if (!doc.isDeleted) throw new ApiError(400, "Resource is not deleted");

	doc.isDeleted = false;
	doc.deletedAt = null;
	await doc.save();

	return doc;
};

export const markFavoriteService = async (userId, id, value = true) => {
	const doc = await findOwned(userId, id, false);
	doc.isFavorite = !!value;
	await doc.save();
	return doc;
};

export const addSessionService = async (userId, id, payload) => {
	const doc = await findOwned(userId, id, false);

	const session = {
		startedAt: payload.startedAt || new Date(),
		endedAt: payload.endedAt || null,
		durationMinutes: payload.durationMinutes || 0,
		notes: payload.notes || "",
	};

	doc.sessions.push(session);

	if (session.durationMinutes) doc.timeSpentMinutes = (doc.timeSpentMinutes || 0) + session.durationMinutes;

	// recalc progress after session
	recalcCompletion(doc);
	await doc.save();

	// optionally schedule a simple next revision
	try {
		const next = new Date();
		next.setDate(next.getDate() + 1);
		await LearningRevision.create({ user: userId, resource: doc._id, scheduledAt: next });
	} catch (err) {
		// ignore
	}

	return doc;
};

export const updateSessionService = async (userId, id, sessionId, payload) => {
	const doc = await findOwned(userId, id, false);

	const session = doc.sessions.id(sessionId);
	if (!session) throw new ApiError(404, "Session not found");

	// adjust timeSpentMinutes if duration changed
	const prevDuration = session.durationMinutes || 0;

	if (Object.prototype.hasOwnProperty.call(payload, "startedAt")) session.startedAt = payload.startedAt;
	if (Object.prototype.hasOwnProperty.call(payload, "endedAt")) session.endedAt = payload.endedAt;
	if (Object.prototype.hasOwnProperty.call(payload, "durationMinutes")) session.durationMinutes = payload.durationMinutes;
	if (Object.prototype.hasOwnProperty.call(payload, "notes")) session.notes = payload.notes;

	const newDuration = session.durationMinutes || 0;
	doc.timeSpentMinutes = (doc.timeSpentMinutes || 0) - prevDuration + newDuration;

	// recalc and save
	recalcCompletion(doc);
	await doc.save();

	return doc;
};

export const deleteSessionService = async (userId, id, sessionId) => {
	const doc = await findOwned(userId, id, false);

	const session = doc.sessions.id(sessionId);
	if (!session) throw new ApiError(404, "Session not found");

	const duration = session.durationMinutes || 0;
	session.deleteOne();
	doc.timeSpentMinutes = Math.max(0, (doc.timeSpentMinutes || 0) - duration);

	// recalc and save
	recalcCompletion(doc);
	await doc.save();

	return doc;
};

export const getLearningStatsService = async (userId) => {
	const now = new Date();
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(now.getDate() - 6);

	const [summary] = await LearningResource.aggregate([
		{ $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
		{
			$facet: {
				totals: [
					{
						$group: {
							_id: null,
							totalResources: { $sum: 1 },
							totalTimeMinutes: { $sum: "$timeSpentMinutes" },
							completedResources: { $sum: { $cond: [{ $eq: ["$progress", "Completed"] }, 1, 0] } },
							favorites: { $sum: { $cond: ["$isFavorite", 1, 0] } },
						},
					},
				],
				recentSessions: [
					{ $unwind: { path: "$sessions", preserveNullAndEmptyArrays: false } },
					{ $match: { "sessions.startedAt": { $gte: sevenDaysAgo, $lte: now } } },
					{ $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$sessions.startedAt" } }, minutes: { $sum: "$sessions.durationMinutes" }, count: { $sum: 1 } } },
					{ $sort: { _id: 1 } },
				],
				topPlatforms: [
					{ $group: { _id: "$platform", count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				],
			},
		},
	]);

	const totals = summary?.totals?.[0] || { totalResources: 0, totalTimeMinutes: 0, completedResources: 0, favorites: 0 };

	return {
		totalResources: totals.totalResources || 0,
		totalTimeMinutes: totals.totalTimeMinutes || 0,
		completedResources: totals.completedResources || 0,
		favorites: totals.favorites || 0,
		recentSessions: summary?.recentSessions || [],
		topPlatforms: summary?.topPlatforms || [],
	};
};

export const getLearningAnalyticsService = async (userId) => {
	// provide quick analytics: sessions per day, avg session length, top topics
	const now = new Date();
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(now.getDate() - 29);

	const sessionsAgg = await LearningResource.aggregate([
		{ $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
		{ $unwind: { path: "$sessions", preserveNullAndEmptyArrays: false } },
		{ $match: { "sessions.startedAt": { $gte: thirtyDaysAgo, $lte: now } } },
		{ $group: { _id: null, totalSessions: { $sum: 1 }, totalMinutes: { $sum: "$sessions.durationMinutes" }, avgMinutes: { $avg: "$sessions.durationMinutes" } } },
	]);

	const topicsAgg = await LearningResource.aggregate([
		{ $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
		{ $unwind: { path: "$topics", preserveNullAndEmptyArrays: false } },
		{ $group: { _id: "$topics.title", count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: 10 },
	]);

	const s = sessionsAgg?.[0] || { totalSessions: 0, totalMinutes: 0, avgMinutes: 0 };

	return {
		totalSessions30d: s.totalSessions || 0,
		totalMinutes30d: s.totalMinutes || 0,
		avgSessionMinutes: Math.round(s.avgMinutes || 0),
		topTopics: topicsAgg || [],
	};
};


