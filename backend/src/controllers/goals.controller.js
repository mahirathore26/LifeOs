import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    addResourceToGoalService,
    createGoalService,
    deleteGoalService,
    getGoalByIdService,
    getGoalsService,
    removeResourceFromGoalService,
    updateGoalService,
} from "../services/goals.service.js";

export const createGoal = asyncHandler(async (req, res) => {
    const goal = await createGoalService(req.user._id, req.body);
    return res.status(201).json(new ApiResponse(201, goal, "Goal created"));
});

export const getGoals = asyncHandler(async (req, res) => {
    const goals = await getGoalsService(req.user._id, req.query);
    return res.status(200).json(new ApiResponse(200, goals, "Goals fetched"));
});

export const getGoalById = asyncHandler(async (req, res) => {
    const goal = await getGoalByIdService(req.user._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, goal, "Goal fetched"));
});

export const updateGoal = asyncHandler(async (req, res) => {
    const goal = await updateGoalService(req.user._id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, goal, "Goal updated"));
});

export const deleteGoal = asyncHandler(async (req, res) => {
    await deleteGoalService(req.user._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, null, "Goal deleted"));
});

export const addResourceToGoal = asyncHandler(async (req, res) => {
    const goal = await addResourceToGoalService(req.user._id, req.params.id, req.body.resourceId);
    return res.status(200).json(new ApiResponse(200, goal, "Resource added to goal"));
});

export const removeResourceFromGoal = asyncHandler(async (req, res) => {
    const goal = await removeResourceFromGoalService(req.user._id, req.params.id, req.body.resourceId);
    return res.status(200).json(new ApiResponse(200, goal, "Resource removed from goal"));
});
