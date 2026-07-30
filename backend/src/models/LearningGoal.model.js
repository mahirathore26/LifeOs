import mongoose from "mongoose";

const learningGoalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 300 },
        description: { type: String, trim: true, default: "", maxlength: 5000 },
        targetDate: { type: Date, default: null, index: true },
        resources: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "LearningResource",
                },
            ],
            default: [],
        },
        isCompleted: { type: Boolean, default: false, index: true },
        completedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

learningGoalSchema.index({ user: 1, isDeleted: 1, targetDate: 1 });

const LearningGoal = mongoose.model("LearningGoal", learningGoalSchema);

export default LearningGoal;
