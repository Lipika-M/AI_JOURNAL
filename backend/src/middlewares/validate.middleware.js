import { ApiError } from "../utils/ApiError.js";

export const validate=(schema) => (req, res, next) => {
    const result= schema.safeParse(req.body);
    if (!result.success) {
        const errorMessages = result.error.errors.map(err => err.message).join(", ");
        throw new ApiError(400, errorMessages);
    }
    req.body=result.data;
    next();
};