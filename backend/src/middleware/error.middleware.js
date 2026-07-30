import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
    console.error(err);

    error = new ApiError(
        err.statusCode || 500,
        err.message || "Internal Server Error"
    );
}

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        error = new ApiError(
            400,
            "Validation failed",
            Object.values(err.errors).map((item) => item.message)
        );
    }

    // Invalid Mongo ObjectId
    if (err.name === "CastError") {
        error = new ApiError(400, "Invalid resource id");
    }

    // Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        error = new ApiError(
            409,
            `${field} already exists`
        );
    }

    // JWT
    if (err.name === "JsonWebTokenError") {
        error = new ApiError(401, "Invalid token");
    }

    if (err.name === "TokenExpiredError") {
        error = new ApiError(401, "Token expired");
    }

    return res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV !== "production" && {
            stack: err.stack,
        }),
    });
};

export default errorHandler;