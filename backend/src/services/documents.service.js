import path from "path";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import Document from "../models/Document.model.js";
import pick from "../utils/pick.js";
import {
    buildPaginationResponse,
    getPagination,
} from "../utils/pagination.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../config/cloudinary.js";
import { ensureProjectReferenceForUser } from "./projects.service.js";

const allowedDocumentFields = [
    "project",
    "title",
    "description",
];

const buildDocumentFilters = (userId, query = {}) => {
    const filters = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.project) {
        if (!mongoose.isValidObjectId(query.project)) {
            throw new ApiError(400, "Invalid project ID format");
        }
        filters.project = new mongoose.Types.ObjectId(query.project);
    }

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");

        filters.$or = [
            { title: regex },
            { description: regex },
            { "file.originalName": regex },
        ];
    }

    return filters;
};

const buildDocumentFileMetadata = (file, cloudinaryResponse) => ({
    url: cloudinaryResponse.secure_url,
    publicId: cloudinaryResponse.public_id,
    resourceType: cloudinaryResponse.resource_type,
    format: cloudinaryResponse.format || "",
    bytes: cloudinaryResponse.bytes,
    originalName: file.originalname,
    extension: path.extname(file.originalname).replace(".", "").toLowerCase(),
    mimeType: file.mimetype,
});

const findOwnedDocument = async (userId, documentId) => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw new ApiError(400, "Invalid document ID format");
    }

    const document = await Document.findOne({
        _id: documentId,
        user: userId,
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    return document;
};

const uploadDocumentFile = async (file) => {
    if (!file?.path) {
        throw new ApiError(400, "Document file is required");
    }

    const cloudinaryResponse = await uploadOnCloudinary(
        file.path,
        "lifeos/documents"
    );

    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload document");
    }

    return buildDocumentFileMetadata(file, cloudinaryResponse);
};

export const createDocumentService = async (userId, payload, file) => {
    const documentPayload = pick(payload, allowedDocumentFields);

    await ensureProjectReferenceForUser(userId, documentPayload.project);

    const uploadedFile = await uploadDocumentFile(file);

    const document = await Document.create({
        user: userId,
        ...documentPayload,
        file: uploadedFile,
    });

    return document;
};

export const getDocumentsService = async (userId, query) => {
    const filters = buildDocumentFilters(userId, query);
    const { page, limit, skip } = getPagination(query);

    const [documents, totalDocuments] = await Promise.all([
        Document.find(filters)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Document.countDocuments(filters),
    ]);

    return buildPaginationResponse({
        data: documents,
        totalDocuments,
        page,
        limit,
    });
};

export const getDocumentByIdService = async (userId, documentId) =>
    findOwnedDocument(userId, documentId);

export const updateDocumentService = async (
    userId,
    documentId,
    payload,
    file
) => {
    const document = await findOwnedDocument(userId, documentId);
    const updates = pick(payload, allowedDocumentFields);

    await ensureProjectReferenceForUser(userId, updates.project);

    Object.assign(document, updates);

    if (file?.path) {
        const oldPublicId = document.file.publicId;
        const uploadedFile = await uploadDocumentFile(file);

        document.file = uploadedFile;
        await document.save();
        await deleteFromCloudinary(oldPublicId);

        return document;
    }

    await document.save();

    return document;
};

export const deleteDocumentService = async (userId, documentId) => {
    const document = await findOwnedDocument(userId, documentId);

    await Promise.all([
        Document.deleteOne({ _id: document._id }),
        deleteFromCloudinary(document.file.publicId),
    ]);
};
