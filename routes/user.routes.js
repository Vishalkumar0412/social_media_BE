import express from 'express'
import { getProfile, login, logout, signup } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
const router= express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout', isAuthenticated,logout)
router.get('/',isAuthenticated, getProfile)
export default router;