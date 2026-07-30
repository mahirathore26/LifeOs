import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    assignTagToResourceService,
    createTagService,
    deleteTagService,
    getTagsService,
    renameTagService,
} from "../services/tags.service.js";

export const createTag = asyncHandler(async (req, res) => {
    const tag = await createTagService(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(201, tag, "Tag created successfully")
    );
});

export const getTags = asyncHandler(async (req, res) => {
    const tags = await getTagsService(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, tags, "Tags fetched successfully")
    );
});

export const renameTag = asyncHandler(async (req, res) => {
    const tag = await renameTagService(req.user._id, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(200, tag, "Tag updated successfully")
    );
});

export const deleteTag = asyncHandler(async (req, res) => {
    await deleteTagService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Tag deleted successfully")
    );
});

export const assignTagToResource = asyncHandler(async (req, res) => {
    const tag = await assignTagToResourceService(
        req.user._id,
        req.params.id,
        req.body.resourceType,
        req.body.resourceId
    );

    return res.status(200).json(
        new ApiResponse(200, tag, "Tag assigned successfully")
    );
});
