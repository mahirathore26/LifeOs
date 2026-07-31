import mongoose from "mongoose";
import Note from "../models/Note.model.js";
import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import Document from "../models/Document.model.js";
import {
    buildPaginationResponse,
    getPagination,
} from "../utils/pagination.js";
import ApiError from "../utils/ApiError.js";
const defaultTypes = ["note", "task", "project", "document"];

const buildRegex = (value) => new RegExp(value.trim(), "i");

const normalizeTypes = (types) =>
    Array.isArray(types) && types.length > 0 ? types : defaultTypes;

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const buildBaseFilters = (userId, query) => {
    const filters = {
        user: toObjectId(userId),
    };

    if (query.project) {
        if (!mongoose.isValidObjectId(query.project)) {
            throw new ApiError(400, "Invalid project id");
        }

        filters.project = toObjectId(query.project);
    }

    return filters;
};

const searchNotes = async (userId, query) => {
    const filters = {
        ...buildBaseFilters(userId, query),
        isDeleted: false,
    };

    if (typeof query.isArchived === "boolean") {
        filters.isArchived = query.isArchived;
    }
if (query.tag) {
    if (!mongoose.isValidObjectId(query.tag)) {
        throw new ApiError(400, "Invalid tag id");
    }

    filters.tags = toObjectId(query.tag);
}

    if (query.q) {
        const regex = buildRegex(query.q);
        filters.$or = [{ title: regex }, { content: regex }];
    }

    const notes = await Note.find(filters)
        .select("title content project tags isPinned isArchived updatedAt createdAt")
        .sort({ updatedAt: -1, createdAt: -1 });

    return notes.map((note) => ({
        id: note._id,
        type: "note",
        title: note.title,
        subtitle: note.content,
        project: note.project,
        tags: note.tags,
        metadata: {
            isPinned: note.isPinned,
            isArchived: note.isArchived,
        },
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
    }));
};

const searchTasks = async (userId, query) => {
    const filters = {
        ...buildBaseFilters(userId, query),
        isDeleted: false,
    };

    if (query.tag) {
    if (!mongoose.isValidObjectId(query.tag)) {
        throw new ApiError(400, "Invalid tag id");
    }

    filters.tags = toObjectId(query.tag);
}

    if (query.status) {
        filters.status = query.status;
    }

    if (query.priority) {
        filters.priority = query.priority;
    }

    if (query.q) {
        const regex = buildRegex(query.q);
        filters.$or = [{ title: regex }, { description: regex }];
    }

    const tasks = await Task.find(filters)
        .select("title description project tags status priority dueDate updatedAt createdAt")
        .sort({ updatedAt: -1, createdAt: -1 });

    return tasks.map((task) => ({
        id: task._id,
        type: "task",
        title: task.title,
        subtitle: task.description,
        project: task.project,
        tags: task.tags,
        metadata: {
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
        },
        updatedAt: task.updatedAt,
        createdAt: task.createdAt,
    }));
};

const searchProjects = async (userId, query) => {
    const filters = {
        user: toObjectId(userId),
    };

    if (typeof query.isArchived === "boolean") {
        filters.isArchived = query.isArchived;
    }

    if (query.q) {
        const regex = buildRegex(query.q);
        filters.$or = [{ name: regex }, { description: regex }];
    }

    const projects = await Project.find(filters)
        .select("name description color icon isArchived updatedAt createdAt")
        .sort({ updatedAt: -1, createdAt: -1 });

    return projects.map((project) => ({
        id: project._id,
        type: "project",
        title: project.name,
        subtitle: project.description,
        project: project._id,
        tags: [],
        metadata: {
            color: project.color,
            icon: project.icon,
            isArchived: project.isArchived,
        },
        updatedAt: project.updatedAt,
        createdAt: project.createdAt,
    }));
};

const searchDocuments = async (userId, query) => {
    const filters = buildBaseFilters(userId, query);

    if (query.q) {
        const regex = buildRegex(query.q);
        filters.$or = [
            { title: regex },
            { description: regex },
            { "file.originalName": regex },
        ];
    }

    const documents = await Document.find(filters)
        .select("title description project file updatedAt createdAt")
        .sort({ updatedAt: -1, createdAt: -1 });

    return documents.map((document) => ({
        id: document._id,
        type: "document",
        title: document.title,
        subtitle: document.description || document.file.originalName,
        project: document.project,
        tags: [],
        metadata: {
            fileName: document.file.originalName,
            mimeType: document.file.mimeType,
            bytes: document.file.bytes,
            url: document.file.url,
        },
        updatedAt: document.updatedAt,
        createdAt: document.createdAt,
    }));
};

export const globalSearchService = async (userId, query = {}) => {
    const types = normalizeTypes(query.types);
    const searches = [];

    if (types.includes("note")) {
        searches.push(searchNotes(userId, query));
    }

    if (types.includes("task")) {
        searches.push(searchTasks(userId, query));
    }

    if (types.includes("project")) {
        searches.push(searchProjects(userId, query));
    }

    if (types.includes("document")) {
        searches.push(searchDocuments(userId, query));
    }

    const searchResults = await Promise.all(searches);
    const mergedResults = searchResults
        .flat()
        .sort(
            (left, right) =>
                new Date(right.updatedAt).getTime() -
                new Date(left.updatedAt).getTime()
        );

    const { page, limit, skip } = getPagination(query);
    const paginatedResults = mergedResults.slice(skip, skip + limit);

    return buildPaginationResponse({
        data: paginatedResults,
        totalDocuments: mergedResults.length,
        page,
        limit,
    });
};
