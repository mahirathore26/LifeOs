import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
            required: [true, "Title is required"],
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            trim: true,
            default: "",
            maxlength: 20000,
        },
        tags: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag",
                },
            ],
            default: [],
            index: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
            index: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

noteSchema.index({
    user: 1,
    project: 1,
    isDeleted: 1,
    isArchived: 1,
    isPinned: -1,
    updatedAt: -1,
});

noteSchema.index({
    title: "text",
    content: "text",
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
