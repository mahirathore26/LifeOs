import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import LearningRevision from "../models/LearningRevision.model.js";

// SM-2 algorithm
const updateSM2 = (rev, quality) => {
    // quality: 0-5
    if (quality < 0 || quality > 5) throw new Error("quality must be between 0 and 5");

    if (quality < 3) {
        rev.repetitions = 0;
        rev.intervalDays = 1;
    } else {
        rev.repetitions = (rev.repetitions || 0) + 1;
        if (rev.repetitions === 1) rev.intervalDays = 1;
        else if (rev.repetitions === 2) rev.intervalDays = 6;
        else rev.intervalDays = Math.round((rev.intervalDays || 1) * (rev.easinessFactor || 2.5));
        rev.easinessFactor = Math.max(1.3, (rev.easinessFactor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }

    const next = new Date();
    next.setDate(next.getDate() + rev.intervalDays);
    rev.scheduledAt = next;
    rev.isDone = false;
    rev.lastReviewedAt = new Date();
    return rev;
};

export const getDueRevisionsService = async (userId) => {
    const now = new Date();
    const revisions = await LearningRevision.find({ user: userId, isDone: false, scheduledAt: { $lte: now } }).sort({ scheduledAt: 1 });
    return revisions;
};

export const createRevisionService = async (userId, payload) => {
    if (!mongoose.isValidObjectId(payload.resource)) {
        throw new ApiError(400, "Invalid resource ID format");
    }
    const resourceExists = await mongoose.model("LearningResource").findOne({ _id: payload.resource, user: userId });
    if (!resourceExists) {
        throw new ApiError(404, "Learning resource not found");
    }
    const rev = await LearningRevision.create({ user: userId, ...payload });
    return rev;
};

export const markReviewedService = async (userId, id, quality = 5) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid revision ID format");
    }
    const rev = await LearningRevision.findOne({ _id: id, user: userId });
    if (!rev) throw new ApiError(404, "Revision not found");

    updateSM2(rev, quality);
    // leave isDone as false so the revision will be scheduled for the next review
    await rev.save();

    return rev;
};

export const deleteRevisionService = async (userId, id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid revision ID format");
    }
    const rev = await LearningRevision.findOne({ _id: id, user: userId });
    if (!rev) throw new ApiError(404, "Revision not found");
    await rev.deleteOne();
    return rev;
};
