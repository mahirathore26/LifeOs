import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.resolve("public/temp"));
    },
    filename(req, file, cb) {
        const extension = path.extname(file.originalname);
        cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024,
    },
});

export default upload;
