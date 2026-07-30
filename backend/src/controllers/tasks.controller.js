import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    createTaskService,
    deleteTaskService,
    getTaskByIdService,
    getTasksService,
    restoreTaskService,
    updateTaskService,
} from "../services/tasks.service.js";

export const createTask = asyncHandler(async (req, res) => {
    const task = await createTaskService(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    );
});

export const getTasks = asyncHandler(async (req, res) => {
    const result = await getTasksService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(200, result.data, "Tasks fetched successfully", result.pagination)
    );
});

export const getTaskById = asyncHandler(async (req, res) => {
    const task = await getTaskByIdService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, task, "Task fetched successfully")
    );
});

export const updateTask = asyncHandler(async (req, res) => {
    const task = await updateTaskService(req.user._id, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(200, task, "Task updated successfully")
    );
});

export const deleteTask = asyncHandler(async (req, res) => {
    await deleteTaskService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Task deleted successfully")
    );
});

export const restoreTask = asyncHandler(async (req, res) => {
    const task = await restoreTaskService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, task, "Task restored successfully")
    );
});
