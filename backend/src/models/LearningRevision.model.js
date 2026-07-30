import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        resource: { type: mongoose.Schema.Types.ObjectId, ref: "LearningResource", required: true, index: true },
        scheduledAt: { type: Date, required: true, index: true },
        dueAt: { type: Date, default: null },
        intervalDays: { type: Number, default: 1 },
        repetitions: { type: Number, default: 0 },
        easinessFactor: { type: Number, default: 2.5 },
        isDone: { type: Boolean, default: false, index: true },
        lastReviewedAt: { type: Date, default: null },
        note: { type: String, trim: true, default: "" },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

revisionSchema.index({ user: 1, scheduledAt: 1, isDone: 1 });

const LearningRevision = mongoose.model("LearningRevision", revisionSchema);

export default LearningRevision;
