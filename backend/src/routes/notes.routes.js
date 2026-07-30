import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    archiveNote,
    createNote,
    deleteNote,
    getNoteById,
    getNotes,
    pinNote,
    restoreNote,
    unarchiveNote,
    unpinNote,
    updateNote,
} from "../controllers/notes.controller.js";
import {
    createNoteValidator,
    listNotesValidator,
    noteIdValidator,
    updateNoteValidator,
} from "../validators/notes.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", listNotesValidator, validate, getNotes);
router.post("/", createNoteValidator, validate, createNote);
router.get("/:id", noteIdValidator, validate, getNoteById);
router.patch("/:id", updateNoteValidator, validate, updateNote);
router.delete("/:id", noteIdValidator, validate, deleteNote);
router.patch("/:id/restore", noteIdValidator, validate, restoreNote);
router.patch("/:id/archive", noteIdValidator, validate, archiveNote);
router.patch("/:id/unarchive", noteIdValidator, validate, unarchiveNote);
router.patch("/:id/pin", noteIdValidator, validate, pinNote);
router.patch("/:id/unpin", noteIdValidator, validate, unpinNote);

export default router;
