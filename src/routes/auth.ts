import {Router} from "express";
import authController from "../controllers/auth";

const router = Router();
/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/


/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - password
*       properties:
*         email:
*           type: string
*           description: The user email
*         password:
*           type: string
*           description: The user password
*       example:
*         email: 'bob@gmail.com'
*         password: '123456'
*/

/**
* @swagger
* /auth/register:
*   post:
*     summary: registers a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: The new user
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*/
router.post("/register", authController.register);

/**
* @swagger
* components:
*   schemas:
*     Tokens:
*       type: object
*       required:
*         - accessToken
*         - refreshToken
*       properties:
*         accessToken:
*           type: string
*           description: The JWT access token
*         refreshToken:
*           type: string
*           description: The JWT refresh token
*       example:
*         accessToken: '123cd123x1xx1'
*         refreshToken: '134r2134cr1x3c'
*/


/**
* @swagger
* /auth/login:
*   post:
*     summary: registers a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: The acess & refresh tokens
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Tokens'
*/
router.post("/login", authController.login);

/**
* @swagger
* /auth/logout:
*   get:
*     summary: logout a user
*     tags: [Auth]
*     description: need to provide the refresh token in the auth header
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: logout completed successfully
*/
router.get("/logout", authController.logout);


/**
* @swagger
* /auth/refresh:
*   post:
*     summary: Refresh Access Token
*     tags: [Auth]
*     description: Refresh the access token using a valid refresh token.
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: header
*         name: Authorization
*         required: true
*         schema:
*           type: string
*         description: Bearer token in the format "Bearer <refreshToken>"
*     responses:
*       200:
*         description: Successfully refreshed access token
*         content:
*           application/json:
*             example:
*               accessToken: <newAccessToken>
*               refreshToken: <newRefreshToken>
*       401:
*         description: Unauthorized
*         content:
*           application/json:
*             example:
*               message: Unauthorized
*               details: <Error details, if available>
*       500:
*         description: Internal Server Error
*         content:
*           application/json:
*             example:
*               message: Internal Server Error
*               details: <Error details, if available>
*/

router.get("/refresh", authController.refresh);

export default router;
