import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
	{
		startedAt: { type: Date, required: true, default: Date.now },
		endedAt: { type: Date, default: null },
		durationMinutes: { type: Number, default: 0 },
		notes: { type: String, trim: true, default: "" },
	},
	{ _id: true, versionKey: false }
);

const LearningResourceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: 300,
			index: true,
		},
		description: {
			type: String,
			trim: true,
			default: "",
			maxlength: 20000,
		},
		resourceType: {
			type: String,
			enum: ["Course", "Video", "Article", "Book", "Documentation", "Podcast", "Other"],
			default: "Other",
			index: true,
		},
		subject: { type: String, trim: true, default: null, index: true },
		topics: {
			type: [
				{
					title: { type: String, trim: true },
					completed: { type: Boolean, default: false },
				},
			],
			default: [],
		},
		progress: {
			type: String,
			enum: ["Not Started", "In Progress", "Completed"],
			default: "Not Started",
			index: true,
		},
		completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
		difficulty: {
			type: String,
			enum: ["Beginner", "Intermediate", "Advanced"],
			default: "Beginner",
			index: true,
		},
		priority: {
			type: String,
			enum: ["Low", "Medium", "High", "Critical"],
			default: "Medium",
			index: true,
		},
		estimatedDurationMinutes: { type: Number, default: 0 },
		timeSpentMinutes: { type: Number, default: 0 },
		sessions: { type: [SessionSchema], default: [] },
		sourceUrl: { type: String, trim: true, default: null },
		instructor: { type: String, trim: true, default: null, index: true },
		platform: { type: String, trim: true, default: null, index: true },
		personalNotes: { type: String, trim: true, default: "" },
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
		// relationships to other modules
		notes: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Note",
				},
			],
			default: [],
		},
		tasks: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Task",
				},
			],
			default: [],
		},
		documents: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Document",
				},
			],
			default: [],
		},
		attachments: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Document",
				},
			],
			default: [],
		},
		goals: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "LearningGoal",
				},
			],
			default: [],
		},
		// AI / semantic placeholders for future features
		ai: {
			embeddingGenerated: { type: Boolean, default: false },
			embeddingVersion: { type: String, default: null },
		},
		isFavorite: { type: Boolean, default: false, index: true },
		isDeleted: { type: Boolean, default: false, index: true },
		deletedAt: { type: Date, default: null },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

LearningResourceSchema.index({
	user: 1,
	isDeleted: 1,
	updatedAt: -1,
});

LearningResourceSchema.index({
	title: "text",
	description: "text",
	instructor: "text",
	platform: "text",
	subject: "text",
});

const LearningResource = mongoose.model("LearningResource", LearningResourceSchema);

export default LearningResource;

