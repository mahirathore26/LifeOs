import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    addResourceToGoal,
    createGoal,
    deleteGoal,
    getGoalById,
    getGoals,
    removeResourceFromGoal,
    updateGoal,
} from "../controllers/goals.controller.js";
import { addResourceValidator, createGoalValidator, goalIdValidator, updateGoalValidator } from "../validators/goals.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getGoals);
router.post("/", createGoalValidator, validate, createGoal);
router.get("/:id", goalIdValidator, validate, getGoalById);
router.patch("/:id", updateGoalValidator, validate, updateGoal);
router.delete("/:id", goalIdValidator, validate, deleteGoal);
router.post("/:id/resources", addResourceValidator, validate, addResourceToGoal);
router.delete("/:id/resources", addResourceValidator, validate, removeResourceFromGoal);

export default router;
