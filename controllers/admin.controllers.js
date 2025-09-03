import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import { generateToken } from "../utills/generateToken.js";
// import { UserDeletionRequest } from "../models/userDeletionRequest.model.js";
// import { PostDeletionRequest } from "../models/postDeletionRequest.model.js";
import { Post } from "../models/post.model.js";
import { UserDeletionRequest } from "../models/UserDeletionRequest.model.js";
import { PostDeletionRequest } from "../models/PostDeletionRequest .model.js";

export const fetchUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "USER" },
      attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture", "role", "createdAt"]
    });

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (error) {
    console.error("fetchUsers error:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      success: false,
    });
  }
};

export const fetchAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: "ADMIN" },
      attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture", "role", "createdAt"]
    });

    if (admins.length === 0) {
      return res.status(404).json({
        message: "No admins found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Admins fetched successfully",
      success: true,
      admins,
    });
  } catch (error) {
    console.error("fetchAdmins error:", error);
    return res.status(500).json({
      message: "Failed to fetch admins",
      success: false,
    });
  }
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({
        message: "Username or password wrong",
        success: false,
      });
    }

    if (!["ADMIN", "SUPER-ADMIN"].includes(user.role)) {
      return res.status(403).json({
        message: "You are not authorized to access admin panel",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Username or password wrong",
        success: false,
      });
    }

    generateToken(res, user, "Admin login successfully");
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// ADMIN: Request user deletion (requires Super Admin approval)
export const requestUserDeletion = async (req, res) => {
  const { id } = req.params;
  const requestedBy = req.user.id;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role !== "USER") {
      return res.status(400).json({
        message: "Cannot request deletion of admin users",
        success: false
      });
    }

    // Check if request already exists
    const existingRequest = await UserDeletionRequest.findOne({
      where: { userId: id, status: "PENDING" }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Deletion request already exists for this user",
        success: false
      });
    }

    const deletionRequest = await UserDeletionRequest.create({
      userId: id,
      requestedBy,
      reason: req.body.reason || "Admin requested deletion"
    });

    return res.status(201).json({
      message: "User deletion request submitted successfully",
      success: true,
      request: deletionRequest
    });
  } catch (error) {
    console.error("requestUserDeletion error:", error);
    return res.status(500).json({
      message: "Failed to submit deletion request",
      success: false,
    });
  }
};

// SUPER ADMIN: View all deletion requests
export const getPendingDeletionRequests = async (req, res) => {
  try {
    const requests = await UserDeletionRequest.findAll({
      where: { status: "PENDING" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture"]
        },
        {
          model: User,
          as: "requester",
          attributes: ["id", "username", "firstName", "lastName"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      message: "Deletion requests fetched successfully",
      success: true,
      requests
    });
  } catch (error) {
    console.error("getPendingDeletionRequests error:", error);
    return res.status(500).json({
      message: "Failed to fetch deletion requests",
      success: false,
    });
  }
};

// SUPER ADMIN: Approve/Reject deletion request
export const handleDeletionRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // "APPROVE" or "REJECT"
  const reviewedBy = req.user.id;

  try {
    const request = await UserDeletionRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "user"
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        message: "Deletion request not found",
        success: false
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "Request has already been processed",
        success: false
      });
    }

    if (action === "APPROVE") {
      // Delete the user
      await request.user.destroy();
      
      // Update request status
      request.status = "APPROVED";
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      await request.save();

      return res.status(200).json({
        message: "User deleted successfully",
        success: true
      });
    } else if (action === "REJECT") {
      request.status = "REJECTED";
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      await request.save();

      return res.status(200).json({
        message: "Deletion request rejected",
        success: true
      });
    } else {
      return res.status(400).json({
        message: "Invalid action. Use 'APPROVE' or 'REJECT'",
        success: false
      });
    }
  } catch (error) {
    console.error("handleDeletionRequest error:", error);
    return res.status(500).json({
      message: "Failed to process deletion request",
      success: false,
    });
  }
};

// SUPER ADMIN: Delete user directly (without approval)
export const deleteUserDirectly = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role === "SUPER-ADMIN") {
      return res.status(400).json({
        message: "Cannot delete Super Admin",
        success: false
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("deleteUserDirectly error:", error);
    return res.status(500).json({
      message: "Failed to delete user",
      success: false,
    });
  }
};

export const createAdmin = async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Admin with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN",
    });

    return res.status(201).json({
      message: "Admin created successfully",
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("createAdmin error:", error);
    return res.status(500).json({
      message: "Failed to create admin",
      success: false,
    });
  }
};

// SUPER ADMIN: Edit Admin
export const editAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, email, firstName, lastName, password } = req.body;

  try {
    const admin = await User.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        message: "Can only edit admin users",
        success: false,
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await admin.update(updateData);

    const updatedAdmin = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      message: "Admin updated successfully",
      success: true,
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("editAdmin error:", error);
    return res.status(500).json({
      message: "Failed to update admin",
      success: false,
    });
  }
};

// ADMIN: Request post deletion
export const requestPostDeletion = async (req, res) => {
  const { postId } = req.params;
  const requestedBy = req.user.id;

  try {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "firstName", "lastName"]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if request already exists
    const existingRequest = await PostDeletionRequest.findOne({
      where: { postId, status: "PENDING" }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Deletion request already exists for this post",
        success: false
      });
    }

    const deletionRequest = await PostDeletionRequest.create({
      postId,
      requestedBy,
      reason: req.body.reason || "Admin requested deletion"
    });

    return res.status(201).json({
      message: "Post deletion request submitted successfully",
      success: true,
      request: deletionRequest
    });
  } catch (error) {
    console.error("requestPostDeletion error:", error);
    return res.status(500).json({
      message: "Failed to submit post deletion request",
      success: false,
    });
  }
};

// SUPER ADMIN: Get pending post deletion requests
export const getPendingPostDeletionRequests = async (req, res) => {
  try {
    const requests = await PostDeletionRequest.findAll({
      where: { status: "PENDING" },
      include: [
        {
          model: Post,
          as: "post",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "firstName", "lastName"]
            }
          ]
        },
        {
          model: User,
          as: "requester",
          attributes: ["id", "username", "firstName", "lastName"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      message: "Post deletion requests fetched successfully",
      success: true,
      requests
    });
  } catch (error) {
    console.error("getPendingPostDeletionRequests error:", error);
    return res.status(500).json({
      message: "Failed to fetch post deletion requests",
      success: false,
    });
  }
};

// SUPER ADMIN: Handle post deletion request
export const handlePostDeletionRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // "APPROVE" or "REJECT"
  const reviewedBy = req.user.id;

  try {
    const request = await PostDeletionRequest.findByPk(requestId, {
      include: [
        {
          model: Post,
          as: "post"
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        message: "Post deletion request not found",
        success: false
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: "Request has already been processed",
        success: false
      });
    }

    if (action === "APPROVE") {
      // Delete the post
      await request.post.destroy();
      
      // Update request status
      request.status = "APPROVED";
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      await request.save();

      return res.status(200).json({
        message: "Post deleted successfully",
        success: true
      });
    } else if (action === "REJECT") {
      request.status = "REJECTED";
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      await request.save();

      return res.status(200).json({
        message: "Post deletion request rejected",
        success: true
      });
    } else {
      return res.status(400).json({
        message: "Invalid action. Use 'APPROVE' or 'REJECT'",
        success: false
      });
    }
  } catch (error) {
    console.error("handlePostDeletionRequest error:", error);
    return res.status(500).json({
      message: "Failed to process post deletion request",
      success: false,
    });
  }
};

// ADMIN: Get all posts with users (for viewing and requesting deletion)
export const getAllPostsForAdmin = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "firstName", "lastName", "email", "profilePicture"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts
    });
  } catch (error) {
    console.error("getAllPostsForAdmin error:", error);
    return res.status(500).json({
      message: "Failed to fetch posts",
      success: false,
    });
  }
};