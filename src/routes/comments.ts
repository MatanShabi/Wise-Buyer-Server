import { Router } from 'express';
import {
    addCommentToPost,
    getCommentsSpecificPost,
} from '../controllers/comment';
import authMiddleware from '../common/auth_middleware';

const router = Router();

router.get('/:id', authMiddleware, getCommentsSpecificPost);

router.post('/:id', authMiddleware, addCommentToPost);

export default router;
