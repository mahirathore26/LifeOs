import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    archiveProject,
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    unarchiveProject,
    updateProject,
} from "../controllers/projects.controller.js";
import {
    createProjectValidator,
    listProjectsValidator,
    projectIdValidator,
    updateProjectValidator,
} from "../validators/projects.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", listProjectsValidator, validate, getProjects);
router.post("/", createProjectValidator, validate, createProject);
router.get("/:id", projectIdValidator, validate, getProjectById);
router.patch("/:id", updateProjectValidator, validate, updateProject);
router.delete("/:id", projectIdValidator, validate, deleteProject);
router.patch("/:id/archive", projectIdValidator, validate, archiveProject);
router.patch("/:id/unarchive", projectIdValidator, validate, unarchiveProject);

export default router;
