import express from 'express';
import { UserLogin, UserRegister } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', UserLogin);       
router.post('/register', UserRegister); 

export default router;
