import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteLocalFile = async (filePath) => {
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch {
        // Ignore cleanup errors.
    }
};

export const uploadOnCloudinary = async (
    localFilePath,
    folder = "lifeos"
) => {
    if (!localFilePath) {
        return null;
    }

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });

        await deleteLocalFile(localFilePath);

        return response;
    } catch (error) {
        await deleteLocalFile(localFilePath);
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return null;
    }

    return await cloudinary.uploader.destroy(publicId, {
        resource_type: "auto",
    });
};

export default cloudinary;