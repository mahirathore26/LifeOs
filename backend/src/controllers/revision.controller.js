import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createRevisionService, deleteRevisionService, getDueRevisionsService, markReviewedService } from "../services/revision.service.js";

export const getDueRevisions = asyncHandler(async (req, res) => {
    const items = await getDueRevisionsService(req.user._id);
    return res.status(200).json(new ApiResponse(200, items, "Due revisions fetched"));
});

export const createRevision = asyncHandler(async (req, res) => {
    const rev = await createRevisionService(req.user._id, req.body);
    return res.status(201).json(new ApiResponse(201, rev, "Revision created"));
});

export const markReviewed = asyncHandler(async (req, res) => {
    const rev = await markReviewedService(req.user._id, req.params.id, Number(req.body.quality || 5));
    return res.status(200).json(new ApiResponse(200, rev, "Revision reviewed"));
});

export const deleteRevision = asyncHandler(async (req, res) => {
    const rev = await deleteRevisionService(req.user._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, rev, "Revision deleted"));
});
