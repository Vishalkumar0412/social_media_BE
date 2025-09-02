import express from 'express'

import isAuthenticated from '../middlewares/isAuthenticated.js';
// import {  createPost, deletePost, getAllPofilePost, getFeed, likeOnComment, postComment, replyOnComment, toggleLikePost } from '../controllers/post.controller.js';
import upload from '../middlewares/multer.js';
import { createPost, deletePost, getAllProfilePost, getComments, getFeed, likeOnComment, postComment, replyOnComment, toggleLikePost } from '../controllers/post.controller.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
const router= express.Router()

router.post('/',isAuthenticated,roleMiddleware(['USER']),upload.single("image"), createPost)
router.delete('/:id',roleMiddleware(['USER']),isAuthenticated,deletePost)
router.get('/',isAuthenticated,roleMiddleware(['USER']),getAllProfilePost)
router.get('/feed',isAuthenticated,roleMiddleware(['USER']),getFeed)
router.put('/like/:postId',isAuthenticated,roleMiddleware(['USER']),toggleLikePost)
router.post('/comment/:postId',isAuthenticated,roleMiddleware(['USER']),postComment)
router.post('/like-on-comment/:commentId',isAuthenticated,roleMiddleware(['USER']),likeOnComment)
router.post('/reply-on-comment/:commentId',isAuthenticated,roleMiddleware(['USER']),replyOnComment)
router.get('/comments/:postId',isAuthenticated,roleMiddleware(['USER']),getComments)

export default router;
