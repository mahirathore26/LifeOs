export const DB_NAME = "lifeos";

export const USER_ROLES = Object.freeze({
    USER: "user",
    ADMIN: "admin",
});

export const TASK_PRIORITY = Object.freeze({
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
});

export const TASK_STATUS = Object.freeze({
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
});

export const PROJECT_STATUS = Object.freeze({
    PLANNING: "planning",
    ACTIVE: "active",
    ON_HOLD: "on_hold",
    COMPLETED: "completed",
});

export const LEARNING_RESOURCE_TYPES = Object.freeze({
    ARTICLE: "article",
    VIDEO: "video",
    COURSE: "course",
    BOOK: "book",
    WEBSITE: "website",
    OTHER: "other",
});

export const LEARNING_STATUS = Object.freeze({
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
});

export const COOKIE_NAMES = Object.freeze({
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
});
