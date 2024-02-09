import { Router } from 'express';
import {
    getAllPosts,
    getPostById,
    getPostsByUserId,
    createPost,
    updatePost,
    deletePost,
} from '../controllers/post';
import authMiddleware from '../common/auth_middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the list of posts
 */
router.get('/', authMiddleware, getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the post with the specified ID
 *       404:
 *         description: Post not found
 */
router.get('/:id', authMiddleware, getPostById);

/**
 * @swagger
 * /posts/user/{id}:
 *   get:
 *     summary: Get posts by user ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the posts for the specified user ID
 *       404:
 *         description: Posts not found
 */
router.get('/user/:id', authMiddleware, getPostsByUserId);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IPost'
 *     responses:
 *       201:
 *         description: Returns the created post
 *       500:
 *         description: Internal Server Error
 */
router.post('/', authMiddleware, createPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IPost'
 *     responses:
 *       200:
 *         description: Returns the updated post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', authMiddleware, updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the deleted post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', authMiddleware, deletePost);

export default router;
