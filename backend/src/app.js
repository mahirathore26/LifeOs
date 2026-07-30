import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import documentsRouter from "./routes/documents.routes.js";
import notesRouter from "./routes/notes.routes.js";
import projectsRouter from "./routes/projects.routes.js";
import searchRouter from "./routes/search.routes.js";
import tagsRouter from "./routes/tags.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import learningRouter from "./routes/learning.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(
    express.static("public")
);

app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/tags", tagsRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/learning", learningRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
