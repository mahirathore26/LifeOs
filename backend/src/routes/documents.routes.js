import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
    createDocument,
    deleteDocument,
    getDocumentById,
    getDocuments,
    updateDocument,
} from "../controllers/documents.controller.js";
import {
    createDocumentValidator,
    documentIdValidator,
    listDocumentsValidator,
    updateDocumentValidator,
} from "../validators/documents.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", listDocumentsValidator, validate, getDocuments);
router.post(
    "/",
    upload.single("file"),
    createDocumentValidator,
    validate,
    createDocument
);
router.get("/:id", documentIdValidator, validate, getDocumentById);
router.patch(
    "/:id",
    upload.single("file"),
    updateDocumentValidator,
    validate,
    updateDocument
);
router.delete("/:id", documentIdValidator, validate, deleteDocument);

export default router;
