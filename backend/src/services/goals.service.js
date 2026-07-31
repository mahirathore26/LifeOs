import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import LearningGoal from "../models/LearningGoal.model.js";
import LearningResource from "../models/LearningResource.model.js";

export const createGoalService = async (userId, payload) => {
    const goal = await LearningGoal.create({ user: userId, ...payload });
    return goal;
};

export const getGoalsService = async (userId, query = {}) => {
    const filters = { user: userId };
    if (query.isDeleted === true) filters.isDeleted = true; else filters.isDeleted = false;

    const goals = await LearningGoal.find(filters).sort({ targetDate: 1, updatedAt: -1 });
    return goals;
};

export const getGoalByIdService = async (userId, id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid goal ID format");
    }
    const goal = await LearningGoal.findOne({ _id: id, user: userId });
    if (!goal) throw new ApiError(404, "Goal not found");
    return goal;
};

export const updateGoalService = async (userId, id, payload) => {
    const goal = await getGoalByIdService(userId, id);
    Object.assign(goal, payload);
    await goal.save();
    return goal;
};

export const deleteGoalService = async (userId, id) => {
    const goal = await getGoalByIdService(userId, id);
    goal.isDeleted = true;
    goal.deletedAt = new Date();
    await goal.save();
    return goal;
};

export const addResourceToGoalService = async (userId, goalId, resourceId) => {
    if (!mongoose.isValidObjectId(resourceId)) {
        throw new ApiError(400, "Invalid resource ID format");
    }
    const goal = await getGoalByIdService(userId, goalId);
    const resource = await LearningResource.findOne({ _id: resourceId, user: userId });
    if (!resource) throw new ApiError(400, "Invalid learning resource");
    if (!goal.resources.includes(resource._id)) goal.resources.push(resource._id);
    await goal.save();
    return goal;
};

export const removeResourceFromGoalService = async (userId, goalId, resourceId) => {
    const goal = await getGoalByIdService(userId, goalId);
    goal.resources = goal.resources.filter((r) => String(r) !== String(resourceId));
    await goal.save();
    return goal;
};
