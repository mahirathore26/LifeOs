import mongoose from "mongoose";
import Note from "../models/Note.model.js";
import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import Document from "../models/Document.model.js";
import LearningResource from "../models/LearningResource.model.js";
import LearningRevision from "../models/LearningRevision.model.js";
import { TASK_STATUS } from "../constants/index.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const startOfDay = (date) => {
    const value = new Date(date);

    value.setHours(0, 0, 0, 0);

    return value;
};

const endOfDay = (date) => {
    const value = new Date(date);

    value.setHours(23, 59, 59, 999);

    return value;
};

const buildProductivityStats = async (userId) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const sevenDaysAgo = new Date(todayStart);

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [taskStats] = await Task.aggregate([
        {
            $match: {
                user: toObjectId(userId),
                isDeleted: false,
            },
        },
        {
            $facet: {
                totals: [
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
                            pendingTasks: {
                                $sum: {
                                    $cond: [
                                        { $ne: ["$status", TASK_STATUS.COMPLETED] },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            overdueTasks: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$status", TASK_STATUS.COMPLETED] },
                                                { $ne: ["$dueDate", null] },
                                                { $lt: ["$dueDate", todayStart] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            dueTodayTasks: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$status", TASK_STATUS.COMPLETED] },
                                                { $ne: ["$dueDate", null] },
                                                { $gte: ["$dueDate", todayStart] },
                                                { $lte: ["$dueDate", todayEnd] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                ],
                completionTrend: [
                    {
                        $match: {
                            completedAt: {
                                $gte: sevenDaysAgo,
                                $lte: todayEnd,
                            },
                            status: TASK_STATUS.COMPLETED,
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$completedAt",
                                },
                            },
                            completedTasks: { $sum: 1 },
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const totals = taskStats?.totals?.[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        dueTodayTasks: 0,
    };

    return {
        ...totals,
        completionRate:
            totals.totalTasks > 0
                ? Math.round((totals.completedTasks / totals.totalTasks) * 100)
                : 0,
        completionTrend: taskStats?.completionTrend || [],
    };
};

const buildRecentNotes = async (userId) =>
    Note.aggregate([
        {
            $match: {
                user: toObjectId(userId),
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $project: {
                title: 1,
                content: 1,
                isPinned: 1,
                isArchived: 1,
                updatedAt: 1,
                createdAt: 1,
                project: {
                    $let: {
                        vars: {
                            project: { $arrayElemAt: ["$project", 0] },
                        },
                        in: {
                            _id: "$$project._id",
                            name: "$$project.name",
                            color: "$$project.color",
                            icon: "$$project.icon",
                        },
                    },
                },
            },
        },
        {
            $sort: {
                isPinned: -1,
                updatedAt: -1,
                createdAt: -1,
            },
        },
        {
            $limit: 5,
        },
    ]);

const buildPendingTasks = async (userId) =>
    Task.aggregate([
        {
            $match: {
                user: toObjectId(userId),
                isDeleted: false,
                status: { $ne: TASK_STATUS.COMPLETED },
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $addFields: {
                dueDateSort: {
                    $ifNull: ["$dueDate", new Date("9999-12-31T23:59:59.999Z")],
                },
                priorityWeight: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ["$priority", "HIGH"] },
                                then: 3,
                            },
                            {
                                case: { $eq: ["$priority", "MEDIUM"] },
                                then: 2,
                            },
                            {
                                case: { $eq: ["$priority", "LOW"] },
                                then: 1,
                            },
                        ],
                        default: 0,
                    },
                },
            },
        },
        {
            $project: {
                title: 1,
                description: 1,
                status: 1,
                priority: 1,
                dueDate: 1,
                updatedAt: 1,
                createdAt: 1,
                dueDateSort: 1,
                priorityWeight: 1,
                project: {
                    $let: {
                        vars: {
                            project: { $arrayElemAt: ["$project", 0] },
                        },
                        in: {
                            _id: "$$project._id",
                            name: "$$project.name",
                            color: "$$project.color",
                            icon: "$$project.icon",
                        },
                    },
                },
            },
        },
        {
            $sort: {
                dueDateSort: 1,
                priorityWeight: -1,
                updatedAt: -1,
            },
        },
        {
            $limit: 8,
        },
        {
            $project: {
                dueDateSort: 0,
                priorityWeight: 0,
            },
        },
    ]);

const buildProjectProgress = async (userId) =>
    Project.aggregate([
        {
            $match: {
                user: toObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "tasks",
                let: {
                    projectId: "$_id",
                    userId: "$user",
                },
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
                            pendingTasks: {
                                $sum: {
                                    $cond: [
                                        { $ne: ["$status", TASK_STATUS.COMPLETED] },
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
                let: {
                    projectId: "$_id",
                    userId: "$user",
                },
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
                        $count: "count",
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
                            pendingTasks: { $ifNull: ["$$taskStat.pendingTasks", 0] },
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
                notesCount: {
                    $ifNull: [
                        { $getField: { field: "count", input: { $arrayElemAt: ["$noteStats", 0] } } },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                color: 1,
                icon: 1,
                isArchived: 1,
                updatedAt: 1,
                createdAt: 1,
                progress: 1,
                notesCount: 1,
            },
        },
        {
            $sort: {
                isArchived: 1,
                updatedAt: -1,
            },
        },
        {
            $limit: 6,
        },
    ]);

const buildDocumentSummaries = async (userId) => {
    const [summary] = await Document.aggregate([
        {
            $match: {
                user: toObjectId(userId),
            },
        },
        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            totalDocuments: { $sum: 1 },
                            totalBytes: { $sum: "$file.bytes" },
                        },
                    },
                ],
                resourceTypes: [
                    {
                        $group: {
                            _id: "$file.resourceType",
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: {
                            count: -1,
                        },
                    },
                ],
                recentDocuments: [
                    {
                        $lookup: {
                            from: "projects",
                            localField: "project",
                            foreignField: "_id",
                            as: "project",
                        },
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            updatedAt: 1,
                            createdAt: 1,
                            project: {
                                $let: {
                                    vars: {
                                        project: {
                                            $arrayElemAt: ["$project", 0],
                                        },
                                    },
                                    in: {
                                        _id: "$$project._id",
                                        name: "$$project.name",
                                        color: "$$project.color",
                                        icon: "$$project.icon",
                                    },
                                },
                            },
                            file: {
                                originalName: "$file.originalName",
                                mimeType: "$file.mimeType",
                                bytes: "$file.bytes",
                                url: "$file.url",
                            },
                        },
                    },
                    {
                        $sort: {
                            updatedAt: -1,
                            createdAt: -1,
                        },
                    },
                    {
                        $limit: 5,
                    },
                ],
            },
        },
    ]);

    return {
        totalDocuments: summary?.totals?.[0]?.totalDocuments || 0,
        totalBytes: summary?.totals?.[0]?.totalBytes || 0,
        resourceTypes: summary?.resourceTypes || [],
        recentDocuments: summary?.recentDocuments || [],
    };
};

const buildLearningOverview = async (userId) => {
    const now = new Date();
    const [summary] = await LearningResource.aggregate([
        { $match: { user: toObjectId(userId), isDeleted: false } },
        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            totalResources: { $sum: 1 },
                            completed: { $sum: { $cond: [{ $eq: ["$progress", "Completed"] }, 1, 0] } },
                            favorites: { $sum: { $cond: ["$isFavorite", 1, 0] } },
                            totalMinutes: { $sum: "$timeSpentMinutes" },
                        },
                    },
                ],
                recent: [
                    { $sort: { updatedAt: -1 } },
                    { $limit: 5 },
                    { $project: { title: 1, progress: 1, completionPercentage: 1, updatedAt: 1 } },
                ],
            },
        },
    ]);

    const upcomingRevisions = await LearningRevision.countDocuments({ user: toObjectId(userId), isDone: false, scheduledAt: { $lte: now } });

    const totals = summary?.totals?.[0] || { totalResources: 0, completed: 0, favorites: 0, totalMinutes: 0 };

    return {
        totalResources: totals.totalResources || 0,
        completed: totals.completed || 0,
        favorites: totals.favorites || 0,
        totalMinutes: totals.totalMinutes || 0,
        upcomingRevisions,
        recent: summary?.recent || [],
    };
};

export const getDashboardOverviewService = async (userId) => {
    const [
        productivity,
        recentNotes,
        pendingTasks,
        projectProgress,
        documents,
        learning,
    ] = await Promise.all([
        buildProductivityStats(userId),
        buildRecentNotes(userId),
        buildPendingTasks(userId),
        buildProjectProgress(userId),
        buildDocumentSummaries(userId),
        buildLearningOverview(userId),
    ]);

    return {
        productivity,
        recentNotes,
        pendingTasks,
        projectProgress,
        documents,
        learning,
    };
};
