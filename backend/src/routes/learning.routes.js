import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
	addSession,
	createLearning,
	deleteLearning,
	deleteSession,
	favoriteLearning,
	getLearningById,
	getLearnings,
	restoreLearning,
	unfavoriteLearning,
	updateLearning,
	updateSession,
} from "../controllers/learning.controller.js";
import { getAnalytics, getStats } from "../controllers/learning.controller.js";
import goalsRoutes from "./learning.goals.routes.js";
import revisionsRoutes from "./learning.revisions.routes.js";
import {
	createLearningValidator,
	learningIdValidator,
	listLearningValidator,
	sessionCreateValidator,
	sessionIdValidator,
	updateLearningValidator,
} from "../validators/learning.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", listLearningValidator, validate, getLearnings);
router.post("/", createLearningValidator, validate, createLearning);
router.get("/:id", learningIdValidator, validate, getLearningById);
router.patch("/:id", updateLearningValidator, validate, updateLearning);
router.delete("/:id", learningIdValidator, validate, deleteLearning);
router.patch("/:id/restore", learningIdValidator, validate, restoreLearning);
router.patch("/:id/favorite", learningIdValidator, validate, favoriteLearning);
router.patch("/:id/unfavorite", learningIdValidator, validate, unfavoriteLearning);

router.post("/:id/sessions", sessionCreateValidator, validate, addSession);
router.patch("/:id/sessions/:sessionId", sessionIdValidator, validate, updateSession);
router.delete("/:id/sessions/:sessionId", sessionIdValidator, validate, deleteSession);

router.get("/stats", getStats);
router.get("/analytics", getAnalytics);

// submodules
router.use("/goals", goalsRoutes);
router.use("/revisions", revisionsRoutes);

export default router;
