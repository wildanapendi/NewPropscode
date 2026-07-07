import { Router } from 'express';
import { getAllMembers, getMemberById, createMember, updateMember, deleteMember } from '../controllers/teamController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllMembers);
router.get('/:id', getMemberById);
router.post('/', authenticate, authorizeAdmin, setUploadType('team'), upload.single('photo'), createMember);
router.put('/:id', authenticate, authorizeAdmin, setUploadType('team'), upload.single('photo'), updateMember);
router.delete('/:id', authenticate, authorizeAdmin, deleteMember);

export default router;
