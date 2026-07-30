import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    assignTagToResource,
    createTag,
    deleteTag,
    getTags,
    renameTag,
} from "../controllers/tags.controller.js";
import {
    assignTagValidator,
    createTagValidator,
    renameTagValidator,
    tagIdValidator,
} from "../validators/tags.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getTags);
router.post("/", createTagValidator, validate, createTag);
router.patch("/:id", renameTagValidator, validate, renameTag);
router.delete("/:id", tagIdValidator, validate, deleteTag);
router.post("/:id/assign", assignTagValidator, validate, assignTagToResource);

export default router;
