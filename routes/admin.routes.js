import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { 
  createAdmin, 
  editAdmin,
  deleteUserDirectly, 
  fetchAdmins, 
  fetchUsers, 
  loginAdmin,
  requestUserDeletion,
  getPendingDeletionRequests,
  handleDeletionRequest,
  requestPostDeletion,
  getPendingPostDeletionRequests,
  handlePostDeletionRequest,
  getAllPostsForAdmin
} from '../controllers/admin.controller.js';
import { deletePostDirectly } from '../controllers/admin.controller.js';

const router = express.Router();

// Authentication
router.post('/login', loginAdmin);

// User management
router.get('/users', isAuthenticated, roleMiddleware(["ADMIN", "SUPER-ADMIN"]), fetchUsers);
router.get('/admins', isAuthenticated, roleMiddleware(["ADMIN", "SUPER-ADMIN"]), fetchAdmins);

// Admin can only request user deletion
router.post('/request-user-deletion/:id', isAuthenticated, roleMiddleware(["ADMIN"]), requestUserDeletion);

// Super Admin specific routes
router.post('/create-admin', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), createAdmin);
router.put('/edit-admin/:id', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), editAdmin);
router.delete('/delete-user/:id', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), deleteUserDirectly);

// Super Admin - User deletion approval system
router.get('/pending-user-deletions', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), getPendingDeletionRequests);
router.patch('/handle-user-deletion/:requestId', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), handleDeletionRequest);

// Post management
router.get('/posts', isAuthenticated, roleMiddleware(["ADMIN", "SUPER-ADMIN"]), getAllPostsForAdmin);
router.post('/request-post-deletion/:postId', isAuthenticated, roleMiddleware(["ADMIN"]), requestPostDeletion);
router.delete('/post-deletion/:postId', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), deletePostDirectly);

// Super Admin - Post deletion approval system
router.get('/pending-post-deletions', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), getPendingPostDeletionRequests);
router.patch('/handle-post-deletion/:requestId', isAuthenticated, roleMiddleware(["SUPER-ADMIN"]), handlePostDeletionRequest);


// super admin can directly delte the post 

export default router;