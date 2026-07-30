import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    archiveProjectService,
    createProjectService,
    deleteProjectService,
    getProjectByIdService,
    getProjectsService,
    unarchiveProjectService,
    updateProjectService,
} from "../services/projects.service.js";

export const createProject = asyncHandler(async (req, res) => {
    const project = await createProjectService(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

export const getProjects = asyncHandler(async (req, res) => {
    const projects = await getProjectsService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    );
});

export const getProjectById = asyncHandler(async (req, res) => {
    const project = await getProjectByIdService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully")
    );
});

export const updateProject = asyncHandler(async (req, res) => {
    const project = await updateProjectService(req.user._id, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    );
});

export const archiveProject = asyncHandler(async (req, res) => {
    const project = await archiveProjectService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, project, "Project archived successfully")
    );
});

export const unarchiveProject = asyncHandler(async (req, res) => {
    const project = await unarchiveProjectService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, project, "Project unarchived successfully")
    );
});

export const deleteProject = asyncHandler(async (req, res) => {
    await deleteProjectService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Project deleted successfully")
    );
});
