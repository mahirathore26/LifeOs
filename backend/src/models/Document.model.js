import mongoose from "mongoose";

const documentFileSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        publicId: {
            type: String,
            required: true,
            trim: true,
        },
        resourceType: {
            type: String,
            required: true,
            trim: true,
        },
        format: {
            type: String,
            default: "",
            trim: true,
        },
        bytes: {
            type: Number,
            required: true,
            min: 0,
        },
        originalName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        extension: {
            type: String,
            default: "",
            trim: true,
            maxlength: 20,
        },
        mimeType: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
    },
    {
        _id: false,
    }
);

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
            index: true,
        },
        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000,
        },
        file: {
            type: documentFileSchema,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

documentSchema.index({
    user: 1,
    project: 1,
    updatedAt: -1,
});

documentSchema.index({
    title: "text",
    description: "text",
    "file.originalName": "text",
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
