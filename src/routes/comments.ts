import { Router } from 'express';
import {
    addCommentToPost,
    getCommentsSpecificPost,
} from '../controllers/comment';
import authMiddleware from '../common/auth_middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API for comments on posts
 */

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with comments
 *         content:
 *           application/json:
 *             example:
 *               - _id: "123"
 *                 text: "This is a comment"
 *                 user: { _id: "456", firstName: "John", lastName: "Doe", pictureUrl: "http://example.com/johndoe.jpg" }
 *               - ...
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.get('/:id', authMiddleware, getCommentsSpecificPost);

/**
 * @swagger
 * /comments/{id}:
 *   post:
 *     summary: Add a comment to a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Comment object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/IComment'
 *     responses:
 *       200:
 *         description: Successful response with the created comment
 *         content:
 *           application/json:
 *             example:
 *               _id: "123"
 *               text: "This is a new comment"
 *               user: { _id: "456", firstName: "Jane", lastName: "Doe", pictureUrl: "http://example.com/janedoe.jpg" }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.post('/:id', authMiddleware, addCommentToPost);

export default router;