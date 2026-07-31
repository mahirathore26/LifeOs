import Tag from "../models/Tag.model.js";
import Note from "../models/Note.model.js";
import Task from "../models/Task.model.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);

const buildUniqueSlug = async (userId, name, excludeId = null) => {
    const baseSlug = slugify(name);

    if (!baseSlug) {
        throw new ApiError(400, "Tag name is invalid");
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existingTag = await Tag.findOne({
            user: userId,
            slug,
            ...(excludeId && { _id: { $ne: excludeId } }),
        }).select("_id");

        if (!existingTag) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
};

const findOwnedTag = async (userId, tagId) => {
    if (!mongoose.isValidObjectId(tagId)) {
        throw new ApiError(400, "Invalid tag id");
    }

    const tag = await Tag.findOne({
        _id: tagId,
        user: userId,
    });

    if (!tag) {
        throw new ApiError(404, "Tag not found");
    }

    return tag;
};

const buildUsageMap = async (userId, tagIds) => {
    const [noteUsage, taskUsage] = await Promise.all([
        Note.aggregate([
            {
                $match: {
                    user: userId,
                    isDeleted: false,
                    tags: { $in: tagIds },
                },
            },
            { $unwind: "$tags" },
            { $match: { tags: { $in: tagIds } } },
            { $group: { _id: "$tags", notesCount: { $sum: 1 } } },
        ]),
        Task.aggregate([
            {
                $match: {
                    user: userId,
                    isDeleted: false,
                    tags: { $in: tagIds },
                },
            },
            { $unwind: "$tags" },
            { $match: { tags: { $in: tagIds } } },
            { $group: { _id: "$tags", tasksCount: { $sum: 1 } } },
        ]),
    ]);

    const usageMap = new Map();

    for (const item of noteUsage) {
        usageMap.set(String(item._id), {
            notesCount: item.notesCount,
            tasksCount: 0,
        });
    }

    for (const item of taskUsage) {
        const key = String(item._id);
        const current = usageMap.get(key) || {
            notesCount: 0,
            tasksCount: 0,
        };

        current.tasksCount = item.tasksCount;
        usageMap.set(key, current);
    }

    return usageMap;
};

const withUsageCounts = async (userId, tags) => {
    const tagList = Array.isArray(tags) ? tags : [tags];
    const usageMap = await buildUsageMap(
        userId,
        tagList.map((tag) => tag._id)
    );

    const data = tagList.map((tag) => {
        const usage = usageMap.get(String(tag._id)) || {
            notesCount: 0,
            tasksCount: 0,
        };

        const tagObject = tag.toObject ? tag.toObject() : tag;

        return {
            ...tagObject,
            usage: {
                notesCount: usage.notesCount,
                tasksCount: usage.tasksCount,
                totalCount: usage.notesCount + usage.tasksCount,
            },
        };
    });

    return Array.isArray(tags) ? data : data[0];
};

const findOwnedResource = async (userId, resourceType, resourceId) => {
   if (!["note", "task"].includes(resourceType)) {
    throw new ApiError(400, "Invalid resource type");
}
const Model = resourceType === "note" ? Note : Task;
    const resourceName = resourceType === "note" ? "Note" : "Task";
    

    const resource = await Model.findOne({
        _id: resourceId,
        user: userId,
        isDeleted: false,
        
    });

    if (!resource) {
        throw new ApiError(404, `${resourceName} not found`);
    }

    return resource;
};

export const createTagService = async (userId, payload) => {
    const slug = await buildUniqueSlug(userId, payload.name);

    const tag = await Tag.create({
        user: userId,
        name: payload.name.trim(),
        slug,
        ...(payload.color && { color: payload.color }),
    });

    return withUsageCounts(userId, tag);
};

export const getTagsService = async (userId) => {
    const tags = await Tag.find({ user: userId }).sort({
        updatedAt: -1,
        createdAt: -1,
    });

    return withUsageCounts(userId, tags);
};

export const renameTagService = async (userId, tagId, payload) => {
    const tag = await findOwnedTag(userId, tagId);

    tag.name = payload.name.trim();
    tag.slug = await buildUniqueSlug(userId, payload.name, tag._id);

    if (payload.color !== undefined) {
        tag.color = payload.color;
    }

    await tag.save();

    return withUsageCounts(userId, tag);
};

export const deleteTagService = async (userId, tagId) => {
    await findOwnedTag(userId, tagId);

    await Promise.all([
        Tag.deleteOne({ _id: tagId, user: userId }),
        Note.updateMany(
            { user: userId },
            { $pull: { tags: tagId } }
        ),
        Task.updateMany(
            { user: userId },
            { $pull: { tags: tagId } }
        ),
    ]);
};

export const assignTagToResourceService = async (
    userId,
    tagId,
    resourceType,
    resourceId
) => {
    await findOwnedTag(userId, tagId);
    const resource = await findOwnedResource(userId, resourceType, resourceId);

    if (!resource.tags.some((item) => String(item) === String(tagId))) {
        resource.tags.push(tagId);
        await resource.save();
    }

    return withUsageCounts(userId, await findOwnedTag(userId, tagId));
};
