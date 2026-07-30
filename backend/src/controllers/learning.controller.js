import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
	addSessionService,
	createLearningService,
	deleteLearningService,
	deleteSessionService,
	getLearningByIdService,
	getLearningsService,
	markFavoriteService,
	restoreLearningService,
	updateLearningService,
	updateSessionService,
} from "../services/learning.service.js";
import { getLearningAnalyticsService, getLearningStatsService } from "../services/learning.service.js";

export const createLearning = asyncHandler(async (req, res) => {
	const resource = await createLearningService(req.user._id, req.body);

	return res.status(201).json(new ApiResponse(201, resource, "Learning resource created successfully"));
});

export const getLearnings = asyncHandler(async (req, res) => {
	const result = await getLearningsService(req.user._id, req.query);

	return res.status(200).json(new ApiResponse(200, result.data, "Learning resources fetched successfully", result.pagination));
});

export const getLearningById = asyncHandler(async (req, res) => {
	const resource = await getLearningByIdService(req.user._id, req.params.id);

	return res.status(200).json(new ApiResponse(200, resource, "Learning resource fetched successfully"));
});

export const updateLearning = asyncHandler(async (req, res) => {
	const resource = await updateLearningService(req.user._id, req.params.id, req.body);

	return res.status(200).json(new ApiResponse(200, resource, "Learning resource updated successfully"));
});

export const deleteLearning = asyncHandler(async (req, res) => {
	await deleteLearningService(req.user._id, req.params.id);

	return res.status(200).json(new ApiResponse(200, null, "Learning resource deleted successfully"));
});

export const restoreLearning = asyncHandler(async (req, res) => {
	const resource = await restoreLearningService(req.user._id, req.params.id);

	return res.status(200).json(new ApiResponse(200, resource, "Learning resource restored successfully"));
});

export const favoriteLearning = asyncHandler(async (req, res) => {
	const resource = await markFavoriteService(req.user._id, req.params.id, true);

	return res.status(200).json(new ApiResponse(200, resource, "Marked as favorite"));
});

export const unfavoriteLearning = asyncHandler(async (req, res) => {
	const resource = await markFavoriteService(req.user._id, req.params.id, false);

	return res.status(200).json(new ApiResponse(200, resource, "Removed from favorites"));
});

export const addSession = asyncHandler(async (req, res) => {
	const resource = await addSessionService(req.user._id, req.params.id, req.body);

	return res.status(201).json(new ApiResponse(201, resource, "Session added successfully"));
});

export const updateSession = asyncHandler(async (req, res) => {
	const resource = await updateSessionService(req.user._id, req.params.id, req.params.sessionId, req.body);

	return res.status(200).json(new ApiResponse(200, resource, "Session updated successfully"));
});

export const deleteSession = asyncHandler(async (req, res) => {
	const resource = await deleteSessionService(req.user._id, req.params.id, req.params.sessionId);

	return res.status(200).json(new ApiResponse(200, resource, "Session deleted successfully"));
});

export const getStats = asyncHandler(async (req, res) => {
	const stats = await getLearningStatsService(req.user._id);
	return res.status(200).json(new ApiResponse(200, stats, "Learning stats fetched"));
});

export const getAnalytics = asyncHandler(async (req, res) => {
	const analytics = await getLearningAnalyticsService(req.user._id);
	return res.status(200).json(new ApiResponse(200, analytics, "Learning analytics fetched"));
});

