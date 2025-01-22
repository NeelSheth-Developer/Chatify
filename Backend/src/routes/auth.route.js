import express from 'express';
import {signup, login, logout,updateProfile,checkAuth} from '../controllers/auth.controller.js';
import { sanitizeRequest } from '../lib/Validator/apiValidator.js';
import { validateSignup, validateLogin } from '../lib/Validator/authValidator.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', sanitizeRequest, validateSignup, signup);
router.post('/login', sanitizeRequest, validateLogin, login); 
router.post('/logout', logout);
router.put('/update-profile',protectedRoute,updateProfile);
router.get("/check",protectedRoute,checkAuth);
export default router;