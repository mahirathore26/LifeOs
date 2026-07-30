import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { globalSearch } from "../controllers/search.controller.js";
import { globalSearchValidator } from "../validators/search.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", globalSearchValidator, validate, globalSearch);

export default router;
