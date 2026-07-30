import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000,
        },
        color: {
            type: String,
            trim: true,
            default: "#2563eb",
            maxlength: 20,
        },
        icon: {
            type: String,
            trim: true,
            default: "folder",
            maxlength: 50,
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

projectSchema.index({
    user: 1,
    isArchived: 1,
    updatedAt: -1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
