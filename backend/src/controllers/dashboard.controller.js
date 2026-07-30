import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getDashboardOverviewService } from "../services/dashboard.service.js";

export const getDashboardOverview = asyncHandler(async (req, res) => {
    const overview = await getDashboardOverviewService(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            overview,
            "Dashboard overview fetched successfully"
        )
    );
});
