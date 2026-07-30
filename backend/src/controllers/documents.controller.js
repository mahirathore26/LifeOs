import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    createDocumentService,
    deleteDocumentService,
    getDocumentByIdService,
    getDocumentsService,
    updateDocumentService,
} from "../services/documents.service.js";

export const createDocument = asyncHandler(async (req, res) => {
    const document = await createDocumentService(req.user._id, req.body, req.file);

    return res.status(201).json(
        new ApiResponse(201, document, "Document uploaded successfully")
    );
});

export const getDocuments = asyncHandler(async (req, res) => {
    const result = await getDocumentsService(req.user._id, req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            result.data,
            "Documents fetched successfully",
            result.pagination
        )
    );
});

export const getDocumentById = asyncHandler(async (req, res) => {
    const document = await getDocumentByIdService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, document, "Document fetched successfully")
    );
});

export const updateDocument = asyncHandler(async (req, res) => {
    const document = await updateDocumentService(
        req.user._id,
        req.params.id,
        req.body,
        req.file
    );

    return res.status(200).json(
        new ApiResponse(200, document, "Document updated successfully")
    );
});

export const deleteDocument = asyncHandler(async (req, res) => {
    await deleteDocumentService(req.user._id, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Document deleted successfully")
    );
});
