import { asyncHandler } from "../utils/asyncHandler.js";

const createJournal = asyncHandler(async (req, res) => {
    const {content}=req.body;
    if(!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }
    
});

export {createJournal}