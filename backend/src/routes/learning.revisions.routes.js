import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createRevision, deleteRevision, getDueRevisions, markReviewed } from "../controllers/revision.controller.js";
import { createRevisionValidator, markReviewedValidator, revisionIdValidator } from "../validators/revision.validator.js";

const router = Router();
router.use(verifyJWT);

router.get("/due", getDueRevisions);
router.post("/", createRevisionValidator, validate, createRevision);
router.post("/:id/review", markReviewedValidator, validate, markReviewed);
router.delete("/:id", revisionIdValidator, validate, deleteRevision);

export default router;
