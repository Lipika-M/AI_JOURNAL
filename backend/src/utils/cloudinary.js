import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    let response = null;

    try {
        if (!localFilePath) return null;

        response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
        });
    } catch (error) {
        response = null;
    } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("Failed to remove temp file:", localFilePath);
            }
        }
    }

    return response;
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;

    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });
    } catch (error) {
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };