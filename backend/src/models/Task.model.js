import mongoose from "mongoose";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/index.js";

const taskSchema = new mongoose.Schema(
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
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000,
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
        status: {
            type: String,
            enum: Object.values(TASK_STATUS),
            default: TASK_STATUS.TODO,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(TASK_PRIORITY),
            default: TASK_PRIORITY.MEDIUM,
            index: true,
        },
        dueDate: {
            type: Date,
            default: null,
            index: true,
        },
        completedAt: {
            type: Date,
            default: null,
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

taskSchema.index({
    user: 1,
    project: 1,
    isDeleted: 1,
    status: 1,
    priority: 1,
    dueDate: 1,
    updatedAt: -1,
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
