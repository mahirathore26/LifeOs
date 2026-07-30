import mongoose from "mongoose";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/index.js";
import Project from "../models/Project.model.js";
import Tag from "../models/Tag.model.js";
import Task from "../models/Task.model.js";
import ApiError from "../utils/ApiError.js";
import pick from "../utils/pick.js";
import {
    buildPaginationResponse,
    getPagination,
} from "../utils/pagination.js";

const allowedTaskFields = [
    "project",
    "tags",
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
];

const priorityOrder = {
    [TASK_PRIORITY.LOW]: 1,
    [TASK_PRIORITY.MEDIUM]: 2,
    [TASK_PRIORITY.HIGH]: 3,
};

const statusCompletionMap = {
    [TASK_STATUS.COMPLETED]: true,
    [TASK_STATUS.TODO]: false,
    [TASK_STATUS.IN_PROGRESS]: false,
};

const buildTaskFilters = (userId, query = {}) => {
    const filters = {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: query.isDeleted === true,
    };

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");

        filters.$or = [
            { title: regex },
            { description: regex },
        ];
    }

    if (query.status) {
        filters.status = query.status;
    }

    if (query.priority) {
        filters.priority = query.priority;
    }

    if (query.project) {
        filters.project = new mongoose.Types.ObjectId(query.project);
    }

    if (query.tag) {
        filters.tags = new mongoose.Types.ObjectId(query.tag);
    }

    if (query.dueDateFrom || query.dueDateTo) {
        filters.dueDate = {};

        if (query.dueDateFrom) {
            filters.dueDate.$gte = query.dueDateFrom;
        }

        if (query.dueDateTo) {
            filters.dueDate.$lte = query.dueDateTo;
        }
    }

    return filters;
};

const buildTaskSort = ({ sortBy = "updatedAt", sortOrder = "desc" } = {}) => {
    const direction = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "priority") {
        return [
            { $addFields: { priorityWeight: { $ifNull: [{ $switch: {
                branches: [
                    { case: { $eq: ["$priority", TASK_PRIORITY.LOW] }, then: priorityOrder[TASK_PRIORITY.LOW] },
                    { case: { $eq: ["$priority", TASK_PRIORITY.MEDIUM] }, then: priorityOrder[TASK_PRIORITY.MEDIUM] },
                    { case: { $eq: ["$priority", TASK_PRIORITY.HIGH] }, then: priorityOrder[TASK_PRIORITY.HIGH] },
                ],
                default: priorityOrder[TASK_PRIORITY.MEDIUM],
            } }, priorityOrder[TASK_PRIORITY.MEDIUM]] } } },
            { $sort: { priorityWeight: direction, updatedAt: -1, createdAt: -1 } },
            { $project: { priorityWeight: 0 } },
        ];
    }

    return [
        { $sort: { [sortBy]: direction, updatedAt: -1, createdAt: -1 } },
    ];
};

const findOwnedTask = async (userId, taskId, includeDeleted = true) => {
    const filters = {
        _id: taskId,
        user: userId,
    };

    if (!includeDeleted) {
        filters.isDeleted = false;
    }

    const task = await Task.findOne(filters);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return task;
};

const ensureProjectOwnership = async (userId, projectId) => {
    if (!projectId) {
        return null;
    }

    const project = await Project.findOne({
        _id: projectId,
        user: userId,
    });

    if (!project) {
        throw new ApiError(400, "Invalid project reference");
    }

    return project;
};

const normalizeTagIds = (tags = []) =>
    [...new Set(tags.map((tag) => String(tag)).filter(Boolean))];

const ensureTagsOwnership = async (userId, tagIds = []) => {
    if (!tagIds) {
        return [];
    }

    const normalizedTagIds = normalizeTagIds(tagIds);

    if (normalizedTagIds.length === 0) {
        return [];
    }

    const tags = await Tag.find({
        _id: { $in: normalizedTagIds },
        user: userId,
    }).select("_id");

    if (tags.length !== normalizedTagIds.length) {
        throw new ApiError(400, "Invalid tag reference");
    }

    return normalizedTagIds;
};

const applyTaskState = (task, updates) => {
    Object.assign(task, updates);

    if (Object.prototype.hasOwnProperty.call(updates, "status")) {
        task.completedAt = statusCompletionMap[updates.status]
            ? task.completedAt || new Date()
            : null;
    }
};

export const createTaskService = async (userId, payload) => {
    const taskPayload = pick(payload, allowedTaskFields);

    await ensureProjectOwnership(userId, taskPayload.project);
    taskPayload.tags = await ensureTagsOwnership(userId, taskPayload.tags);

    const task = new Task({
        user: userId,
    });

    applyTaskState(task, taskPayload);
    await task.save();

    return task;
};

export const getTasksService = async (userId, query) => {
    const filters = buildTaskFilters(userId, query);
    const { page, limit, skip } = getPagination(query);
    const sortPipeline = buildTaskSort(query);

    const [tasks, totalDocuments] = await Promise.all([
        Task.aggregate([
            { $match: filters },
            ...sortPipeline,
            { $skip: skip },
            { $limit: limit },
        ]),
        Task.countDocuments(filters),
    ]);

    return buildPaginationResponse({
        data: tasks,
        totalDocuments,
        page,
        limit,
    });
};

export const getTaskByIdService = async (userId, taskId) =>
    findOwnedTask(userId, taskId);

export const updateTaskService = async (userId, taskId, payload) => {
    const task = await findOwnedTask(userId, taskId, false);
    const updates = pick(payload, allowedTaskFields);

    await ensureProjectOwnership(userId, updates.project);
    if (Object.prototype.hasOwnProperty.call(updates, "tags")) {
        updates.tags = await ensureTagsOwnership(userId, updates.tags);
    }

    applyTaskState(task, updates);
    await task.save();

    return task;
};

export const deleteTaskService = async (userId, taskId) => {
    const task = await findOwnedTask(userId, taskId, false);

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    return task;
};

export const restoreTaskService = async (userId, taskId) => {
    const task = await findOwnedTask(userId, taskId);

    if (!task.isDeleted) {
        throw new ApiError(400, "Task is not deleted");
    }

    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();

    return task;
};
