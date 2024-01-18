import express from "express";
const router = express.Router();
import likeController from "../controllers/like";
import authMiddleware from "../common/auth_middleware";

router.post("/", authMiddleware, likeController.post.bind(likeController));

export default router;
