import { Router } from 'express';
import { createOrder, getMyOrders, getOrderDetail, getAllOrders, updateOrderStatus, uploadOrderAsset, addOrderLink, deleteOrderLink, assignTeamMember, removeTeamAssignment, addOrderComment, deleteOrder } from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';

const router = Router();

// Client routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderDetail);
router.post('/:id/assets', authenticate, setUploadType('assets'), upload.single('file'), uploadOrderAsset);
router.post('/:id/links', authenticate, addOrderLink);
router.post('/:id/comments', authenticate, addOrderComment);
router.delete('/:id/links/:linkId', authenticate, deleteOrderLink);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.put('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);
router.delete('/:id', authenticate, authorizeAdmin, deleteOrder);
router.post('/:id/assign', authenticate, authorizeAdmin, assignTeamMember);
router.delete('/:id/assign/:memberId', authenticate, authorizeAdmin, removeTeamAssignment);

export default router;
