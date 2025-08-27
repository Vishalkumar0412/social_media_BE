import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { PostLike } from "../models/postLike.model.js";
import { CommentLike } from "../models/commentLike.model.js";
import User from "../models/user.model.js";
import { uploadMedia } from "../utills/cloudinary.js";
import sequelize from "../models/index.js";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!req.file && !content) {
      return res.status(400).json({
        message: "Please provide content or image",
        success: false,
      });
    }

    let imageUrl = null;

    if (req.file) {
      const uploadResponse = await uploadMedia(req.file.path);
      imageUrl = uploadResponse.secure_url;
    }

    const post = await Post.create({
      userId: req.user.id,
      image: imageUrl,
      content,
    });

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      message: "Failed to create post",
      success: false,
    });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  
  try {
    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });
    }

    await post.destroy();
    
    return res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      message: "Failed to delete the post",
      success: false,
    });
  }
};

export const getAllProfilePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const posts = await Post.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email", "username"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (posts.length === 0) {
      return res.status(404).json({
        message: "No posts found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return res.status(500).json({
      message: "Posts can't be fetched",
      success: false,
    });
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "firstName", "lastName"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "No posts available",
        success: false,
      });
    }

    return res.status(200).json({
      message: "All posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    return res.status(500).json({
      message: "Failed to fetch posts",
      success: false,
      error: error.message,
    });
  }
};

export const toggleLikePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required",
        success: false,
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({
      where: { userId, postId }
    });

    let message;
    if (existingLike) {
      // Unlike
      await existingLike.destroy({ transaction });
      await post.decrement('likeCount', { transaction });
      message = "Post unliked";
    } else {
      // Like
      await PostLike.create({ userId, postId }, { transaction });
      await post.increment('likeCount', { transaction });
      message = "Post liked";
    }

    await transaction.commit();

    // Fetch updated post
    const updatedPost = await Post.findByPk(postId);

    return res.status(200).json({
      success: true,
      message,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in toggleLikePost:", error.message);
    return res.status(500).json({
      message: "Failed to toggle like",
      success: false,
    });
  }
};

export const postComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { text } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User not authorized",
        success: false
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    const comment = await Comment.create({
      userId,
      text,
      postId,
    });

    return res.status(201).json({
      message: "Commented successfully",
      success: true,
      comment
    });
  } catch (error) {
    console.error("Post comment error:", error);
    return res.status(500).json({
      message: "Can't comment",
      success: false
    });
  }
};

export const likeOnComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User not authorized",
        success: false,
      });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment does not exist",
        success: false,
      });
    }

    // Check if already liked
    const existingLike = await CommentLike.findOne({
      where: { userId, commentId }
    });

    let message;
    if (existingLike) {
      // Unlike
      await existingLike.destroy({ transaction });
      await comment.decrement('likeCount', { transaction });
      message = "Comment unliked";
    } else {
      // Like
      await CommentLike.create({ userId, commentId }, { transaction });
      await comment.increment('likeCount', { transaction });
      message = "Comment liked";
    }

    await transaction.commit();

    // Fetch updated comment
    const updatedComment = await Comment.findByPk(commentId);

    return res.status(200).json({
      message,
      success: true,
      likeCount: updatedComment.likeCount,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in likeOnComment:", error);
    return res.status(500).json({
      message: "Can't like comment",
      success: false,
    });
  }
};

export const replyOnComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!commentId) {
      return res.status(400).json({
        message: "Comment not found",
        success: false,
      });
    }

    const parentComment = await Comment.findByPk(commentId);

    if (!parentComment) {
      return res.status(404).json({
        message: "Parent comment does not exist",
        success: false,
      });
    }

    // Create reply comment
    const nestedComment = await Comment.create({
      userId,
      text,
      postId: parentComment.postId,
      parentCommentId: commentId,
    });

    return res.status(201).json({
      message: "Reply added successfully",
      success: true,
      reply: nestedComment,
    });
  } catch (error) {
    console.error("Error in replyOnComment:", error);
    return res.status(500).json({
      message: "Can't reply to comment",
      success: false,
    });
  }
};
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required",
        success: false,
      });
    }

    // Find all comments for this post
    const comments = await Comment.findAll({
      where: { postId, parentCommentId: null }, // only top-level comments
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "username"],
        },
        {
          model: Comment,
          as: "replies", // requires association
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    return res.status(500).json({
      message: "Failed to fetch comments",
      success: false,
      error: error.message,
    });
  }
};

