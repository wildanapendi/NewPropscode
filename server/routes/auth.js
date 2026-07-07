import { Router } from 'express';
import { register, login, getMe, updateProfile, updateAccount } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, setUploadType('avatars'), upload.single('avatar'), updateProfile);
router.put('/update-account', authenticate, updateAccount);


export default router;
