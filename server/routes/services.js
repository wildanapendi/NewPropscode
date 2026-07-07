import { Router } from 'express';
import { getAllServices, getServiceBySlug, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);
router.post('/', authenticate, authorizeAdmin, createService);
router.put('/:id', authenticate, authorizeAdmin, updateService);
router.delete('/:id', authenticate, authorizeAdmin, deleteService);

export default router;
