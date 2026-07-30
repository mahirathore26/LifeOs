import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { globalSearchService } from "../services/search.service.js";

export const globalSearch = asyncHandler(async (req, res) => {
    const result = await globalSearchService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            result.data,
            "Search results fetched successfully",
            result.pagination
        )
    );
});
