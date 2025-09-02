import express from 'express'
import { editProfile, followUser, getAllUsers, getByUsername, getProfile, login, logout, searchUser, signup } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
const router= express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout', isAuthenticated,roleMiddleware(['USER',"ADMIN","SUPER-ADMIN"]), logout)
router.put('/editProfile', isAuthenticated,upload.single('profilePicture'),roleMiddleware(['USER']),editProfile)
router.get('/',isAuthenticated,roleMiddleware(['USER',"ADMIN","SUPER-ADMIN"]), getProfile)
router.get('/search',isAuthenticated,roleMiddleware(['USER']), searchUser)
router.get('/users',isAuthenticated,roleMiddleware(['USER']), getAllUsers)
router.get('/:username',isAuthenticated,roleMiddleware(['USER']), getByUsername)
router.post('/follow/:followingId',isAuthenticated,roleMiddleware(['USER']), followUser)
export default router;