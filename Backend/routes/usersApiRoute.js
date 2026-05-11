import express from "express";
import { isAuthenticated } from "../middleware/authenticated.js";
import { searchUsers } from "../Controllers/userController.js";

const router = express.Router();

router.get("/search", isAuthenticated, searchUsers);

export default router;
