import express from 'express'
import { editProfile, followUser, getAllUsers, getByUsername, getProfile, login, logout, searchUser, signup } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
const router= express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout', isAuthenticated,logout)
router.put('/editProfile', isAuthenticated,upload.single('profilePicture'),editProfile)
router.get('/',isAuthenticated, getProfile)
router.get('/search',isAuthenticated, searchUser)
router.get('/users',isAuthenticated, getAllUsers)
router.get('/:username',isAuthenticated, getByUsername)
router.post('/follow/:followingId',isAuthenticated, followUser)
export default router;