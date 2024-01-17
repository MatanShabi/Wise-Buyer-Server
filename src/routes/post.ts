import express from "express";
const router = express.Router();
import PostController from "../controllers/post";
import authMiddleware from "../common/auth_middleware";

router.get("/", PostController.get.bind(PostController));

router.get("/:id", PostController.getById.bind(PostController));

router.post("/", authMiddleware, PostController.post.bind(PostController));

router.put("/:id", authMiddleware, PostController.putById.bind(PostController));

router.delete("/:id", authMiddleware, PostController.deleteById.bind(PostController));

export default router;
