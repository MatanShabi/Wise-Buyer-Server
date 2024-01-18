import express from "express";
const router = express.Router();
import likeController from "../controllers/like";
import authMiddleware from "../common/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: Like
 *   description: API for handling likes on posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - postId
 *         - mode
 *       properties:
 *         postId:
 *           type: string
 *           description: The ID of the post to like/unlike
 *         mode:
 *           type: integer
 *           description: The like mode (0 for Like, 1 for Unlike)
 *       example:
 *         postId: '60c4d3cf14a889001cbbc1b0'
 *         mode: 0
 */

/**
 * @swagger
 * /like:
 *   post:
 *     summary: Like/Unlike a post
 *     tags: [Like]
 *     description: Like or Unlike a post based on the provided parameters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Like'
 *     responses:
 *       201:
 *         description: Successfully liked/unliked the post
 *       400:
 *         description: Bad Request, incorrect like mode or missing parameters
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, likeController.post.bind(likeController));

export default router;
