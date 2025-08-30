import express from 'express'
import userRoutes from './user.routes.js'
import postRoutes from './post.routes.js'
import chatRoutes from './chat.routes.js'
const router= express.Router()

router.use('/user',userRoutes)
router.use('/post',postRoutes)
router.use('/chat',chatRoutes)
export default router;