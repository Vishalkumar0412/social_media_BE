import User from "./user.model.js";
import { Post } from "./post.model.js";
import { Comment } from "./comment.model.js";
import { PostLike } from "./postLike.model.js";
import { CommentLike } from "./commentLike.model.js";
import { UserFollower } from "./userFollower.model.js";
// import { UserDeletionRequest } from "./userDeletionRequest.model.js";
// import { PostDeletionRequest } from "./postDeletionRequest.model.js";
import Chat from "./chat.model.js";
import { PostDeletionRequest } from "./PostDeletionRequest .model.js";
import { UserDeletionRequest } from "./UserDeletionRequest.model.js";

// User-Post relationship
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

// User-Comment relationship
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Post-Comment relationship
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Comment self-referencing (replies)
Comment.hasMany(Comment, { foreignKey: "parentCommentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentCommentId", as: "parentComment" });

// Post Likes (Many-to-Many through PostLike)
User.belongsToMany(Post, { through: PostLike, foreignKey: "userId", as: "likedPosts" });
Post.belongsToMany(User, { through: PostLike, foreignKey: "postId", as: "likedByUsers" });

// Comment Likes (Many-to-Many through CommentLike)
User.belongsToMany(Comment, { through: CommentLike, foreignKey: "userId", as: "likedComments" });
Comment.belongsToMany(User, { through: CommentLike, foreignKey: "commentId", as: "likedByUsers" });

// User Followers (Many-to-Many through UserFollower)
User.belongsToMany(User, { 
  through: UserFollower, 
  foreignKey: "followerId", 
  otherKey: "followingId", 
  as: "following" 
});
User.belongsToMany(User, { 
  through: UserFollower, 
  foreignKey: "followingId", 
  otherKey: "followerId", 
  as: "followers" 
});

// Chat relationships
User.hasMany(Chat, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Chat, { foreignKey: "receiverId", as: "receivedMessages" });
Chat.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Chat.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

// User Deletion Request relationships
User.hasMany(UserDeletionRequest, { foreignKey: "userId", as: "deletionRequests" });
User.hasMany(UserDeletionRequest, { foreignKey: "requestedBy", as: "requestedDeletions" });
User.hasMany(UserDeletionRequest, { foreignKey: "reviewedBy", as: "reviewedDeletions" });

UserDeletionRequest.belongsTo(User, { foreignKey: "userId", as: "user" });
UserDeletionRequest.belongsTo(User, { foreignKey: "requestedBy", as: "requester" });
UserDeletionRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// Post Deletion Request relationships
Post.hasMany(PostDeletionRequest, { foreignKey: "postId", as: "deletionRequests" });
User.hasMany(PostDeletionRequest, { foreignKey: "requestedBy", as: "requestedPostDeletions" });
User.hasMany(PostDeletionRequest, { foreignKey: "reviewedBy", as: "reviewedPostDeletions" });

PostDeletionRequest.belongsTo(Post, { foreignKey: "postId", as: "post" });
PostDeletionRequest.belongsTo(User, { foreignKey: "requestedBy", as: "requester" });
PostDeletionRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

export {
  User,
  Post,
  Comment,
  PostLike,
  CommentLike,
  UserFollower,
  UserDeletionRequest,
  PostDeletionRequest,
};