import { ApiError } from "../utils/ApiError.js";

export const validate=(schema) => (req, res, next) => {
    
    const result= schema.safeParse(req.body || {});
    if (!result.success) {
        const errorMessages = result.error.issues && Array.isArray(result.error.issues)
            ? result.error.issues.map(err => err.message).join(", ")
            : 'Validation failed';
        return next(new ApiError(400, errorMessages));
    }
    req.body=result.data;
    next();
};