import mongoose from "mongoose";
import Project from "../models/Project.model.js";
import Note from "../models/Note.model.js";
import Task from "../models/Task.model.js";
import ApiError from "../utils/ApiError.js";
import pick from "../utils/pick.js";
import { TASK_STATUS } from "../constants/index.js";

const allowedProjectFields = [
    "name",
    "description",
    "color",
    "icon",
];

const buildProjectFilters = (userId, query = {}) => {
    const filters = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (typeof query.isArchived === "boolean") {
        filters.isArchived = query.isArchived;
    }

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");

        filters.$or = [
            { name: regex },
            { description: regex },
        ];
    }

    return filters;
};

const ensureProjectOwnership = async (userId, projectId) => {
    const project = await Project.findOne({
        _id: projectId,
        user: userId,
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

const ensureRelatedProjectOwnership = async (userId, projectId) => {
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

const projectProgressPipeline = (userId, match = {}) => [
    {
        $match: {
            user: new mongoose.Types.ObjectId(userId),
            ...match,
        },
    },
    {
        $lookup: {
            from: "tasks",
            let: { projectId: "$_id", userId: "$user" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$project", "$$projectId"] },
                                { $eq: ["$user", "$$userId"] },
                                { $eq: ["$isDeleted", false] },
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalTasks: { $sum: 1 },
                        completedTasks: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", TASK_STATUS.COMPLETED] },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ],
            as: "taskStats",
        },
    },
    {
        $lookup: {
            from: "notes",
            let: { projectId: "$_id", userId: "$user" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$project", "$$projectId"] },
                                { $eq: ["$user", "$$userId"] },
                                { $eq: ["$isDeleted", false] },
                            ],
                        },
                    },
                },
                {
                    $count: "totalNotes",
                },
            ],
            as: "noteStats",
        },
    },
    {
        $addFields: {
            progress: {
                $let: {
                    vars: {
                        taskStat: { $arrayElemAt: ["$taskStats", 0] },
                    },
                    in: {
                        totalTasks: { $ifNull: ["$$taskStat.totalTasks", 0] },
                        completedTasks: { $ifNull: ["$$taskStat.completedTasks", 0] },
                        percentage: {
                            $cond: [
                                { $gt: [{ $ifNull: ["$$taskStat.totalTasks", 0] }, 0] },
                                {
                                    $round: [
                                        {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        { $ifNull: ["$$taskStat.completedTasks", 0] },
                                                        "$$taskStat.totalTasks",
                                                    ],
                                                },
                                                100,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                                0,
                            ],
                        },
                    },
                },
            },
            relations: {
                tasksCount: {
                    $ifNull: [
                        { $getField: { field: "totalTasks", input: { $arrayElemAt: ["$taskStats", 0] } } },
                        0,
                    ],
                },
                notesCount: {
                    $ifNull: [
                        { $getField: { field: "totalNotes", input: { $arrayElemAt: ["$noteStats", 0] } } },
                        0,
                    ],
                },
            },
        },
    },
    {
        $project: {
            taskStats: 0,
            noteStats: 0,
        },
    },
];

export const createProjectService = async (userId, payload) => {
    const projectPayload = pick(payload, allowedProjectFields);

    const project = await Project.create({
        user: userId,
        ...projectPayload,
    });

    const [projectWithProgress] = await Project.aggregate(
        projectProgressPipeline(userId, { _id: project._id })
    );

    return projectWithProgress;
};

export const getProjectsService = async (userId, query) => {
    const filters = buildProjectFilters(userId, query);

    return Project.aggregate([
        ...projectProgressPipeline(userId, filters),
        { $sort: { isArchived: 1, updatedAt: -1, createdAt: -1 } },
    ]);
};

export const getProjectByIdService = async (userId, projectId) => {
    const [project] = await Project.aggregate(
        projectProgressPipeline(userId, {
            _id: new mongoose.Types.ObjectId(projectId),
        })
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

export const updateProjectService = async (userId, projectId, payload) => {
    const project = await ensureProjectOwnership(userId, projectId);
    const updates = pick(payload, allowedProjectFields);

    Object.assign(project, updates);
    await project.save();

    return getProjectByIdService(userId, project._id);
};

export const archiveProjectService = async (userId, projectId) => {
    const project = await ensureProjectOwnership(userId, projectId);

    project.isArchived = true;
    await project.save();

    return getProjectByIdService(userId, project._id);
};

export const unarchiveProjectService = async (userId, projectId) => {
    const project = await ensureProjectOwnership(userId, projectId);

    project.isArchived = false;
    await project.save();

    return getProjectByIdService(userId, project._id);
};

export const deleteProjectService = async (userId, projectId) => {
    const project = await ensureProjectOwnership(userId, projectId);

    await Promise.all([
        Project.deleteOne({ _id: project._id }),
        Task.updateMany(
            { user: userId, project: project._id },
            { $set: { project: null } }
        ),
        Note.updateMany(
            { user: userId, project: project._id },
            { $set: { project: null } }
        ),
    ]);
};

export const ensureProjectReferenceForUser = ensureRelatedProjectOwnership;
