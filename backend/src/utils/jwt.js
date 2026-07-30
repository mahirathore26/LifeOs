import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";

export const signToken = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, {
        expiresIn,
    });
};

export const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
};

export const decodeToken = (token) => {
    return jwt.decode(token);
};