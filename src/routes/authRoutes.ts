import express from 'express';
import cors from 'cors';
import { register, login, logout, validateRegister, validateLogin, resetPassword, updatePasswordWithToken } from '../controller/authControllers';


const router = express.Router();

router.use(cors());

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/resetPassword', resetPassword);
router.post('/updatePasswordWithToken', updatePasswordWithToken); // Change this line

export default router;