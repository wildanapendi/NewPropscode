import { Router } from 'express';
import { getAllPosts, getPostBySlug, createPost, updatePost, deletePost } from '../controllers/blogController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticate, authorizeAdmin, setUploadType('blog'), upload.single('cover_image'), createPost);
router.put('/:id', authenticate, authorizeAdmin, setUploadType('blog'), upload.single('cover_image'), updatePost);
router.delete('/:id', authenticate, authorizeAdmin, deletePost);

export default router;
