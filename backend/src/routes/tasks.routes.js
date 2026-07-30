import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    restoreTask,
    updateTask,
} from "../controllers/tasks.controller.js";
import {
    createTaskValidator,
    listTasksValidator,
    taskIdValidator,
    updateTaskValidator,
} from "../validators/tasks.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", listTasksValidator, validate, getTasks);
router.post("/", createTaskValidator, validate, createTask);
router.get("/:id", taskIdValidator, validate, getTaskById);
router.patch("/:id", updateTaskValidator, validate, updateTask);
router.delete("/:id", taskIdValidator, validate, deleteTask);
router.patch("/:id/restore", taskIdValidator, validate, restoreTask);

export default router;
