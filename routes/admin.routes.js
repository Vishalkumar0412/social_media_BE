import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { deleteUser, fetchAdmins, fetchUsers, loginAdmin } from '../controllers/admin.controllers.js';

const router= express.Router()

router.post('/login',loginAdmin)
router.get('/',isAuthenticated,roleMiddleware(["ADMIN"]),fetchUsers)
router.get('/admins',isAuthenticated,roleMiddleware(["ADMIN"]),fetchAdmins)
router.post('/login',isAuthenticated,roleMiddleware(["ADMIN"]),deleteUser)
router.post("/create-admin",isAuthenticated,roleMiddleware(["SUPER-ADMIN"]),)
export default router;