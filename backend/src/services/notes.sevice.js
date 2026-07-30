import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import Note from "../models/Note.model.js";
import Project from "../models/Project.model.js";
import Tag from "../models/Tag.model.js";
import pick from "../utils/pick.js";
import {
    buildPaginationResponse,
    getPagination,
} from "../utils/pagination.js";

const allowedNoteFields = [
    "project",
    "title",
    "content",
    "tags",
    "isPinned",
    "isArchived",
];

const normalizeTagIds = (tags = []) =>
    [...new Set(tags.map((tag) => String(tag)).filter(Boolean))];

const buildNotesFilters = (userId, query = {}) => {
    const filters = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.isDeleted === true) {
        filters.isDeleted = true;
    } else {
        filters.isDeleted = false;
    }

    if (typeof query.isArchived === "boolean") {
        filters.isArchived = query.isArchived;
    }

    if (typeof query.isPinned === "boolean") {
        filters.isPinned = query.isPinned;
    }

    if (query.project) {
        filters.project = new mongoose.Types.ObjectId(query.project);
    }

    if (query.tag) {
        filters.tags = new mongoose.Types.ObjectId(query.tag);
    }

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");

        filters.$or = [
            { title: regex },
            { content: regex },
            { tags: regex },
        ];
    }

    return filters;
};

const findOwnedNote = async (userId, noteId, includeDeleted = true) => {
    const filters = {
        _id: noteId,
        user: userId,
    };

    if (!includeDeleted) {
        filters.isDeleted = false;
    }

    const note = await Note.findOne(filters);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return note;
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

export const createNoteService = async (userId, payload) => {
    const notePayload = pick(payload, allowedNoteFields);

    await ensureProjectOwnership(userId, notePayload.project);
    notePayload.tags = await ensureTagsOwnership(userId, notePayload.tags);

    const note = await Note.create({
        user: userId,
        ...notePayload,
    });

    return note;
};

export const getNotesService = async (userId, query) => {
    const filters = buildNotesFilters(userId, query);
    const { page, limit, skip } = getPagination(query);

    const [notes, totalDocuments] = await Promise.all([
        Note.find(filters)
            .sort({ isPinned: -1, updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Note.countDocuments(filters),
    ]);

    return buildPaginationResponse({
        data: notes,
        totalDocuments,
        page,
        limit,
    });
};

export const getNoteByIdService = async (userId, noteId) =>
    findOwnedNote(userId, noteId);

export const updateNoteService = async (userId, noteId, payload) => {
    const note = await findOwnedNote(userId, noteId, false);
    const updates = pick(payload, allowedNoteFields);

    await ensureProjectOwnership(userId, updates.project);
    if (Object.prototype.hasOwnProperty.call(updates, "tags")) {
        updates.tags = await ensureTagsOwnership(userId, updates.tags);
    }

    Object.assign(note, updates);
    await note.save();

    return note;
};

export const deleteNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId, false);

    note.isDeleted = true;
    note.deletedAt = new Date();
    note.isPinned = false;
    await note.save();

    return note;
};

export const restoreNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId);

    if (!note.isDeleted) {
        throw new ApiError(400, "Note is not deleted");
    }

    note.isDeleted = false;
    note.deletedAt = null;
    await note.save();

    return note;
};

export const archiveNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId, false);

    note.isArchived = true;
    await note.save();

    return note;
};

export const unarchiveNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId, false);

    note.isArchived = false;
    await note.save();

    return note;
};

export const pinNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId, false);

    note.isPinned = true;
    await note.save();

    return note;
};

export const unpinNoteService = async (userId, noteId) => {
    const note = await findOwnedNote(userId, noteId, false);

    note.isPinned = false;
    await note.save();

    return note;
};
