import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    archiveNoteService,
    createNoteService,
    deleteNoteService,
    getNoteByIdService,
    getNotesService,
    pinNoteService,
    restoreNoteService,
    unarchiveNoteService,
    unpinNoteService,
    updateNoteService,
} from "../services/notes.service.js";

export const createNote = asyncHandler(async (req, res) => {
    const note = await createNoteService(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(201, note, "Note created successfully")
    );
});

export const getNotes = asyncHandler(async (req, res) => {
    const result = await getNotesService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(200, result.data, "Notes fetched successfully", result.pagination)
    );
});

export const getNoteById = asyncHandler(async (req, res) => {
    const note = await getNoteByIdService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

export const updateNote = asyncHandler(async (req, res) => {
    const note = await updateNoteService(req.user._id, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(200, note, "Note updated successfully")
    );
});

export const deleteNote = asyncHandler(async (req, res) => {
    await deleteNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Note deleted successfully")
    );
});

export const restoreNote = asyncHandler(async (req, res) => {
    const note = await restoreNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note restored successfully")
    );
});

export const archiveNote = asyncHandler(async (req, res) => {
    const note = await archiveNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note archived successfully")
    );
});

export const unarchiveNote = asyncHandler(async (req, res) => {
    const note = await unarchiveNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note unarchived successfully")
    );
});

export const pinNote = asyncHandler(async (req, res) => {
    const note = await pinNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note pinned successfully")
    );
});

export const unpinNote = asyncHandler(async (req, res) => {
    const note = await unpinNoteService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, note, "Note unpinned successfully")
    );
});
