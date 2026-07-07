import { Router } from 'express';
import { getAllPortfolio, getPortfolioBySlug, createPortfolio, updatePortfolio, deletePortfolio } from '../controllers/portfolioController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllPortfolio);
router.get('/:slug', getPortfolioBySlug);
router.post('/', authenticate, authorizeAdmin, setUploadType('portfolio'), upload.single('cover_image'), createPortfolio);
router.put('/:id', authenticate, authorizeAdmin, setUploadType('portfolio'), upload.single('cover_image'), updatePortfolio);
router.delete('/:id', authenticate, authorizeAdmin, deletePortfolio);

export default router;
