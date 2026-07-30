import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            maxlength: 50,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },
        color: {
            type: String,
            trim: true,
            default: "#64748b",
            maxlength: 20,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

tagSchema.index({ user: 1, slug: 1 }, { unique: true });
tagSchema.index({ user: 1, updatedAt: -1 });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
