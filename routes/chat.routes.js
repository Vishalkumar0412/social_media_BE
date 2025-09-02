import express from 'express'
import { fetchChat, fetchChatHistory, sendMedia } from '../controllers/chat.controller.js'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import upload from '../middlewares/multer.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
// import isAuthenticated from '../middlewares/isAuthenticated'
// import upload from '../middlewares/multer'
const router =express.Router()
// router.get('/:userId/:otherId',isAuthenticated,showChat)
router.post('/upload',isAuthenticated,roleMiddleware(['USER']),upload.single('file'),sendMedia)
router.get('/fetch/:receiverId',isAuthenticated,roleMiddleware(['USER']),fetchChat)
router.get('/fetch',isAuthenticated,roleMiddleware(['USER']),fetchChatHistory)

export default router
