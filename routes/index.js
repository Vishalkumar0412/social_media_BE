import express from 'express'
import userRoutes from './user.routes.js'
import postRoutes from './post.routes.js'
import chatRoutes from './chat.routes.js'
import adminRoutes from './admin.routes.js'
const router= express.Router()

router.use('/user',userRoutes)
router.use('/post',postRoutes)
router.use('/chat',chatRoutes)
router.use('/admin',adminRoutes)
export default router;